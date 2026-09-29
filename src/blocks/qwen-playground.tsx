import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  LoaderCircle,
  UploadCloud,
  X,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { PublicThemeToggle } from '@/components/public-theme-toggle';

import '@/styles/qwen-site.css';
import '@/styles/qwen-refined.css';

type Mode = 'generate' | 'edit';
const ratios = ['1:1', '4:3', '3:4', '16:9'];
export function QwenPlaygroundPage() {
  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [preview, setPreview] = useState<string>();
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  const onFile = (file?: File) => {
    setError('');
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError(m['qwen.play.file_type']());
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(m['qwen.play.file_size']());
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setImageName(file.name);
  };
  const copy = async () => {
    if (!prompt.trim()) {
      setError(m['qwen.play.prompt_required']());
      return;
    }
    setError('');
    const text = `${prompt.trim()}\n\n${m['qwen.play.ratio_instruction']({ ratio })}${mode === 'edit' ? `\n${m['qwen.play.edit_instruction']()}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(m['qwen.play.copy_error']());
    }
  };
  const generate = async () => {
    if (!prompt.trim()) {
      setError(m['qwen.play.prompt_required']());
      return;
    }
    setError('');
    setGenerating(true);
    setGeneratedImage('');
    try {
      const result = await apiPost<{ image: string }>(
        '/api/qwen-image/generate',
        { prompt: prompt.trim(), ratio }
      );
      setGeneratedImage(result.image);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : m['qwen.play.generate_error']()
      );
    } finally {
      setGenerating(false);
    }
  };
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
          <PublicThemeToggle label={m['qwen.theme.toggle']()} />
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
                onClick={() => {
                  setMode('generate');
                  setError('');
                }}
              >
                {m['qwen.play.generate']()}
              </button>
              <button
                type="button"
                className={mode === 'edit' ? 'is-active' : ''}
                aria-pressed={mode === 'edit'}
                onClick={() => {
                  setMode('edit');
                  setError('');
                }}
              >
                {m['qwen.play.edit']()}
              </button>
            </div>
            {mode === 'edit' && (
              <>
                <label htmlFor="qw-upload">
                  {m['qwen.play.upload_label']()}
                </label>
                <label className="qw-upload" htmlFor="qw-upload">
                  <input
                    id="qw-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  {preview ? (
                    <img
                      src={preview}
                      alt={m['qwen.play.upload_preview']()}
                      width={320}
                      height={220}
                    />
                  ) : (
                    <span>
                      <UploadCloud size={22} />
                      {m['qwen.play.upload_hint']()}
                    </span>
                  )}
                </label>
                <div className="qw-form-note">
                  <span>{imageName || m['qwen.play.upload_note']()}</span>
                  {preview && (
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(preview);
                        setPreview(undefined);
                        setImageName('');
                      }}
                      aria-label={m['qwen.play.remove_image']()}
                    >
                      <X size={15} />
                    </button>
                  )}
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
              {ratios.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={ratio === r ? 'is-active' : ''}
                  aria-pressed={ratio === r}
                  onClick={() => setRatio(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            {error && (
              <p className="qw-form-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="qw-button qw-button-dark qw-play-action"
              onClick={mode === 'generate' ? generate : copy}
              disabled={generating}
            >
              {generating ? (
                <>
                  <LoaderCircle size={17} className="qw-spinner" />
                  {m['qwen.play.generating']()}
                </>
              ) : mode === 'generate' ? (
                <>{m['qwen.play.generate_action']()}</>
              ) : copied ? (
                <>
                  <Check size={17} />
                  {m['qwen.play.copied']()}
                </>
              ) : (
                <>
                  <Copy size={17} />
                  {m['qwen.play.copy']()}
                </>
              )}
            </button>
            <p className="qw-availability">
              {mode === 'generate'
                ? m['qwen.play.availability']()
                : m['qwen.play.edit_availability']()}
            </p>
          </section>
          <section className="qw-panel qw-preview-panel">
            <div className="qw-panel-top">
              <span>{m['qwen.play.preview_label']()}</span>
              <span>{m['qwen.play.concept']()}</span>
            </div>
            {generatedImage ? (
              <img
                className="qw-generated-image"
                src={generatedImage}
                alt={m['qwen.play.generated_alt']()}
              />
            ) : (
              <div
                className="qw-art-visual qw-art-studio-light qw-preview-art"
                role="img"
                aria-label={m['qwen.art.studio_light']()}
              />
            )}
            <h2>
              {generatedImage
                ? m['qwen.play.result_heading']()
                : m['qwen.play.preview_heading']()}
            </h2>
            <p>
              {generatedImage
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
