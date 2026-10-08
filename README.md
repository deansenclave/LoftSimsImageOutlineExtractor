# LoftSims Image Outline Extractor

## v0.3.3-redo — SVG tracing sheet (experimental)

- Preserves user-validated v0.3.0 in branch `v0.3.0-rebuilt-working`.
- Original PNG/JPG/WebP intake and Sobel extraction retained.
- SVG path output from the graph-based connected contour traces.
- Fixed **1 px** SVG path stroke at 4× geometry size (no thickness multiplication).
- Numbered blue dots centered on the traced path coordinates; blue numbers offset above/below without cutting the path.
- Download SVG and PNG. Target point choices: 100–1000.

**Not yet validated:** graph tracing can create spurious branches and double edges on dense drawings. The target is approximate, and labels may overlap nearby contours or one another. This is not yet reliable vector simplification or curve classification. Test with representative images before acceptance.

## Run
Open `index.html`; choose picture, Extract outlines, then Build tracing plan. No build tools required.
