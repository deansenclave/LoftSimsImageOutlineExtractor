# LoftSims Image Outline Extractor

## v0.3.4-redo — fidelity-first SVG conversion

This version isolates SVG fidelity, postponing numbering and path vectorization.

1. Choose an image and **Extract outlines**. Optionally **Build single-line path**.
2. Click **Convert displayed image to SVG**.
3. The app embeds the exact current canvas PNG in an SVG image element and rasterizes it back to a canvas at original dimensions.
4. It compares every RGBA pixel. **Download SVG** is enabled only if the pixel comparison reports zero mismatches.

This is **lossless SVG packaging of raster pixels**, not editable vector paths. Enlarging it does not create new detail. True vector path reconstruction is a separate future step requiring its own fidelity comparison. Original user-validated v0.3.0 is preserved as branch `v0.3.0-rebuilt-working`.

Run by opening `index.html` locally. No build tools required. Browser acceptance test pending.
