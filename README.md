# LoftSims Image Outline Extractor

## v0.3.10-redo — proportional SVG numbering

Retains v0.3.9-redo segment inventory and prior capabilities. Numbered SVG now uses a single original-image coordinate system and a common viewBox for the image, dots and numbers. The exported SVG scales annotations together with image geometry. Removed long leader lines. Number labels are restricted to nearby above/below positions; if all local slots collide, the label is omitted and counted as a placement failure rather than drawn remotely.

**Known limitations:** Labels can still overlap underlying image lines; at high density some numbers will be omitted. Enlarging an embedded raster does not create vector centerlines or improve raster stroke fidelity. Browser visual acceptance testing pending. v0.3.9-redo remains a preserved branch.

Run by opening index.html locally.
