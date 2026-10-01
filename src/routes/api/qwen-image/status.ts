import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { AITaskStatus, findTask, updateTask } from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { pollFalJob } from '@/modules/qwen-image/service';
import { respData, respErr } from '@/lib/resp';

// A job that hasn't finished by then is failed and its credits refunded.
const TASK_TIMEOUT_MS = 15 * 60 * 1000;

const REFUNDED =
  'The image could not be generated. Your credits were refunded.';

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

    const apiKey = (await getAllConfigs()).fal_api_key?.trim();
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
      await updateTask({
        taskId: task.id,
        status: AITaskStatus.SUCCESS,
        taskResult: { images: result.images },
      });
      return respData({ status: 'success', images: result.images });
    }
    if (result.state === 'failed') return fail(result.reason);
    return expired ? fail('timed out') : respData({ status: 'pending' });
  } catch (error) {
    console.error('qwen-image status failed:', error);
    return respErr('Could not check the image status.');
  }
}

export const Route = createFileRoute('/api/qwen-image/status')({
  server: { handlers: { GET } },
});
