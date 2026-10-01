/**
 * Qwen Image 3 (fal.ai) models and credit pricing.
 *
 * Shared by the generator UI and the API, so it must stay free of secrets.
 * The Fal API key lives in the admin panel (Settings → AI → Fal → API Key).
 *
 * Pricing rule: 1 credit = $0.01, and users are charged 7× the Fal cost.
 * Fal cost (both endpoints): $0.04 per image at 1K, $0.075 per image at 2K.
 * @docs https://fal.ai/models/alibaba/qwen-image-3/text-to-image
 * @docs https://fal.ai/models/alibaba/qwen-image-3/edit
 */

export type QwenImageMode = 'generate' | 'edit';
export type QwenImageResolution = '1k' | '2k';

export const QWEN_IMAGE_MODELS: Record<QwenImageMode, string> = {
  generate: 'alibaba/qwen-image-3/text-to-image',
  edit: 'alibaba/qwen-image-3/edit',
};

export const CREDIT_MARKUP = 7;

// Costs in mills ($0.001) so the math stays in integers.
const MILLS_PER_CREDIT = 10;
export const FAL_COST_MILLS: Record<QwenImageResolution, number> = {
  '1k': 40,
  '2k': 75,
};

/** Credits charged per output image: 1K = 28, 2K = 53. */
export const CREDITS_PER_IMAGE: Record<QwenImageResolution, number> = {
  '1k': Math.ceil((FAL_COST_MILLS['1k'] * CREDIT_MARKUP) / MILLS_PER_CREDIT),
  '2k': Math.ceil((FAL_COST_MILLS['2k'] * CREDIT_MARKUP) / MILLS_PER_CREDIT),
};

export const MAX_IMAGES_PER_REQUEST = 4;
export const MAX_EDIT_INPUT_IMAGES = 3;
export const MAX_EDIT_INPUT_BYTES = 10 * 1024 * 1024;

export const QWEN_IMAGE_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const;
export type QwenImageRatio = (typeof QWEN_IMAGE_RATIOS)[number] | 'original';

const LONG_SIDE: Record<QwenImageResolution, number> = {
  '1k': 1024,
  '2k': 2048,
};

/**
 * Explicit output size for a ratio. Always sent to Fal so the long side never
 * exceeds the tier being billed (edit would otherwise pick its own size).
 * `aspect` (width / height) is used for the `original` ratio.
 */
export function getImageSize(
  resolution: QwenImageResolution,
  ratio: QwenImageRatio,
  aspect?: number
): { width: number; height: number } {
  let value = 1;
  if (ratio === 'original') {
    value = Math.min(3, Math.max(1 / 3, aspect && aspect > 0 ? aspect : 1));
  } else {
    const [w, h] = ratio.split(':').map(Number);
    value = w / h;
  }
  const long = LONG_SIDE[resolution];
  const toMultipleOf16 = (n: number) => Math.max(16, Math.round(n / 16) * 16);
  return value >= 1
    ? { width: long, height: toMultipleOf16(long / value) }
    : { width: toMultipleOf16(long * value), height: long };
}

export function getCreditCost(
  resolution: QwenImageResolution,
  numImages: number
): number {
  return CREDITS_PER_IMAGE[resolution] * numImages;
}
