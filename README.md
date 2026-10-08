# LoftSims Image Outline Extractor

## v0.3.17-redo — SVG suitability profiler and consolidation

After **Count line segments**, click **Profile SVG**. The profiler reports candidate segment count, connected groups, open endpoints, junctions, short fragments, largest connected group coverage, and a **heuristic suitability score from 1 to 10**. It projects a segment count and score after consolidation. Choose **Conservative**, **Balanced** (default), or **Aggressive**, then **Apply consolidation** to use the proposed exact-endpoint joins before previewing, numbering, or exporting geometric segments.

Consolidation concatenates complete vertex paths at shared endpoints only, with a directional compatibility threshold. It does not delete individual source vertices or synthesize connections across gaps. Previously detected geometry is retained; the number of candidate segments may decrease. Numbering still defaults to 200 and can be set to All Segments. Existing numbering and Segment SVG operate on the current consolidated inventory.

**Important limitations:** Score is an experimental graph heuristic, not an independently validated 1–10 quality assessment. Consolidation does not repair disconnected source contours. Initial extraction and skeleton tracing are approximate; the tool cannot guarantee all source detail was recovered. Large drawings may remain computationally expensive. Browser visual/performance testing pending.

Open index.html locally. Workflow: load → Extract outlines → Convert displayed image to SVG → Count line segments → Profile SVG → Apply consolidation (optional) → Preview clean SVG → Number line segments.
