import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { AITaskStatus, findTask } from '@/modules/ai-tasks/service';

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/**
 * GET /api/qwen-image/download?taskId=…&index=0
 *
 * Streams one of the user's own generated images back as an attachment. The
 * images live on another origin (Fal or R2), where `<a download>` is ignored,
 * so the browser would only open them in a tab. Only URLs already stored on
 * the user's task are fetched — never one from the request.
 */
async function GET({ request }: { request: Request }) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const params = new URL(request.url).searchParams;
  const task = await findTask(params.get('taskId') || '');
  if (
    !task ||
    task.userId !== session.user.id ||
    task.status !== AITaskStatus.SUCCESS
  ) {
    return new Response('Not found', { status: 404 });
  }

  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(task.taskResult || '{}'));
    if (Array.isArray(parsed.images)) images = parsed.images;
  } catch {
    // fall through to 404
  }
  const index = Number(params.get('index') || 0);
  const url = Number.isInteger(index) ? images[index] : undefined;
  if (!url || !/^https:\/\//.test(url)) {
    return new Response('Not found', { status: 404 });
  }

  const upstream = await fetch(url);
  const type = upstream.headers.get('content-type')?.split(';')[0] || '';
  if (!upstream.ok || !upstream.body || !EXT_BY_TYPE[type]) {
    return new Response('Image unavailable', { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="qwen-image-${task.id.slice(0, 8)}-${index + 1}.${EXT_BY_TYPE[type]}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

export const Route = createFileRoute('/api/qwen-image/download')({
  server: { handlers: { GET } },
});
