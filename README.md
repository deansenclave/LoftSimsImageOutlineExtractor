# LoftSims Image Outline Extractor

**v0.3.0 — clean rebuild from user-validated v0.2.0**

The v0.3.0–v0.3.9 attempts were not accepted as working. This rebuild restores the original v0.2.0 input, Sobel extraction, and continuous-path pipeline. It adds a separate, preliminary **Build tracing plan** action after the path is built.

## Workflow
Choose picture → Extract outlines → Build single-line path → Build tracing plan → Download PNG.

## Current limitation
Tracing plan labels are sampled along the continuous path. They are **not** yet labels of independent geometrically meaningful contours. The intended numeric-contour/alphabetic-curve labeling and collision-free layout require a separate validated algorithm. This is a rebuild checkpoint, not a completed contour-tracing solution.

## Run
Open `index.html` in a browser. HTML, CSS, JS and Canvas only; no Python or build system.

## Historical baseline
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
