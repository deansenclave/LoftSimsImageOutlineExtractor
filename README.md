# LoftSims Image Outline Extractor

## v0.3.16-redo — contour-following numbering (experimental)

Replaces longest-first segment numbering with a deterministic adjacency traversal. Candidate geometric segments sharing an exact skeleton endpoint are grouped into traversal order, beginning with available free endpoints; branch choices prefer directional continuation and then a stable tie-break. Remaining loops and disconnected segments are processed in coordinate order. IDs are assigned once from that traversal and reused in Count, Number, and Segment SVG.

The continuity-preservation changes from v0.3.15-redo, clean SVG preview, default 200 labels, small blue text/dots, and cancellable numbering remain.

**Known limitations:** Adjacency requires exact shared endpoints; nearby but disconnected contours are not reconnected. Junction traversal is heuristic, and a branch may be numbered after another branch or a separate start; this is not yet an optimized continuous-pen route. Browser visual/performance testing pending.

Open index.html locally; Extract outlines → Convert displayed image to SVG → Count line segments → Preview clean SVG → Number line segments.
