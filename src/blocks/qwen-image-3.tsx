import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import {
  CREDITS_PER_IMAGE,
  MAX_EDIT_INPUT_IMAGES,
  MAX_IMAGES_PER_REQUEST,
} from '@/config/qwen-image';
import { m } from '@/paraglide/messages.js';
import { getLocale, type Locale } from '@/paraglide/runtime.js';
import { Header } from '@/blocks/header';
import { QwenImageGenerator } from '@/blocks/qwen-playground';

import '@/styles/qwen-image-3.css';

// Both the visible FAQ and the route's structured data use these exact answers.
export function getQwenImage3Faq(locale: Locale) {
  const options = { locale };
  return [
    {
      question: m['qwen.image3.faq.1.question']({}, options),
      answer: m['qwen.image3.faq.1.answer']({}, options),
    },
    {
      question: m['qwen.image3.faq.2.question']({}, options),
      answer: m['qwen.image3.faq.2.answer'](
        {
          oneK: String(CREDITS_PER_IMAGE['1k']),
          twoK: String(CREDITS_PER_IMAGE['2k']),
        },
        options
      ),
    },
    {
      question: m['qwen.image3.faq.3.question']({}, options),
      answer: m['qwen.image3.faq.3.answer'](
        { max: String(MAX_EDIT_INPUT_IMAGES) },
        options
      ),
    },
    {
      question: m['qwen.image3.faq.4.question']({}, options),
      answer: m['qwen.image3.faq.4.answer']({}, options),
    },
    {
      question: m['qwen.image3.faq.5.question']({}, options),
      answer: m['qwen.image3.faq.5.answer']({}, options),
    },
    {
      question: m['qwen.image3.faq.6.question']({}, options),
      answer: m['qwen.image3.faq.6.answer']({}, options),
    },
  ];
}

export function QwenImage3Page() {
  const faq = getQwenImage3Faq(getLocale());
  const sections = [
    {
      id: 'overview',
      heading: m['qwen.image3.overview.heading'](),
      paragraphs: [
        m['qwen.image3.overview.one'](),
        m['qwen.image3.overview.two'](),
      ],
    },
    {
      id: 'prompts',
      heading: m['qwen.image3.prompt.heading'](),
      paragraphs: [
        m['qwen.image3.prompt.one'](),
        m['qwen.image3.prompt.two'](),
      ],
    },
    {
      id: 'editing',
      heading: m['qwen.image3.editing.heading'](),
      paragraphs: [
        m['qwen.image3.editing.one']({ max: String(MAX_EDIT_INPUT_IMAGES) }),
        m['qwen.image3.editing.two'](),
      ],
    },
    {
      id: 'workflow',
      heading: m['qwen.image3.workflow.heading'](),
      paragraphs: [
        m['qwen.image3.workflow.one']({ max: String(MAX_IMAGES_PER_REQUEST) }),
        m['qwen.image3.workflow.two'](),
      ],
    },
  ];

  return (
    <div className="qw-site qw-image3">
      <a className="qw-skip" href="#generator">
        {m['qwen.image3.jump_generator']()}
      </a>
      <Header />
      <main>
        <section className="qw-image3-hero qw-wrap">
          <div>
            <p className="qw-eyebrow">{m['qwen.image3.eyebrow']()}</p>
            <h1>{m['qwen.image3.heading']()}</h1>
            <p className="qw-image3-tagline">{m['qwen.image3.tagline']()}</p>
          </div>
          <div className="qw-image3-hero-copy">
            <p>{m['qwen.image3.intro']()}</p>
            <nav aria-label={m['qwen.image3.navigation']()}>
              <a className="qw-button qw-button-dark" href="#generator">
                {m['qwen.image3.jump_generator']()} <ArrowDown size={16} />
              </a>
              <a href="#guide">{m['qwen.image3.jump_guide']()}</a>
              <a href="#faq">{m['qwen.image3.jump_faq']()}</a>
            </nav>
          </div>
        </section>

        <section
          id="generator"
          className="qw-image3-studio qw-wrap"
          aria-labelledby="qw-image3-generator-heading"
        >
          <div className="qw-image3-studio-heading">
            <h2 id="qw-image3-generator-heading">
              {m['qwen.image3.generator_heading']()}
            </h2>
            <span>{m['qwen.image3.generator_note']()}</span>
          </div>
          <ul className="qw-image3-specs">
            <li>{m['qwen.image3.resolution']()}</li>
            <li>
              {m['qwen.image3.references']({
                max: String(MAX_EDIT_INPUT_IMAGES),
              })}
            </li>
            <li>
              {m['qwen.image3.count']({ max: String(MAX_IMAGES_PER_REQUEST) })}
            </li>
          </ul>
          <QwenImageGenerator embedded returnTo="/qwen-image-3-0" />
        </section>

        <div className="qw-image3-reading-band">
          <div className="qw-image3-reading qw-wrap">
            <aside className="qw-image3-index">
              <p className="qw-eyebrow">{m['qwen.image3.navigation']()}</p>
              <nav aria-label={m['qwen.image3.jump_guide']()}>
                {sections.map((section, index) => (
                  <a href={`#${section.id}`} key={section.id}>
                    <span>0{index + 1}</span>
                    {section.heading}
                  </a>
                ))}
                <a href="#faq">
                  <span>05</span>
                  {m['qwen.image3.jump_faq']()}
                </a>
              </nav>
              <Link href="/pricing" className="qw-image3-pricing-link">
                {m['qwen.nav.pricing']()} <ArrowUpRight size={15} />
              </Link>
            </aside>

            <article id="guide" className="qw-image3-article">
              <p className="qw-eyebrow">{m['qwen.image3.guide_eyebrow']()}</p>
              <h2>{m['qwen.image3.guide_heading']()}</h2>
              <p className="qw-image3-guide-lead">
                {m['qwen.image3.guide_intro']()}
              </p>
              {sections.map((section, index) => (
                <section id={section.id} key={section.id}>
                  <span className="qw-image3-section-number">0{index + 1}</span>
                  <h3>{section.heading}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
              <nav
                className="qw-image3-sources"
                aria-label={m['qwen.image3.sources']()}
              >
                <span>{m['qwen.image3.sources']()}</span>
                <a
                  href="https://qwen.ai/blog?id=qwen-image-3.0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m['qwen.image3.source_qwen']()} <ArrowUpRight size={13} />
                </a>
                <a
                  href="https://fal.ai/models/alibaba/qwen-image-3/text-to-image"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m['qwen.image3.source_generate']()}{' '}
                  <ArrowUpRight size={13} />
                </a>
                <a
                  href="https://fal.ai/models/alibaba/qwen-image-3/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m['qwen.image3.source_edit']()} <ArrowUpRight size={13} />
                </a>
              </nav>

              <section id="faq" className="qw-image3-faq">
                <p className="qw-eyebrow">{m['qwen.image3.faq_eyebrow']()}</p>
                <h2>{m['qwen.image3.faq_heading']()}</h2>
                {faq.map((item, index) => (
                  <details key={item.question} open={index === 0}>
                    <summary>
                      <span>{item.question}</span>
                      <i aria-hidden="true">+</i>
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </section>
            </article>
          </div>
        </div>

        <section className="qw-image3-closing qw-wrap">
          <h2>{m['qwen.image3.closing_heading']()}</h2>
          <a className="qw-button qw-button-dark" href="#generator">
            {m['qwen.image3.closing_cta']()} <ArrowRight size={16} />
          </a>
        </section>
        <nav
          className="qw-image3-related qw-wrap"
          aria-label={m['qwen.image3.related_label']()}
        >
          <Link href="/qwen-image-generator">
            {m['qwen.image3.related_generator']()} <ArrowUpRight size={14} />
          </Link>
          <Link href="/qwen-image-edit">
            {m['qwen.image3.related_edit']()} <ArrowUpRight size={14} />
          </Link>
        </nav>
      </main>
      <footer className="qw-play-footer qw-wrap">
        <span>
          © {new Date().getFullYear()} {envConfigs.app_name}
        </span>
        <span className="qw-pricing-footer-links">
          <Link href="/privacy-policy">{m['qwen.footer.privacy']()}</Link>
          <Link href="/terms-of-service">{m['qwen.footer.terms']()}</Link>
          <Link href="/refund-policy">{m['qwen.footer.refund']()}</Link>
        </span>
      </footer>
    </div>
  );
}
