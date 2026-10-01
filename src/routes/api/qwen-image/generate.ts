import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  getCreditCost,
  getImageSize,
  MAX_EDIT_INPUT_BYTES,
  MAX_EDIT_INPUT_IMAGES,
  MAX_IMAGES_PER_REQUEST,
  QWEN_IMAGE_MODELS,
  QWEN_IMAGE_RATIOS,
  type QwenImageMode,
  type QwenImageRatio,
  type QwenImageResolution,
} from '@/config/qwen-image';
import {
  AITaskStatus,
  createTask,
  setTaskProviderId,
  updateTask,
} from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { submitFalJob } from '@/modules/qwen-image/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const DATA_URI = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

function validEditImage(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DATA_URI.exec(value);
  if (!match) return false;
  return Math.floor((match[2].length * 3) / 4) <= MAX_EDIT_INPUT_BYTES;
}

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 3_000,
    keyPrefix: 'qwen-image-generate',
  });
  if (limited) return limited;

  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Sign in to generate an image.');

    const configs = await getAllConfigs();
    const apiKey = configs.fal_api_key?.trim();
    if (!apiKey) {
      return respErr(
        'Image generation is not configured yet. Add the Fal API key in Admin → Settings → AI.'
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return respErr('The request body must be valid JSON.');
    }

    const mode: QwenImageMode = body.mode === 'edit' ? 'edit' : 'generate';
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const resolution: QwenImageResolution =
      body.resolution === '2k' ? '2k' : '1k';
    const numImages = Number(body.numImages ?? 1);
    const ratio = body.ratio as QwenImageRatio;
    const aspect = Number(body.aspect);

    if (!prompt) return respErr('Enter a prompt before generating an image.');
    if (prompt.length > 5000)
      return respErr('Prompts must be 5,000 characters or fewer.');
    if (
      !Number.isInteger(numImages) ||
      numImages < 1 ||
      numImages > MAX_IMAGES_PER_REQUEST
    ) {
      return respErr(
        `Choose between 1 and ${MAX_IMAGES_PER_REQUEST} images per request.`
      );
    }
    const ratioOk =
      (QWEN_IMAGE_RATIOS as readonly string[]).includes(ratio) ||
      (mode === 'edit' && ratio === 'original');
    if (!ratioOk) return respErr('Choose a supported image ratio.');

    let imageUrls: string[] | undefined;
    if (mode === 'edit') {
      const images = Array.isArray(body.images) ? body.images : [];
      if (images.length < 1 || images.length > MAX_EDIT_INPUT_IMAGES) {
        return respErr(
          `Upload 1 to ${MAX_EDIT_INPUT_IMAGES} reference images to edit.`
        );
      }
      if (!images.every(validEditImage)) {
        return respErr('Reference images must be PNG, JPG or WebP, 10 MB max.');
      }
      imageUrls = images;
    }

    const model = QWEN_IMAGE_MODELS[mode];
    const costCredits = getCreditCost(resolution, numImages);

    let task: { id: string };
    try {
      task = await createTask({
        userId: session.user.id,
        mediaType: 'image',
        provider: 'fal',
        model,
        prompt,
        costCredits,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Insufficient credits') {
        return respErr(
          `Not enough credits. This request needs ${costCredits} credits.`
        );
      }
      throw error;
    }

    try {
      const requestId = await submitFalJob({
        apiKey,
        model,
        input: {
          prompt,
          image_size: getImageSize(resolution, ratio, aspect),
          num_images: numImages,
          ...(imageUrls ? { image_urls: imageUrls } : {}),
        },
      });
      await setTaskProviderId(task.id, requestId);
    } catch (error) {
      console.error('qwen-image submit failed:', error);
      await updateTask({
        taskId: task.id,
        status: AITaskStatus.FAILED,
        taskResult: {
          error: error instanceof Error ? error.message : 'submit failed',
        },
      });
      return respErr(
        'The image service could not start this request. Your credits were refunded.'
      );
    }

    return respData({ taskId: task.id, costCredits });
  } catch (error) {
    console.error('qwen-image generate failed:', error);
    return respErr('Image generation failed unexpectedly. Please try again.');
  }
}

export const Route = createFileRoute('/api/qwen-image/generate')({
  server: { handlers: { POST } },
});
