# LoftSims Image Outline Extractor

## v0.3.12-redo — responsive numbering prototype

Preserves image intake, outline extraction, lossless SVG conversion and pixel comparison, segment inventory, experimental SVG segmentation controls, and SVG/PNG export. The previous v0.3.11-redo branch is retained as failed performance evidence.

Numbering now renders centerline paths and labels in batches of 50 with browser event-loop yields. Progress and **Cancel numbering** are available. A spatial index reduces label collision checking cost; local placement searches are capped. The SVG uses thin black vector paths on white rather than an enlarged gray raster. Detected candidates, placed labels, and omissions are reported.

**Limitations:** This reduces main-thread blocking but does not yet use a Web Worker. Counting and final SVG DOM insertion may still be expensive for very large images. Skeleton-based centerline extraction remains an approximation, not lossless; browser visual/performance testing is pending.

Open index.html locally, Extract outlines, Convert displayed image to SVG, confirm PASS, Count line segments, Number line segments.
