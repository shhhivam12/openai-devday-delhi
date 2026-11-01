# Together identity

Use **the embrace** as the primary identity. Two people lean into a shared gesture of care; neither is depicted as the sole helper. Soft shapes and an open silhouette make the tone warm and hopeful. The raised fist is a complete alternate exploration expressing solidarity and determination, but the embrace better fits compassionate disaster coordination.

## Assets

| File in `public/brand/` | Purpose | Dimensions |
| --- | --- | --- |
| `mark.svg` | Transparent, text-free primary symbol for navigation and app UI | 128 × 128 |
| `wordmark.svg` | Primary horizontal lockup for light backgrounds | 720 × 160 |
| `logo-square.svg` | Coral app tile with ivory symbol; square corners for platform masking | 512 × 512 |
| `banner.svg` | Submission and presentation cover, 16:9 | 1600 × 900 |
| `fist-concept.svg` | Alternate raised-fist lockup; concept only | 640 × 176 |

All assets are self-contained SVGs with accessible titles and descriptions. The Together lettering and both symbols are original vector drawings. Banner supporting copy is outlined from the locally available Avenir Next font; the exported SVG has no font dependency. No raster images, scripts, linked resources, or remote assets are embedded. The embrace gap is baked into vector path geometry, with no masks or filters. The alternate fist uses a vector luminance mask for its finger creases.

## Use

- Use the embrace consistently; do not alternate it with the fist in the application.
- Give the mark at least one head diameter of clear space (24 units on its 128-unit grid). Keep the wordmark's own bounds clear of nearby UI and allow additional room when possible.
- Recommended minimum: 24 CSS px for the standalone mark and 160 CSS px wide for the wordmark. The contact sheet includes a 16 px stress test. At very small sizes, use the standalone mark rather than the full wordmark.
- The app tile's symbol fits inside the central circular maskable safe area. Export raster app icons at the sizes required by the eventual manifest/platform; no manifest has been changed here.
- Primary colors: warm ivory `#f6f5ef`, coral orange `#ef5b35`, near-black `#202923`, muted sage `#aab8a1`. The banner uses pale sage `#e3e8dd` as a background tint.
- Use near-black for ordinary text on ivory. Coral and sage are brand accents; evaluate UI text and control contrast separately.
- For a dark background, recolor the symbol and lettering to ivory in a derivative SVG. For the alternate fist, keep its black/white mask unchanged. The contact sheet's reversed mark is a CSS preview only.
- Preserve proportions, head sizes, and the gap between the arms. Do not add faces, emergency crosses, gradients, or shadows to the core mark.
- When rendering an SVG as an image, supply contextual alternative text (`alt="Together"` for a home link, or `alt=""` when adjacent text repeats the name). Internal SVG titles alone do not replace an HTML image's alternative text.
- If inlining multiple copies into the same document, give mask and title IDs unique prefixes. External `<img>` usage isolates their SVG IDs automatically.

The requested `public/icon-192.png` and `public/icon-512.png` are raster exports of the standalone mark at their exact nominal dimensions.

## Review and source

Open `design/logo-concepts.html` for the primary and alternate concepts, app tile previews, small-size checks, palette, and banner. `design/build-brand.py` is the editable source. It uses Python's standard library with macOS CoreGraphics for vector geometry and CoreText to outline supporting banner copy; generated SVG files render independently on other platforms.
