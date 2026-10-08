# LoftSims Image Outline Extractor

## v0.3.8-redo — experimental numbering layout correction

Supersedes the failed v0.3.7-redo as the active version on main. Preserves v0.3.6-redo as the prior working visual reference and v0.3.4-redo as the lossless SVG fidelity reference.

- Number detected geometry in traversal order rather than sorting all pieces by image rows.
- Use adaptive output enlargement (4×–16× based on label count).
- Find label positions in 2D whitespace; reserve each label rectangle to reduce collisions.
- Keep small blue dots on line coordinates and add leader lines for distant labels.
- Report candidate count, placed labels, placement failures and target omissions.
- Preserve image intake, extraction, single-line, lossless SVG and experimental visibility controls.

**Not validated:** the detector may still split/join geometric contours incorrectly; dense text may still cause layout failures. The underlying raster enlargement can increase apparent line thickness. Browser screenshot and acceptance testing required. The v0.3.7-redo branch is retained only as historical failed evidence, not the active release.

Open index.html locally. No build process.
