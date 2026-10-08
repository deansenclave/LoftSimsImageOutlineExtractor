# LoftSims Image Outline Extractor

## v0.3.13-redo — independent clean SVG preview

Adds **Preview clean SVG** between segment counting and numbering. It draws the detected skeleton centerlines as thin black vector strokes on a white SVG background without embedding gray raster pixels. This permits inspection of geometry *before* numbering. Preview rendering yields every 50 paths and supports cancellation through the existing Cancel numbering control. Numbering reuses the same vector-path renderer. Earlier features and branches are retained.

Workflow: Choose picture → Extract outlines → Convert displayed image to SVG (raster fidelity check) → Count line segments → Preview clean SVG → Number line segments → Download numbered SVG.

**Validation pending:** Browser visual and performance tests. Counting still uses synchronous thinning, and large final SVG insertion can stall. Centerline geometry is heuristic and may fragment lines; removing gray pixels does not guarantee a faithful outline. The original lossless raster-embedded SVG remains separately available.
