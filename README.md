# LoftSims Image Outline Extractor

## v0.3.6-redo — geometric numbering experiment

**Primary new function: Number line segments.** Existing image intake, outline extraction, single-line path, lossless SVG conversion and independent component show/hide tools remain in the application.

Workflow: Choose picture → Extract outlines → Convert displayed image to SVG (verify PASS) → Number line segments → Download numbered SVG.

The numbering algorithm applies iterative skeleton thinning, follows adjacent skeleton pixels into paths at endpoints and junctions, divides paths at larger direction changes, and numbers detected pieces in approximate reading order. Target tracing points (100–1000) acts as a maximum, not an exact quota. Each number has a small blue dot at a detected line coordinate.

**Validation pending:** This is a heuristic, not certified semantic straight/curve recognition. Fine intersections and text may create false segments; 4× raster enlargement can thicken displayed underlying strokes. The independently validated lossless SVG conversion is retained unchanged as the reference, and the segmentation experiment remains accessible. The numbered sheet is NOT yet validated as pixel-perfect or visually legible. Preserve previous release branches.

Run: open index.html directly in browser, no Python or build process.
