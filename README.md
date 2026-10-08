# LoftSims Image Outline Extractor

## v0.3.9-redo — segment inventory before numbering

Preserves prior image intake, outline extraction, single-line drawing, lossless SVG conversion, experimental component visibility, and numbering tools. New required sequence: **Extract outlines → Convert displayed image to SVG → SVG fidelity PASS → Count line segments → Review inventory → Number line segments**.

Inventory reports total detected candidate segments, approximate straight/curved classification, traced chains, and skeleton pixels. Counting uses the same geometric detector that supplies the numbering operation, so the candidate count and numbering source remain aligned. A fresh extraction or SVG conversion invalidates the previous inventory.

**Known limitations:** These are heuristic candidate counts, not guaranteed unique semantic segments. Straight/curve classification uses maximum deviation from a segment chord. The older v0.3.8 label renderer (including distant leader lines) remains available but is **not accepted**; this version focuses on counting, not visual layout correction. The lossless SVG baseline remains unchanged. Browser validation pending.

Run locally by opening index.html; no build tools required.
