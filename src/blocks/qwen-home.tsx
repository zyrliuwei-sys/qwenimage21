import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Layers2,
  Menu,
  Search,
  Type,
  X,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { QwenPricing } from '@/blocks/qwen-pricing';
import { BuiltWithShipAny } from '@/components/built-with-shipany';
import { SiteUserMenu } from '@/components/site-user-menu';

import '@/styles/qwen-site.css';
import '@/styles/qwen-refined.css';

type Category = 'all' | 'photo' | 'concept' | 'edit';
type Artwork = {
  id: number;
  category: Exclude<Category, 'all'>;
  image: string;
  title: () => string;
  note: () => string;
};
const artworks: Artwork[] = [
  {
    id: 1,
    category: 'concept',
    image: 'glass-ribbon',
    title: () => m['qwen.art.glass'](),
    note: () => m['qwen.art.glass_note'](),
  },
  {
    id: 2,
    category: 'photo',
    image: 'orchid-shadow',
    title: () => m['qwen.art.orchid'](),
    note: () => m['qwen.art.orchid_note'](),
  },
  {
    id: 3,
    category: 'edit',
    image: 'silver-fabric',
    title: () => m['qwen.art.silver'](),
    note: () => m['qwen.art.silver_note'](),
  },
  {
    id: 4,
    category: 'concept',
    image: 'jar',
    title: () => m['qwen.art.jar'](),
    note: () => m['qwen.art.jar_note'](),
  },
  {
    id: 5,
    category: 'photo',
    image: 'blue-stone',
    title: () => m['qwen.art.blue'](),
    note: () => m['qwen.art.blue_note'](),
  },
  {
    id: 6,
    category: 'edit',
    image: 'horse',
    title: () => m['qwen.art.horse'](),
    note: () => m['qwen.art.horse_note'](),
  },
  {
    id: 7,
    category: 'photo',
    image: 'stairs',
    title: () => m['qwen.art.stairs'](),
    note: () => m['qwen.art.stairs_note'](),
  },
];
const filters: { id: Category; label: () => string }[] = [
  { id: 'all', label: () => m['qwen.gallery.all']() },
  { id: 'photo', label: () => m['qwen.gallery.photo']() },
  { id: 'concept', label: () => m['qwen.gallery.concept']() },
  { id: 'edit', label: () => m['qwen.gallery.edit']() },
];
const guideTopics = [
  {
    number: '01',
    heading: () => m['qwen.guide.1.heading'](),
    one: () => m['qwen.guide.1.one'](),
    two: () => m['qwen.guide.1.two'](),
  },
  {
    number: '02',
    heading: () => m['qwen.guide.2.heading'](),
    one: () => m['qwen.guide.2.one'](),
    two: () => m['qwen.guide.2.two'](),
  },
  {
    number: '03',
    heading: () => m['qwen.guide.3.heading'](),
    one: () => m['qwen.guide.3.one'](),
    two: () => m['qwen.guide.3.two'](),
  },
  {
    number: '04',
    heading: () => m['qwen.guide.4.heading'](),
    one: () => m['qwen.guide.4.one'](),
    two: () => m['qwen.guide.4.two'](),
  },
  {
    number: '05',
    heading: () => m['qwen.guide.5.heading'](),
    one: () => m['qwen.guide.5.one'](),
    two: () => m['qwen.guide.5.two'](),
  },
];
const guideQuestions = [
  {
    question: () => m['qwen.guide.faq.1.question'](),
    answer: () => m['qwen.guide.faq.1.answer'](),
  },
  {
    question: () => m['qwen.guide.faq.2.question'](),
    answer: () => m['qwen.guide.faq.2.answer'](),
  },
  {
    question: () => m['qwen.guide.faq.3.question'](),
    answer: () => m['qwen.guide.faq.3.answer'](),
  },
  {
    question: () => m['qwen.guide.faq.4.question'](),
    answer: () => m['qwen.guide.faq.4.answer'](),
  },
];

export function QwenHeader() {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const user = session?.user;
  return (
    <header className="qw-header">
      <div className="qw-header-inner">
        <Link href="/" className="qw-brand" aria-label={envConfigs.app_name}>
          <img
            src={envConfigs.app_logo}
            alt={m['qwen.logo_alt']({ name: envConfigs.app_name })}
            width="30"
            height="30"
          />
          <span>{envConfigs.app_name}</span>
        </Link>
        <nav
          className={open ? 'qw-nav is-open' : 'qw-nav'}
          aria-label={m['qwen.nav.label']()}
        >
          <a href="/#gallery" onClick={() => setOpen(false)}>
            {m['qwen.nav.gallery']()}
          </a>
          <a href="/#about" onClick={() => setOpen(false)}>
            {m['qwen.nav.model']()}
          </a>
          <a href="/#sources" onClick={() => setOpen(false)}>
            {m['qwen.nav.sources']()}
          </a>
          <Link href="/pricing" onClick={() => setOpen(false)}>
            {m['qwen.nav.pricing']()}
          </Link>
          {!user && !isPending && (
            <Link
              className="qw-nav-signin"
              href="/sign-in"
              onClick={() => setOpen(false)}
            >
              {m['common.nav.sign_in']()}
            </Link>
          )}
        </nav>
        <div className="qw-header-actions">
          {user ? (
            <SiteUserMenu
              name={user.name || 'User'}
              email={user.email}
              image={user.image}
            />
          ) : (
            !isPending && (
              <Link className="qw-signin-link" href="/sign-in">
                {m['common.nav.sign_in']()}
              </Link>
            )
          )}
          <Link className="qw-create-link" href="/playground">
            {m['qwen.nav.create']()} <ArrowUpRight size={16} />
          </Link>
          <button
            className="qw-mobile-menu"
            type="button"
            aria-label={m['qwen.nav.menu']()}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function ArtworkVisual({ image, title }: { image: string; title: string }) {
  return (
    <div
      role="img"
      aria-label={title}
      className={`qw-art-visual qw-art-${image}`}
    />
  );
}

export function QwenHomePage() {
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Artwork | null>(null);
  const visible = artworks.filter(
    (a) =>
      (category === 'all' || a.category === category) &&
      `${a.title()} ${a.note()}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
  );
  return (
    <div className="qw-site">
      <a className="qw-skip" href="#main">
        {m['qwen.nav.skip']()}
      </a>
      <QwenHeader />
      <main id="main">
        <section className="qw-hero qw-wrap">
          <div className="qw-hero-copy">
            <h1>{m['qwen.hero.title']()}</h1>
            <p className="qw-hero-text">{m['qwen.hero.description']()}</p>
            <div className="qw-hero-actions">
              <Link className="qw-button qw-button-dark" href="/playground">
                {m['qwen.hero.create']()} <ArrowUpRight size={17} />
              </Link>
              <a className="qw-button qw-button-light" href="#gallery">
                {m['qwen.hero.explore']()} <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <figure
            className="qw-hero-art"
            aria-label={m['qwen.hero.visual_alt']()}
          >
            <div className="qw-hero-art-main">
              <ArtworkVisual image="paper" title={m['qwen.art.paper']()} />
            </div>
            <div className="qw-hero-art-side">
              <ArtworkVisual
                image="atelier-portrait"
                title={m['qwen.art.atelier_portrait']()}
              />
              <ArtworkVisual
                image="persimmon"
                title={m['qwen.art.persimmon']()}
              />
            </div>
            <figcaption>{m['qwen.hero.art_caption']()}</figcaption>
          </figure>
        </section>
        <div className="qw-capabilities">
          <div className="qw-wrap qw-capabilities-inner">
            <span>
              <ImageIcon size={17} />
              {m['qwen.cap.generate']()}
            </span>
            <span>
              <Layers2 size={17} />
              {m['qwen.cap.edit']()}
            </span>
            <span>
              <Type size={17} />
              {m['qwen.cap.detail']()}
            </span>
            <Link href="/playground">
              {m['qwen.cap.open']()} <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <section id="gallery" className="qw-gallery qw-wrap">
          <div className="qw-section-head">
            <p className="qw-eyebrow">{m['qwen.gallery.eyebrow']()}</p>
            <h2>{m['qwen.gallery.heading']()}</h2>
            <p>{m['qwen.gallery.description']()}</p>
          </div>
          <div className="qw-gallery-tools">
            <div
              className="qw-filters"
              role="group"
              aria-label={m['qwen.gallery.filter_label']()}
            >
              {filters.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  className={category === f.id ? 'is-active' : ''}
                  aria-pressed={category === f.id}
                  onClick={() => setCategory(f.id)}
                >
                  {f.label()}
                </button>
              ))}
            </div>
            <label className="qw-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={m['qwen.gallery.search']()}
                aria-label={m['qwen.gallery.search']()}
              />
            </label>
          </div>
          <div className="qw-gallery-count">
            {m['qwen.gallery.count']({ count: String(visible.length) })}
          </div>
          <div
            className={
              category === 'all' && !search
                ? 'qw-art-grid is-editorial'
                : 'qw-art-grid'
            }
          >
            {visible.map((a) => (
              <article className="qw-art-card" key={a.id}>
                <button
                  type="button"
                  className="qw-art-image-button"
                  onClick={() => setSelected(a)}
                  aria-label={m['qwen.gallery.view']({ title: a.title() })}
                >
                  <ArtworkVisual image={a.image} title={a.title()} />
                  <span className="qw-art-expand">
                    <ArrowUpRight size={20} />
                  </span>
                </button>
                <div className="qw-art-meta">
                  <div>
                    <small>
                      {a.category === 'photo'
                        ? m['qwen.gallery.photo']()
                        : a.category === 'concept'
                          ? m['qwen.gallery.concept']()
                          : m['qwen.gallery.edit']()}
                    </small>
                    <h3>{a.title()}</h3>
                    <p>{a.note()}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <p className="qw-empty">{m['qwen.gallery.empty']()}</p>
          )}
          <p className="qw-gallery-disclosure">
            {m['qwen.gallery.disclosure']()}
          </p>
        </section>
        <section id="about" className="qw-about">
          <div className="qw-wrap">
            <div className="qw-section-head">
              <p className="qw-eyebrow">{m['qwen.about.eyebrow']()}</p>
              <h2>{m['qwen.about.heading']()}</h2>
              <p>{m['qwen.about.description']()}</p>
            </div>
            <div className="qw-feature-grid">
              <article>
                <div className="qw-feature-art">
                  <ArtworkVisual
                    image="mountain"
                    title={m['qwen.art.mountain']()}
                  />
                </div>
                <h3>{m['qwen.about.one.title']()}</h3>
                <p>{m['qwen.about.one.text']()}</p>
              </article>
              <article>
                <Layers2 size={28} />
                <h3>{m['qwen.about.two.title']()}</h3>
                <p>{m['qwen.about.two.text']()}</p>
              </article>
              <article>
                <Type size={28} />
                <h3>{m['qwen.about.three.title']()}</h3>
                <p>{m['qwen.about.three.text']()}</p>
              </article>
            </div>
          </div>
        </section>
        <section
          id="guide"
          className="qw-guide-band"
          aria-labelledby="qw-guide-heading"
        >
          <div className="qw-guide qw-wrap">
            <div className="qw-guide-heading">
              <div className="qw-guide-intro">
                <p className="qw-eyebrow">{m['qwen.guide.eyebrow']()}</p>
                <h2 id="qw-guide-heading">{m['qwen.guide.heading']()}</h2>
                <p>{m['qwen.guide.intro.one']()}</p>
                <p>{m['qwen.guide.intro.two']()}</p>
              </div>
              <aside
                className="qw-guide-map"
                aria-label={m['qwen.guide.map.heading']()}
              >
                <p className="qw-guide-map-label">
                  {m['qwen.guide.map.heading']()}
                </p>
                <div>
                  <span>01</span>
                  <strong>{m['qwen.guide.map.subject']()}</strong>
                  <i />
                </div>
                <div>
                  <span>02</span>
                  <strong>{m['qwen.guide.map.scene']()}</strong>
                  <i />
                </div>
                <div>
                  <span>03</span>
                  <strong>{m['qwen.guide.map.finish']()}</strong>
                  <i />
                </div>
                <p className="qw-guide-map-note">
                  {m['qwen.guide.map.note']()}
                </p>
              </aside>
            </div>
            <div className="qw-guide-topline">
              <span>{m['qwen.guide.steps_label']()}</span>
              <span>{m['qwen.guide.steps_count']()}</span>
            </div>
            <div className="qw-guide-topics">
              {guideTopics.map((topic) => (
                <article className="qw-guide-topic" key={topic.number}>
                  <div className="qw-guide-topic-head">
                    <span className="qw-guide-number">{topic.number}</span>
                    <span className="qw-guide-topic-mark" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                  <div className="qw-guide-topic-copy">
                    <h3>{topic.heading()}</h3>
                    <p>{topic.one()}</p>
                    <p>{topic.two()}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="qw-guide-faq">
              <div className="qw-guide-faq-intro">
                <p className="qw-eyebrow">{m['qwen.guide.faq.eyebrow']()}</p>
                <h2>{m['qwen.guide.faq.heading']()}</h2>
                <span>{m['qwen.guide.faq.note']()}</span>
              </div>
              <div className="qw-guide-answers">
                {guideQuestions.map((item, index) => (
                  <details
                    className="qw-guide-answer"
                    key={item.question()}
                    open={index === 0}
                  >
                    <summary>
                      <span>{item.question()}</span>
                      <i aria-hidden="true">+</i>
                    </summary>
                    <p>{item.answer()}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="qw-build">
          <div className="qw-wrap qw-build-grid">
            <div>
              <p className="qw-eyebrow">{m['qwen.build.eyebrow']()}</p>
              <h2>{m['qwen.build.heading']()}</h2>
              <p>{m['qwen.build.description']()}</p>
              <Link className="qw-button qw-button-cream" href="/playground">
                {m['qwen.build.cta']()} <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="qw-build-art">
              <ArtworkVisual
                image="portrait"
                title={m['qwen.art.portrait']()}
              />
            </div>
          </div>
        </section>
        <section id="sources" className="qw-sources qw-wrap">
          <div className="qw-section-head">
            <p className="qw-eyebrow">{m['qwen.sources.eyebrow']()}</p>
            <h2>{m['qwen.sources.heading']()}</h2>
            <p>{m['qwen.sources.description']()}</p>
          </div>
          <div className="qw-source-list">
            <a
              href="https://huggingface.co/docs/diffusers/main/api/pipelines/qwenimage21"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>01</span>
              <div>
                <small>Hugging Face · Diffusers</small>
                <strong>{m['qwen.sources.one']()}</strong>
              </div>
              <ArrowUpRight size={20} />
            </a>
            <a
              href="https://github.com/QwenLM/Qwen-Image-2.1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>02</span>
              <div>
                <small>Qwen · GitHub</small>
                <strong>{m['qwen.sources.two']()}</strong>
              </div>
              <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
        <QwenPricing />
        <section className="qw-closing qw-wrap">
          <div>
            <p className="qw-eyebrow">{m['qwen.closing.eyebrow']()}</p>
            <h2>{m['qwen.closing.heading']()}</h2>
          </div>
          <Link className="qw-button qw-button-dark" href="/playground">
            {m['qwen.closing.cta']()} <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <footer className="qw-footer qw-wrap">
        <div className="qw-footer-top">
          <Link href="/" className="qw-brand">
            <img
              src={envConfigs.app_logo}
              alt={m['qwen.logo_alt']({ name: envConfigs.app_name })}
              width="28"
              height="28"
            />
            <span>{envConfigs.app_name}</span>
          </Link>
          <p>{m['qwen.footer.note']()}</p>
          <div>
            <Link href="/privacy-policy">{m['qwen.footer.privacy']()}</Link>
            <Link href="/terms-of-service">{m['qwen.footer.terms']()}</Link>
          </div>
        </div>
        <div className="qw-footer-bottom">
          <span>
            © {new Date().getFullYear()} {envConfigs.app_name}
          </span>
          <BuiltWithShipAny />
        </div>
      </footer>
      {selected && (
        <div
          className="qw-modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="qw-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="qw-modal-close"
              onClick={() => setSelected(null)}
              aria-label={m['qwen.gallery.close']()}
            >
              <X size={22} />
            </button>
            <ArtworkVisual image={selected.image} title={selected.title()} />
            <div>
              <small>{m['qwen.gallery.concept_label']()}</small>
              <h3>{selected.title()}</h3>
              <p>{selected.note()}</p>
              <Link href="/playground">
                {m['qwen.gallery.try']()} <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
