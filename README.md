# LoftSims Image Outline Extractor

**Version 0.3.0**

**Picture → outlines → unique contours → geometric transitions → drawing instructions**

## v0.3.0
This version replaces the arbitrary v0.2.1 checkpoint-count model with geometry-derived labeling based on the supplied examples.

- Detects connected/unique outline contours.
- Traces each contour and simplifies small pixel fluctuations.
- Detects major direction changes as geometric transition points.
- Straight runs remain unsplit unless their geometry changes.
- Detects curved runs separately.
- Each detected curved run receives four ordered reference points **a, b, c, d**, defining **AB, BC, CD** portions.
- Major contour transition points receive sequential numeric labels.
- Exports the annotated geometry as PNG.

## Version history
- **v0.2.1** — arbitrary numbered checkpoints (superseded by geometry-derived segmentation).
- **v0.2.0** — continuous no-pen-lift path generation.
- **v0.1.0** — browser-native image outline extraction.

## Run
Open `index.html` in a modern browser. No Python, package manager, build process or server is required.

## Validation
v0.3.0 is the first geometry-derived implementation. The supplied hand-drawn examples define the intended behavior; visual validation will determine threshold refinements for corner-vs-curve classification.
