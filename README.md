# LoftSims Image Outline Extractor

## v0.3.7-redo — expanded numbering coverage

Preserves v0.3.6-redo numbering and earlier image intake, outline extraction, lossless SVG conversion, SVG/PNG downloads and experimental segment visibility.

New **All Segments** target mode removes the 100–1000 numbering cap. The tracing walker now retains short paths of at least two pixels, and the geometric subdivision threshold is reduced. Status reports candidate detected segments, numbered segments and unnumbered candidates. Existing target options remain available for selective numbering.

**Limitations:** detection is heuristic; not every physical or semantic line is necessarily identified. All Segments can create a large SVG with overlapping labels. Zero unnumbered *detected* candidates does not prove full geometric coverage. Visual validation is pending. The v0.3.6-redo branch remains available as the working reference.

Open index.html locally; no build process.
