# LoftSims Image Outline Extractor

## v0.3.5-redo — SVG component visibility prototype

Preserves v0.3.4-redo lossless embedded-image SVG workflow. After **SVG fidelity PASS**, select **Segment SVG** to build separate SVG groups from 4-connected dark foreground pixel components. Use Segment ID + Toggle segment or Show all / Hide all; export the current visibility state as SVG.

**Important limits:** this is an independently switchable **connected-pixel-component prototype**, not yet geometric centerline segmentation. Crossing lines may belong to the same component. Diagonal pixel connections may split into separate groups. The segmented representation thresholds pixels to black/white and therefore is **not guaranteed lossless**; the prior lossless SVG remains the fidelity reference. Do not treat this as accepted until visually tested.

## Run
Open index.html, choose image, Extract outlines, Convert displayed image to SVG, confirm PASS, then Segment SVG.

The previously user-validated v0.3.4-redo is preserved as a branch.
