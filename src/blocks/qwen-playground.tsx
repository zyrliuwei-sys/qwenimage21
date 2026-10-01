import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import {
  getCreditCost,
  MAX_EDIT_INPUT_IMAGES,
  MAX_IMAGES_PER_REQUEST,
  QWEN_IMAGE_RATIOS,
  type QwenImageRatio,
  type QwenImageResolution,
} from '@/config/qwen-image';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

import '@/styles/qwen-site.css';
import '@/styles/qwen-refined.css';

type Mode = 'generate' | 'edit';
type RefImage = { name: string; dataUrl: string; aspect: number };
type TaskStatus =
  | { status: 'pending' }
  | { status: 'success'; images: string[] }
  | { status: 'failed'; error: string };

const MAX_INPUT_FILE_BYTES = 10 * 1024 * 1024;
const MIN_EDIT_SIDE = 384;
const MAX_EDIT_SIDE = 2048;

/**
 * Re-encode a reference image as JPEG, at most 2048px on the long side. Keeps
 * requests small and meets Fal's edit limits (384–2048px, PNG without alpha).
 */
async function prepareReference(file: File): Promise<RefImage> {
  const bitmap = await createImageBitmap(file);
  try {
    if (Math.min(bitmap.width, bitmap.height) < MIN_EDIT_SIDE) {
      throw new Error(m['qwen.play.file_too_small']());
    }
    const scale = Math.min(
      1,
      MAX_EDIT_SIDE / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.max(MIN_EDIT_SIDE, Math.round(bitmap.width * scale));
    const height = Math.max(MIN_EDIT_SIDE, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(m['qwen.play.file_read_error']());
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    return {
      name: file.name,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      aspect: bitmap.width / bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}

export function QwenPlaygroundPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const signedIn = !!session?.user;

  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<QwenImageRatio>('1:1');
  const [resolution, setResolution] = useState<QwenImageResolution>('1k');
  const [numImages, setNumImages] = useState(1);
  const [refs, setRefs] = useState<RefImage[]>([]);
  const [error, setError] = useState('');
  const [needsCredits, setNeedsCredits] = useState(false);
  const [taskId, setTaskId] = useState('');

  const cost = getCreditCost(resolution, numImages);

  const balanceQuery = useQuery({
    queryKey: ['credits-balance'],
    queryFn: () => apiGet<{ balance: number }>('/api/credits'),
    enabled: signedIn,
  });
  const balance = balanceQuery.data?.balance;

  const taskQuery = useQuery({
    queryKey: ['qwen-image-task', taskId],
    queryFn: () =>
      apiGet<TaskStatus>(
        `/api/qwen-image/status?taskId=${encodeURIComponent(taskId)}`
      ),
    enabled: !!taskId,
    refetchInterval: (query) =>
      !query.state.data || query.state.data.status === 'pending' ? 3000 : false,
  });
  const task = taskQuery.data;
  const working =
    !!taskId && (!task || task.status === 'pending') && !taskQuery.isError;

  useEffect(() => {
    if (task?.status === 'failed') setError(task.error);
    if (task && task.status !== 'pending') {
      // A failed task refunds its credits; refresh the balance either way.
      queryClient.invalidateQueries({ queryKey: ['credits-balance'] });
    }
  }, [task, queryClient]);

  const submit = useMutation({
    mutationFn: () =>
      apiPost<{ taskId: string; costCredits: number }>(
        '/api/qwen-image/generate',
        {
          mode,
          prompt: prompt.trim(),
          ratio,
          aspect: refs[0]?.aspect,
          resolution,
          numImages,
          images: mode === 'edit' ? refs.map((r) => r.dataUrl) : undefined,
        }
      ),
    onSuccess: (data) => {
      setTaskId(data.taskId);
      queryClient.invalidateQueries({ queryKey: ['credits-balance'] });
    },
    onError: (cause: Error) => {
      setError(cause.message || m['qwen.play.generate_error']());
      if (/credits/i.test(cause.message)) setNeedsCredits(true);
    },
  });

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setRatio(next === 'edit' ? 'original' : '1:1');
  };

  const onFiles = async (files: FileList | null) => {
    setError('');
    if (!files?.length) return;
    const room = MAX_EDIT_INPUT_IMAGES - refs.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) {
      setError(
        m['qwen.play.too_many_images']({ max: String(MAX_EDIT_INPUT_IMAGES) })
      );
    }
    const added: RefImage[] = [];
    for (const file of picked) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError(m['qwen.play.file_type']());
        continue;
      }
      if (file.size > MAX_INPUT_FILE_BYTES) {
        setError(m['qwen.play.file_size']());
        continue;
      }
      try {
        added.push(await prepareReference(file));
      } catch (cause) {
        setError(
          cause instanceof Error && cause.message
            ? cause.message
            : m['qwen.play.file_read_error']()
        );
      }
    }
    if (added.length) setRefs((current) => [...current, ...added]);
  };

  const generate = () => {
    if (!signedIn) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent('/playground')}`);
      return;
    }
    if (!prompt.trim()) {
      setError(m['qwen.play.prompt_required']());
      return;
    }
    if (mode === 'edit' && refs.length === 0) {
      setError(m['qwen.play.image_required']());
      return;
    }
    if (balance !== undefined && balance < cost) {
      setError(m['qwen.play.not_enough_credits']({ cost: String(cost) }));
      setNeedsCredits(true);
      return;
    }
    setError('');
    setNeedsCredits(false);
    setTaskId('');
    submit.mutate();
  };

  const busy = submit.isPending || working;
  const images = task?.status === 'success' ? task.images : [];
  const ratioOptions: QwenImageRatio[] =
    mode === 'edit'
      ? ['original', ...QWEN_IMAGE_RATIOS]
      : [...QWEN_IMAGE_RATIOS];
  const samples =
    mode === 'generate'
      ? [
          m['qwen.play.sample_one'](),
          m['qwen.play.sample_two'](),
          m['qwen.play.sample_three'](),
        ]
      : [m['qwen.play.sample_edit_one'](), m['qwen.play.sample_edit_two']()];

  return (
    <div className="qw-site qw-playground">
      <header className="qw-play-head qw-wrap">
        <Link href="/" className="qw-brand">
          <img
            src={envConfigs.app_logo}
            alt={m['qwen.logo_alt']({ name: envConfigs.app_name })}
            width="30"
            height="30"
          />
          <span>{envConfigs.app_name}</span>
        </Link>
        <div className="qw-play-head-actions">
          {signedIn && balance !== undefined && (
            <Link href="/pricing" className="qw-credit-pill">
              <Sparkles size={14} />
              {m['qwen.play.balance']({ credits: String(balance) })}
            </Link>
          )}
          <Link href="/pricing">{m['qwen.nav.pricing']()}</Link>
          <Link href="/">
            <ArrowLeft size={16} />
            {m['qwen.play.back']()}
          </Link>
        </div>
      </header>
      <main className="qw-wrap">
        <div className="qw-play-intro">
          <p className="qw-eyebrow">{m['qwen.play.eyebrow']()}</p>
          <h1>{m['qwen.play.heading']()}</h1>
          <p>{m['qwen.play.description']()}</p>
        </div>
        <div className="qw-play-grid">
          <section className="qw-panel">
            <div className="qw-panel-top">
              <span>{m['qwen.play.idea_label']()}</span>
              <span>✳</span>
            </div>
            <h2>{m['qwen.play.idea_heading']()}</h2>
            <div
              className="qw-mode-switch"
              role="group"
              aria-label={m['qwen.play.mode_label']()}
            >
              <button
                type="button"
                className={mode === 'generate' ? 'is-active' : ''}
                aria-pressed={mode === 'generate'}
                onClick={() => switchMode('generate')}
              >
                {m['qwen.play.generate']()}
              </button>
              <button
                type="button"
                className={mode === 'edit' ? 'is-active' : ''}
                aria-pressed={mode === 'edit'}
                onClick={() => switchMode('edit')}
              >
                {m['qwen.play.edit']()}
              </button>
            </div>
            {mode === 'edit' && (
              <>
                <label htmlFor="qw-upload">
                  {m['qwen.play.upload_label']()}
                </label>
                {refs.length > 0 && (
                  <div className="qw-ref-list">
                    {refs.map((ref, index) => (
                      <figure key={`${ref.name}-${index}`}>
                        <img
                          src={ref.dataUrl}
                          alt={m['qwen.play.upload_preview']()}
                        />
                        <figcaption>
                          {m['qwen.play.image_number']({
                            n: String(index + 1),
                          })}
                        </figcaption>
                        <button
                          type="button"
                          onClick={() =>
                            setRefs((current) =>
                              current.filter((_, i) => i !== index)
                            )
                          }
                          aria-label={m['qwen.play.remove_image']()}
                        >
                          <X size={14} />
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
                {refs.length < MAX_EDIT_INPUT_IMAGES && (
                  <label className="qw-upload" htmlFor="qw-upload">
                    <input
                      id="qw-upload"
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        onFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <span>
                      <UploadCloud size={22} />
                      {m['qwen.play.upload_hint']()}
                    </span>
                  </label>
                )}
                <div className="qw-form-note">
                  <span>
                    {m['qwen.play.upload_note']({
                      max: String(MAX_EDIT_INPUT_IMAGES),
                    })}
                  </span>
                </div>
              </>
            )}
            <label htmlFor="qw-prompt">
              {mode === 'generate'
                ? m['qwen.play.prompt_label']()
                : m['qwen.play.edit_prompt_label']()}
            </label>
            <textarea
              id="qw-prompt"
              maxLength={5000}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder={
                mode === 'generate'
                  ? m['qwen.play.prompt_placeholder']()
                  : m['qwen.play.edit_placeholder']()
              }
            />
            <div className="qw-form-note">
              <span>{m['qwen.play.prompt_hint']()}</span>
              <span>{prompt.length} / 5000</span>
            </div>
            <label>{m['qwen.play.inspiration']()}</label>
            <div className="qw-inspiration">
              {samples.map((sample, i) => (
                <button type="button" key={i} onClick={() => setPrompt(sample)}>
                  {sample.length > 25 ? `${sample.slice(0, 25)}…` : sample} ↗
                </button>
              ))}
            </div>
            <label>{m['qwen.play.ratio_label']()}</label>
            <div
              className="qw-ratios"
              role="group"
              aria-label={m['qwen.play.ratio_label']()}
            >
              {ratioOptions.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={ratio === r ? 'is-active' : ''}
                  aria-pressed={ratio === r}
                  onClick={() => setRatio(r)}
                >
                  {r === 'original' ? m['qwen.play.ratio_original']() : r}
                </button>
              ))}
            </div>
            <div className="qw-option-row">
              <div>
                <label>{m['qwen.play.quality_label']()}</label>
                <div
                  className="qw-ratios"
                  role="group"
                  aria-label={m['qwen.play.quality_label']()}
                >
                  {(['1k', '2k'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={resolution === r ? 'is-active' : ''}
                      aria-pressed={resolution === r}
                      onClick={() => setResolution(r)}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>{m['qwen.play.count_label']()}</label>
                <div
                  className="qw-ratios"
                  role="group"
                  aria-label={m['qwen.play.count_label']()}
                >
                  {Array.from(
                    { length: MAX_IMAGES_PER_REQUEST },
                    (_, i) => i + 1
                  ).map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={numImages === n ? 'is-active' : ''}
                      aria-pressed={numImages === n}
                      onClick={() => setNumImages(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && (
              <p className="qw-form-error" role="alert">
                {error}
                {needsCredits && (
                  <>
                    {' '}
                    <Link href="/pricing">{m['qwen.play.get_credits']()}</Link>
                  </>
                )}
              </p>
            )}
            <button
              type="button"
              className="qw-button qw-button-dark qw-play-action"
              onClick={generate}
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle size={17} className="qw-spinner" />
                  {m['qwen.play.generating']()}
                </>
              ) : !signedIn ? (
                <>{m['qwen.play.sign_in_to_generate']()}</>
              ) : (
                <>
                  {mode === 'generate'
                    ? m['qwen.play.generate_action']()
                    : m['qwen.play.edit_action']()}
                  <span className="qw-cost">
                    {m['qwen.play.cost']({ credits: String(cost) })}
                  </span>
                </>
              )}
            </button>
            <p className="qw-availability">{m['qwen.play.availability']()}</p>
          </section>
          <section className="qw-panel qw-preview-panel">
            <div className="qw-panel-top">
              <span>{m['qwen.play.preview_label']()}</span>
              <span>{m['qwen.play.concept']()}</span>
            </div>
            {images.length > 0 ? (
              <div
                className={
                  images.length > 1
                    ? 'qw-result-grid is-multi'
                    : 'qw-result-grid'
                }
              >
                {images.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer">
                    <img
                      className="qw-generated-image"
                      src={src}
                      alt={m['qwen.play.generated_alt']()}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </a>
                ))}
              </div>
            ) : busy ? (
              <div className="qw-result-wait" role="status">
                <LoaderCircle size={28} className="qw-spinner" />
                <span>{m['qwen.play.waiting']()}</span>
              </div>
            ) : (
              <div
                className="qw-art-visual qw-art-studio-light qw-preview-art"
                role="img"
                aria-label={m['qwen.art.studio_light']()}
              />
            )}
            <h2>
              {images.length
                ? m['qwen.play.result_heading']()
                : m['qwen.play.preview_heading']()}
            </h2>
            <p>
              {images.length
                ? m['qwen.play.result_note']()
                : m['qwen.play.preview_note']()}
            </p>
            <Link href="/#gallery" className="qw-button qw-button-light">
              {m['qwen.play.gallery_link']()} <ArrowUpRight size={17} />
            </Link>
          </section>
        </div>
      </main>
      <footer className="qw-play-footer qw-wrap">
        <span>{m['qwen.play.footer']()}</span>
        <Link href="/privacy-policy">{m['qwen.footer.privacy']()}</Link>
      </footer>
    </div>
  );
}
