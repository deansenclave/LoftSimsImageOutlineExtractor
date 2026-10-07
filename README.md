# LoftSims Image Outline Extractor

**Version 0.2.0**

**Picture → outline → continuous pen path**

## v0.2.0
- Preserves the working v0.1.0 JPG/PNG/WebP outline extraction.
- Adds **Build single-line path**.
- Samples detected outline points and orders them into one continuous route.
- The rendered route is one uninterrupted stroke: no pen-up operation.
- Disconnected outline regions are joined by travel strokes; existing regions may be retraced where needed.
- Downloads the single-line result as PNG.
- Entirely browser-native: HTML / CSS / JavaScript / Canvas.

## v0.1.0 baseline
Grayscale conversion, smoothing, Sobel gradient outline detection, adjustable sensitivity/line thickness, and PNG output.

## Run
Open `index.html` in a modern browser. No Python, package manager, build process or server is required.

## Validation note
v0.2.0 establishes the no-pen-lift path mechanism. Visual validation on different photographs is the next step; path quality and connector minimization can then be refined without changing the v0.1.0 extractor baseline.
