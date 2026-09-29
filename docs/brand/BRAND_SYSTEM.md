# QwenImage AI brand system

## Design read

An image-making studio for visual creators, expressed as a contemporary digital darkroom. Editorial, tactile, deliberate. Design variance 7/10, motion 4/10, density 3/10.

## Identity

- **Signature:** a framed image with a single vermilion registration point. The image itself supplies most of the color.
- **Logo:** a geometric Q inside a pine square, with a small warm registration square. Use the mark at 28-40px in navigation, at 64px or more in standalone placements.
- **Voice:** concrete and invitational. Name the action (describe, refine, choose, copy). Distinguish original concept art from generated results.
- **Imagery:** gallery-quality light, tactile surfaces, believable materials, no baked text. Pair close human detail with sculptural objects and architecture. Do not reuse one crop as multiple works.

## Colors

| Role                | Light                    | Dark                     | Use                       |
| ------------------- | ------------------------ | ------------------------ | ------------------------- |
| Porcelain           | `oklch(0.969 0.007 104)` | `oklch(0.188 0.022 151)` | Page canvas               |
| Pine ink            | `oklch(0.248 0.027 153)` | `oklch(0.947 0.01 105)`  | Text and main action      |
| Gallery white       | `oklch(0.99 0.003 100)`  | `oklch(0.236 0.02 151)`  | Cards and form surfaces   |
| Sage mist           | `oklch(0.924 0.018 133)` | `oklch(0.282 0.018 151)` | Quiet surfaces            |
| Rule                | `oklch(0.827 0.018 133)` | `oklch(0.36 0.019 150)`  | Hairline dividers         |
| Registration orange | `oklch(0.64 0.16 40)`    | `oklch(0.7 0.14 40)`     | Focus and scarce emphasis |

## Type

- Display: Cormorant Garamond 400/500, sparingly for H1 and section titles, with Manrope fallback for Chinese glyphs.
- Interface and body: Manrope Variable, 400/500/650/750.
- Body: 15-16px, 1.65 line height. Captions: 11-12px, sentence case. Avoid repeated all-caps eyebrow labels.

## Components

- Primary action: pine fill, porcelain text, 6px radius. Secondary action: transparent with pine border.
- Field: gallery-white fill, hairline rule, 6px radius, orange focus ring.
- Artwork: true image asset, 6px corner radius; metadata sits below the image, not over it.
- Panel: hairline border or open spacing. Use shadow only for overlays.
- Layout: max width 1280px, 32px desktop outer gutter, 18px mobile gutter. Home gallery uses 12-column asymmetry; inner pages use a calmer 2-column workspace.
- Motion: 150-250ms hover and state transitions. Reveal selected content with a restrained fade. Honor reduced-motion preferences.

## Surfaces

Home, playground, blog, legal, authentication, account, and admin share the same tokens. Marketing pages use more display typography and imagery; working surfaces favor interface type and stronger field contrast. Light is the default theme, and dark mode uses the same hue relationships.
