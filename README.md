# LoftSims Image Outline Extractor

## v0.3.2-redo — experimental target tracing points

The user-validated v0.3.0 baseline is preserved on branch `v0.3.0-rebuilt-working`.

- Target control: 100, 200, 300, 400, 500, 750, 1000.
- Walks adjacent Sobel edge pixels as graph paths instead of numbering row-wise pixel runs.
- Distributes target points across retained paths by path length.
- 4× tracing sheet, offset numeric labels and leader lines.
- Preserves original file intake, extraction and single-line path functionality.

**Limitations:** This is a heuristic graph trace, not validated geometric straight/curve classification. Dense crossings, text and double edges may produce spurious paths. Alphabetical curve subdivisions are not implemented yet. Requested count is a target and actual labels may be fewer. Browser/visual acceptance testing remains pending.

## Run
Open `index.html` locally. Choose image → Extract outlines → Build tracing plan. No Python/build tools.
