# LoftSims Image Outline Extractor

## v0.3.11-redo — clean centerline SVG and inventory-driven numbering

Based on the v0.3.9-redo geometry inventory and numbering. All detected candidate segments are numbered; the previous arbitrary target cap is not applied. The numbered SVG now draws each detected centerline as a thin black vector path on white, rather than scaling up the gray raster. Blue dots identify segment midpoints. Labels are placed nearby without long leader lines, with collision checks and a placement-failure count.

Preserved: picture intake, outline extraction, single-line path experiment, raster-exact SVG export and fidelity check, inventory, connected-component visibility tools, PNG/SVG downloads. The raster-exact SVG and the new vectorized numbered SVG are **different outputs**: the vector version is an approximation and does not inherit the pixel-exact fidelity PASS.

**Limitations:** Skeleton tracing may omit image detail or create spurs and discontinuities; clean vector paths are not guaranteed lossless. Dense regions can still cause label placement failures or labels covering linework. Segment inventory counts are heuristic. Visual validation required. Earlier branches remain available, including v0.3.9-redo.

Open index.html locally; no build tools.
