import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { QwenHeader } from '@/blocks/qwen-home';

import '@/styles/qwen-site.css';
import '@/styles/qwen-refined.css';
import '@/styles/qwen-seo-pages.css';

export type SeoPageKey = 'edit' | 'generator' | 'model';

const pages: Record<
  SeoPageKey,
  {
    eyebrow: string;
    title: string;
    intro: string;
    sections: Array<{ heading: string; body: string }>;
  }
> = {
  edit: {
    eyebrow: 'IMAGE EDITING WORKFLOW',
    title: 'Qwen Image Edit',
    intro:
      'Qwen Image 2.1 supports image editing alongside text-to-image creation. Describe the change you want, identify the area or object, and state which details should remain consistent.',
    sections: [
      {
        heading: 'Write an edit brief with a clear boundary',
        body: 'Start with the source image and the requested change: replace the background, adjust the light, recolor one object, or add a specific element. Then name what must stay untouched, such as the subject’s face, camera angle, product label, silhouette, or surrounding composition. This gives an image model a concrete edit boundary instead of an open-ended request.',
      },
      {
        heading: 'Use references with a purpose',
        body: 'When a workflow accepts reference images, assign each one a role. One can define the person, another the wardrobe, and another the setting or visual style. Mention those roles in the prompt so the references do not compete. For local changes, describe the region or mask and explain how its edge should blend with the surrounding image.',
      },
      {
        heading: 'Keep product details consistent',
        body: 'For product work, list the details that cannot drift: color, material, logo placement, packaging text, shape, and scale. Ask for the requested adjustment while preserving those anchors. Review small text and fine edges after generation, since these details can still need correction.',
      },
    ],
  },
  generator: {
    eyebrow: 'TEXT TO IMAGE',
    title: 'Qwen Image Generator',
    intro:
      'Create an image from a written brief. Put the subject first, then describe the setting, composition, light, material, and intended visual finish.',
    sections: [
      {
        heading: 'Build the prompt from the scene outward',
        body: 'A useful prompt reads like concise art direction. Name the subject and action, place it in a setting, choose a viewpoint, then describe the light and palette. “A ceramic cup” leaves many choices open; adding a pale stone table, overhead framing, handmade glaze, and soft morning light establishes a more deliberate frame.',
      },
      {
        heading: 'Choose the frame before adding detail',
        body: 'Match the aspect ratio to the idea: square for a product or icon, portrait for a character, and landscape for a room or horizon. Keep the hierarchy clear by describing the main subject before secondary objects. Add style references only when they clarify the result.',
      },
      {
        heading: 'Ask for transparent assets explicitly',
        body: 'For a cutout, sticker, or compositing element, request a transparent background and describe the full silhouette, edge quality, and any contact shadow. Check the resulting alpha channel in the image tool before placing the asset over another background.',
      },
    ],
  },
  model: {
    eyebrow: 'MODEL OVERVIEW',
    title: 'Qwen Image 2.1',
    intro:
      'Qwen Image 2.1 is a 7B image model for text-to-image creation and image editing. Its published workflow highlights typography, native transparent RGBA output, and multi-image references.',
    sections: [
      {
        heading: 'One workflow for creation and editing',
        body: 'The model is designed to generate new scenes and revise existing images. A creation prompt describes the subject, setting, framing, and finish. An editing prompt names the change and protects the parts that should remain. This makes the written brief useful for both a blank canvas and an existing image.',
      },
      {
        heading: 'Typography and transparent output',
        body: 'The release focuses on more legible text and layout in images, along with native transparent output for supported workflows. For a poster or package, put exact copy in quotation marks and describe its placement and hierarchy. For an isolated asset, request transparency and inspect the delivered file.',
      },
      {
        heading: 'References for multi-subject scenes',
        body: 'Multiple reference images can help define subjects, wardrobe, objects, and settings. Give each image a specific role and describe how the final scene should combine them. The official repository and deployment documentation provide the current setup details and examples.',
      },
    ],
  },
};

export function QwenSeoPage({ page }: { page: SeoPageKey }) {
  const content = pages[page];
  return (
    <div className="qw-site qw-seo-page">
      <QwenHeader />
      <main className="qw-seo-main qw-wrap">
        <p className="qw-eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="qw-seo-lead">{content.intro}</p>
        <div className="qw-seo-sections">
          {content.sections.map((section, index) => (
            <section className="qw-seo-section" key={section.heading}>
              <span className="qw-seo-number">0{index + 1}</span>
              <div>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            </section>
          ))}
        </div>
        <aside className="qw-seo-cta">
          <div>
            <p className="qw-eyebrow">A CLEARER FIRST FRAME</p>
            <h2>Turn a visual idea into a prompt.</h2>
          </div>
          <Link className="qw-button qw-button-dark" href="/playground">
            {m['qwen.hero.create']()} <ArrowRight size={17} />
          </Link>
        </aside>
        <nav className="qw-seo-related" aria-label="Related pages">
          <Link href="/qwen-image-edit">
            Qwen Image Edit <ArrowUpRight size={14} />
          </Link>
          <Link href="/qwen-image-generator">
            Qwen Image Generator <ArrowUpRight size={14} />
          </Link>
          <Link href="/qwen-image">
            Qwen Image 2.1 <ArrowUpRight size={14} />
          </Link>
        </nav>
      </main>
    </div>
  );
}

export const seoPageMeta: Record<
  SeoPageKey,
  { title: string; description: string; path: string }
> = {
  edit: {
    title: 'Qwen Image Edit | Edit Images with Qwen Image 2.1',
    description:
      'Learn how to edit images with Qwen Image 2.1. Write focused edit prompts, preserve important details, and plan reference-guided changes.',
    path: '/qwen-image-edit',
  },
  generator: {
    title: 'Qwen Image Generator | Create Images Online',
    description:
      'Explore the Qwen Image generator workflow: describe a subject, choose a composition, and create a clear text-to-image prompt.',
    path: '/qwen-image-generator',
  },
  model: {
    title: 'Qwen Image 2.1 | Image Creation & Editing',
    description:
      'Learn about Qwen Image 2.1 image generation, editing, transparent RGBA output, typography, and multi-image reference workflows.',
    path: '/qwen-image',
  },
};
