import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const sizeByRatio: Record<string, string> = {
  '1:1': '1024x1024',
  '4:3': '1024x768',
  '3:4': '768x1024',
  '16:9': '1536x864',
};

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 30_000,
    keyPrefix: 'qwen-image-generate',
  });
  if (limited) return limited;

  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Sign in to generate an image.');

    const endpoint = process.env.QWEN_IMAGE_API_BASE_URL?.trim();
    const apiKey = process.env.QWEN_IMAGE_API_KEY?.trim();
    if (!endpoint) {
      return respErr(
        'Image generation is not configured yet. Set the server-side QWEN_IMAGE_API_BASE_URL to your Qwen Image 2.1 vLLM endpoint.'
      );
    }

    let body: { prompt?: unknown; ratio?: unknown };
    try {
      body = await request.json();
    } catch {
      return respErr('The request body must be valid JSON.');
    }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const ratio = typeof body.ratio === 'string' ? body.ratio : '';
    if (!prompt) return respErr('Enter a prompt before generating an image.');
    if (prompt.length > 5000)
      return respErr('Prompts must be 5,000 characters or fewer.');
    if (!sizeByRatio[ratio]) return respErr('Choose a supported image ratio.');

    let apiUrl: URL;
    try {
      apiUrl = new URL(endpoint);
    } catch {
      return respErr('The Qwen Image endpoint URL is invalid.');
    }
    if (!['http:', 'https:'].includes(apiUrl.protocol)) {
      return respErr('The Qwen Image endpoint must use HTTP or HTTPS.');
    }
    apiUrl.pathname = `${apiUrl.pathname.replace(/\/$/, '')}/v1/images/generations`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);
    let upstream: Response;
    try {
      upstream = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: process.env.QWEN_IMAGE_MODEL?.trim() || 'Qwen/Qwen-Image-2.1',
          prompt,
          size: sizeByRatio[ratio],
          n: 1,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return respErr('Image generation timed out. Please try again.');
      }
      return respErr(
        'Could not reach the Qwen Image service. Please try again later.'
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      return respErr(
        upstream.status === 429
          ? 'The image service is busy. Please try again shortly.'
          : 'The image service could not complete this prompt. Please try again.'
      );
    }
    const result = (await upstream.json().catch(() => null)) as {
      data?: Array<{ b64_json?: string; url?: string; content_type?: string }>;
    } | null;
    const image = result?.data?.[0];
    if (image?.b64_json) {
      const contentType = image.content_type || 'image/png';
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(contentType)) {
        return respErr(
          'The image service returned an unsupported image format.'
        );
      }
      return respData({
        image: `data:${contentType};base64,${image.b64_json}`,
      });
    }
    if (image?.url) {
      try {
        const imageUrl = new URL(image.url);
        if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error();
        return respData({ image: imageUrl.href });
      } catch {
        return respErr('The image service returned an invalid image URL.');
      }
    }
    return respErr('The image service returned no image. Please try again.');
  } catch {
    return respErr('Image generation failed unexpectedly. Please try again.');
  }
}

export const Route = createFileRoute('/api/qwen-image/generate')({
  server: { handlers: { POST } },
});
