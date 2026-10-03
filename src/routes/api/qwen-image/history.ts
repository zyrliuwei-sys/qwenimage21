import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import type { AiTask } from '@/config/db/schema';
import { AITaskStatus, getTasks } from '@/modules/ai-tasks/service';
import { respData, respErr } from '@/lib/resp';

const PAGE_SIZE = 12;

function parseImages(taskResult: unknown): string[] {
  try {
    const parsed = JSON.parse(String(taskResult || '{}'));
    return Array.isArray(parsed.images) ? parsed.images : [];
  } catch {
    return [];
  }
}

/** GET /api/qwen-image/history?page=1 — the user's finished images, newest first. */
async function GET({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Unauthorized');

    const page = Math.max(
      1,
      Number(new URL(request.url).searchParams.get('page')) || 1
    );
    const tasks: AiTask[] = await getTasks({
      userId: session.user.id,
      mediaType: 'image',
      status: AITaskStatus.SUCCESS,
      page,
      limit: PAGE_SIZE,
    });

    return respData({
      items: tasks
        .filter((task) => task.provider === 'fal')
        .map((task) => ({
          id: task.id,
          prompt: task.prompt,
          images: parseImages(task.taskResult),
          createdAt: task.createdAt,
        })),
      hasMore: tasks.length === PAGE_SIZE,
    });
  } catch (error) {
    console.error('qwen-image history failed:', error);
    return respErr('Could not load your images.');
  }
}

export const Route = createFileRoute('/api/qwen-image/history')({
  server: { handlers: { GET } },
});
