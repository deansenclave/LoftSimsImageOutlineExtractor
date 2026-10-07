# LoftSims Image Outline Extractor

**Version 0.2.1**

**Picture → outline → continuous pen path → numbered drawing sequence**

## v0.2.1
- Preserves v0.2.0 continuous no-pen-lift path generation.
- Adds **Number path**.
- Adds adjustable checkpoint count (5–50).
- Places ordered checkpoint numbers along the generated path.
- Marks START and END so drawing direction is visible.
- Numbered result can be downloaded as PNG.

## v0.2.0
Introduced the single continuous pen path. Disconnected regions are connected by travel strokes where required.

## v0.1.0
Introduced browser-native JPG/PNG/WebP outline extraction using grayscale conversion, smoothing and Sobel gradient detection.

## Run
Open `index.html` in a modern browser. No Python, package manager, build process or server is required.

## Stack
HTML / CSS / JavaScript / Canvas
