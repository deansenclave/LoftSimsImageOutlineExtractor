# LoftSims Image Outline Extractor

## v0.3.18-redo — reliable profiling and Diagnostics Footnotes

### Changes
- SVG profiling now uses union-find connectivity rather than a quadratic segment adjacency graph, reducing memory pressure for very large inventories.
- A dedicated, readable SVG Profile / Diagnostics Footnotes panel reports candidate counts, connected contours, endpoints, junctions, short-fragment percentage, proposed consolidation reduction, and heuristic suitability score (1–10).
- **Download Diagnostics Footnotes JSON** exports structured observations, proposals, assertions, and limitations.
- Count-consistency checks compare the actual current inventory with the proposed consolidation result; Apply consolidation is disabled when checks fail.
- Numbering reports the number of **selected** dots rather than all detected candidates.
- Prior branches and SVG export capabilities remain available.

### Workflow
Open index.html → load picture → Extract outlines → Convert displayed image to SVG → Count line segments → Profile SVG → optionally Apply consolidation → Preview clean SVG → Number line segments.

### Remaining limitations
The new profiler improves speed and observability, **not** underlying skeleton quality. Exact-endpoint consolidation may still produce negligible reduction for heavily fragmented artwork; no geometry is invented to force joins. The 1–10 suitability score is heuristic and not calibrated. Browser visual/performance tests remain pending. JavaScript syntax check passed, but this is not end-to-end validation.
