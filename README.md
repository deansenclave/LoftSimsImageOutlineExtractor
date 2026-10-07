# LoftSims Image Outline Extractor

**Version 0.1.0**

Browser-native image outline extraction with a focused contract:

**Picture in → outlines out**

## v0.1.0
- Accepts JPG, PNG and WebP.
- Displays the original picture.
- Converts pixels to grayscale and optionally smooths noise.
- Uses Sobel gradient magnitude to identify visible boundaries.
- Adjustable sensitivity, smoothing and line thickness.
- Produces a black-on-white outline picture.
- Downloads the result as PNG.
- Processing stays in the browser; no image upload service is required.

## Run
Open `index.html` in a modern browser. No Python, package manager, build process or server is required.

## Stack
HTML / CSS / JavaScript / Canvas

## Next validation
Test against photographs, drawings, objects, faces and mixed scenes, then distinguish meaningful structural outlines from texture/noise before expanding into SVG/geometry reconstruction.
