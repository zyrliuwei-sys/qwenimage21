import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { AITaskStatus, findTask, updateTask } from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { pollFalJob } from '@/modules/qwen-image/service';
import { getStorage } from '@/modules/storage/service';
import { pickLocale } from '@/lib/request-locale';
import { respData, respErr } from '@/lib/resp';
import { m } from '@/paraglide/messages.js';

// A job that hasn't finished by then is failed and its credits refunded.
const TASK_TIMEOUT_MS = 15 * 60 * 1000;

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Copy Fal's output into our own storage so it outlives Fal's temporary
 * links. Keys are derived from the task, so a repeated poll overwrites the
 * same objects. Any image that can't be copied keeps its Fal URL. Skipped
 * without a public R2 domain: the bucket endpoint itself isn't viewable.
 */
async function persistImages(
  taskId: string,
  images: string[],
  publicDomain: string | undefined
): Promise<string[]> {
  if (!publicDomain) return images;
  const storage = await getStorage();
  if (!storage) return images;
  return Promise.all(
    images.map(async (url, index) => {
      try {
        const ext = /\.(png|jpe?g|webp)(?:$|\?)/i
          .exec(new URL(url).pathname)?.[1]
          ?.toLowerCase();
        const type = ext ? IMAGE_TYPES[ext] : 'image/png';
        const result = await storage.downloadAndUpload({
          url,
          key: `qwen-image/${taskId}-${index + 1}.${ext || 'png'}`,
          contentType: type,
          disposition: 'inline',
        });
        if (result.success && result.url) return result.url;
        console.error('qwen-image persist failed:', result.error);
      } catch (error) {
        console.error('qwen-image persist failed:', error);
      }
      return url;
    })
  );
}

function parseImages(taskResult: unknown): string[] {
  try {
    const parsed = JSON.parse(String(taskResult || '{}'));
    return Array.isArray(parsed.images) ? parsed.images : [];
  } catch {
    return [];
  }
}

async function GET({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Unauthorized');

    const locale = pickLocale(new URL(request.url).searchParams.get('locale'));
    const REFUNDED = m['qwen.api.refunded']({}, { locale });
    const taskId = new URL(request.url).searchParams.get('taskId');
    if (!taskId) return respErr('Missing taskId');

    const task = await findTask(taskId);
    if (!task || task.userId !== session.user.id || task.provider !== 'fal') {
      return respErr('Task not found');
    }

    if (task.status === AITaskStatus.SUCCESS) {
      return respData({
        status: 'success',
        images: parseImages(task.taskResult),
      });
    }
    if (task.status === AITaskStatus.FAILED) {
      return respData({ status: 'failed', error: REFUNDED });
    }

    const fail = async (reason: string) => {
      await updateTask({
        taskId: task.id,
        status: AITaskStatus.FAILED,
        taskResult: { error: reason },
      });
      return respData({ status: 'failed', error: REFUNDED });
    };

    const expired =
      Date.now() - new Date(task.createdAt).getTime() > TASK_TIMEOUT_MS;

    if (!task.taskId) {
      // Submit never recorded a Fal request id.
      return expired ? fail('not submitted') : respData({ status: 'pending' });
    }

    const configs = await getAllConfigs();
    const apiKey = configs.fal_api_key?.trim();
    if (!apiKey) return respData({ status: 'pending' });

    let result;
    try {
      result = await pollFalJob({
        apiKey,
        model: task.model,
        requestId: task.taskId,
      });
    } catch (error) {
      console.error('qwen-image poll failed:', error);
      return expired ? fail('timed out') : respData({ status: 'pending' });
    }

    if (result.state === 'success') {
      const images = await persistImages(
        task.id,
        result.images,
        configs.r2_domain
      );
      await updateTask({
        taskId: task.id,
        status: AITaskStatus.SUCCESS,
        taskResult: { images },
      });
      return respData({ status: 'success', images });
    }
    if (result.state === 'failed') return fail(result.reason);
    return expired ? fail('timed out') : respData({ status: 'pending' });
  } catch (error) {
    console.error('qwen-image status failed:', error);
    return respErr(
      m['qwen.api.status_failed'](
        {},
        { locale: pickLocale(new URL(request.url).searchParams.get('locale')) }
      )
    );
  }
}

export const Route = createFileRoute('/api/qwen-image/status')({
  server: { handlers: { GET } },
});
