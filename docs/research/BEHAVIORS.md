# Reference behavior and local implementation

- Header: desktop inline navigation; collapses on narrow screens. Local menu button expands an in-flow link panel.
- Hero: links jump to the gallery or navigate to the playground. Local images are illustrative.
- Gallery: category buttons filter the grid; search narrows the current category; cards open a larger detail dialog. Verified locally with the Editing filter (2 cards) and a card detail dialog.
- Playground: reference currently states Qwen Image 2.1 generation is unavailable. Local studio likewise prepares prompts without claiming to generate images. It supports generation/edit drafts, aspect ratio selection, inspiration prompts, local image preview and clipboard copy. Verified local mode switch, 16:9 selection and successful copy.
- Responsive: reference at 390px uses a single-column hero and hides inline navigation. Local page uses the same break and reports document scroll width of 390px at a 390px viewport.
- Motion: subtle image scale on hover and button lift. Reduced-motion media query disables both.
