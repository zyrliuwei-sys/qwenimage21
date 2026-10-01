/**
 * Qwen Image 3 on fal.ai — queue submit + status/result polling.
 * @docs https://fal.ai/docs/model-endpoints/queue
 */

const QUEUE_BASE = 'https://queue.fal.run';
// Status/result URLs drop the sub-path: alibaba/qwen-image-3/edit → alibaba/qwen-image-3
const queueApp = (model: string) => model.split('/').slice(0, 2).join('/');

export type FalSubmitInput = {
  prompt: string;
  image_size: { width: number; height: number };
  num_images: number;
  image_urls?: string[];
};

export type FalPollResult =
  | { state: 'pending' }
  | { state: 'success'; images: string[] }
  | { state: 'failed'; reason: string };

function headers(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Key ${apiKey}`,
  };
}

async function errorDetail(resp: Response): Promise<string> {
  const body = (await resp.json().catch(() => null)) as any;
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') {
    return detail[0].msg;
  }
  return `Fal request failed with status ${resp.status}`;
}

/** Submit a job. Returns Fal's request_id. */
export async function submitFalJob(params: {
  apiKey: string;
  model: string;
  input: FalSubmitInput;
}): Promise<string> {
  const resp = await fetch(`${QUEUE_BASE}/${params.model}`, {
    method: 'POST',
    headers: headers(params.apiKey),
    body: JSON.stringify({
      ...params.input,
      output_format: 'png',
      enable_safety_checker: true,
    }),
  });
  if (!resp.ok) throw new Error(await errorDetail(resp));
  const data = (await resp.json()) as { request_id?: string };
  if (!data.request_id) throw new Error('Fal returned no request_id');
  return data.request_id;
}

/**
 * Check a job. Network/5xx problems throw (caller retries on the next poll);
 * a 4xx on the result (e.g. content policy, invalid input) is a final failure.
 */
export async function pollFalJob(params: {
  apiKey: string;
  model: string;
  requestId: string;
}): Promise<FalPollResult> {
  const base = `${QUEUE_BASE}/${queueApp(params.model)}/requests/${params.requestId}`;
  const statusResp = await fetch(`${base}/status`, {
    headers: headers(params.apiKey),
  });
  if (!statusResp.ok) throw new Error(await errorDetail(statusResp));
  const status = (await statusResp.json()) as { status?: string };
  if (status.status !== 'COMPLETED') return { state: 'pending' };

  const resultResp = await fetch(base, { headers: headers(params.apiKey) });
  if (!resultResp.ok) {
    if (resultResp.status >= 400 && resultResp.status < 500) {
      return { state: 'failed', reason: await errorDetail(resultResp) };
    }
    throw new Error(await errorDetail(resultResp));
  }
  const result = (await resultResp.json()) as {
    images?: Array<{ url?: string }>;
  };
  const images = (result.images || [])
    .map((image) => image.url)
    .filter((url): url is string => typeof url === 'string' && !!url);
  if (images.length === 0) {
    return { state: 'failed', reason: 'Fal returned no images' };
  }
  return { state: 'success', images };
}
