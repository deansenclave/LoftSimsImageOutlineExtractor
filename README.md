# LoftSims Image Outline Extractor

## v0.3.15-redo — preserve short traced geometry

Corrects two v0.3.14-redo continuity regressions: short traced pieces are no longer discarded by the five-pixel candidate filter, and subdivision no longer skips pixels following a split. The clean SVG preview, numbering, and geometric Segment SVG all consume the same preserved candidate inventory. Numbering remains capped at 200 by default; unnumbered paths remain visible. Previous versions are retained.

Workflow: load → Extract outlines → Convert displayed image to SVG → Count line segments → Preview clean SVG → Number line segments → Segment SVG.

**Important limitation:** This fixes identified causes of missing paths but does not yet bridge genuine gaps between separately detected contours. Sobel extraction, skeleton thinning, and junction tracing can still lose fidelity; no claim of full continuity or visual validation is made. Browser testing is pending.
