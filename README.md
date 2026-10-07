# LoftSims Image Outline Extractor

**Version 0.3.2**

## v0.3.2 — image-loading fix
- Replaced the object-URL-only loader with FileReader/DataURL loading for local images.
- Added explicit read/decode/load error reporting.
- Displays loaded filename and native dimensions when loading succeeds.

## v0.3.1 — ordered tracing sheet
v0.3.0 visual validation showed that placing every detected geometric label directly on the source-sized outline made the result unreadable.

v0.3.1 changes the output model:
- Builds a high-resolution tracing canvas at 2.5× source scale plus outer annotation margin.
- Keeps the outline itself visually clean.
- Sequences independent contours numerically: 1, 2, 3…
- Complex contours receive belonging alphabetical trace references: 1a, 1b, 1c, 1d; 2a, 2b…
- Labels are offset from the contour and connected to their exact trace location by leader lines.
- Includes collision avoidance so annotation boxes do not overwrite each other.
- Downloaded PNG retains full tracing-sheet resolution even when the browser preview is visually scaled.

## Version history
- **v0.3.0** — first geometry-derived analysis; retained as a validation baseline.
- **v0.2.1** — arbitrary numbered checkpoints.
- **v0.2.0** — continuous path experiment.
- **v0.1.0** — browser-native outline extraction.

## Run
Open `index.html` in a modern browser. No Python or build process is required.
