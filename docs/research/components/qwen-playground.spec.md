# Playground specification

Reference page uses the same warm paper background, centered page heading and two bordered panels. Left panel collects a prompt and aspect ratio. Right panel shows a community image and labels it as inspiration rather than an output. Reference states the model is not available for generation yet.

First-version implementation adds a generation/editing mode switch. Editing mode accepts PNG/JPG/WebP images up to 10 MB for local preview. No image or prompt is sent to a server. Prepared text includes selected ratio and an edit-preservation instruction when relevant. The copy button reports success/error. Both panels collapse to one column on mobile.
