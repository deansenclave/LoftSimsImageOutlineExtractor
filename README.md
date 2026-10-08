# LoftSims Image Outline Extractor

## v0.3.14-redo — geometric candidate consolidation and shared IDs

This experimental revision removes very short skeleton fragments (under 5 image pixels) from the candidate inventory, attempts to join near-collinear fragments sharing endpoints, and assigns stable IDs within the resulting inventory. Numbering defaults to the 200 longest candidates rather than forcing tens of thousands of labels; the All Segments option remains available. Blue text is reduced from 18 to 9 SVG units, and dots from radius 2.5 to 1.7. Numbering remains incremental and cancellable.

**Segment SVG** now uses the same candidate geometry and IDs as Count and Number; Show all, Hide all, Toggle segment, and segmented SVG export act on candidate paths rather than raster-connected components.

Workflow: load image → Extract outlines → Convert displayed image to SVG → Count line segments → Preview clean SVG → Number line segments or Segment SVG.

**Limitations and test status:** Code pushed, browser visual/performance validation not yet performed. This is heuristic consolidation, not guaranteed identification of real-world line segments. Short detail can be excluded, complex junctions can remain fragmented, and numbering with All Segments can still be expensive. The earlier branches and raster-fidelity SVG remain preserved.
