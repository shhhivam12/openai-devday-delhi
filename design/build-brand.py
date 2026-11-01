#!/usr/bin/env python3
"""Build Together's original SVG identity. macOS CoreText outlines banner copy.

No runtime fonts, raster images, or network dependencies are used by the SVGs.
Run from any directory with: python3 /absolute/path/to/design/build-brand.py
"""
from pathlib import Path
import ctypes as C
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand"
OUT.mkdir(parents=True, exist_ok=True)
CORAL, INK, IVORY, SAGE = "#ef5b35", "#202923", "#f6f5ef", "#aab8a1"

# Two people, with the foreground arm carving a transparent gap in the rear arm.
# The forms are original, drawn on a 128-unit grid.
REAR = "M70 72 50 58C42 53 34 55 28 63 17 76 22 96 35 107 48 118 66 119 82 110"
FRONT = "M57 81 80 65C88 59 97 63 102 73 110 88 102 105 87 111 74 117 61 110 46 101"

def rear_outline():
    """Bake the arm gap into vector geometry; no rasterized SVG mask is needed."""
    cg = C.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
    class P(C.Structure):
        _fields_ = [("x", C.c_double), ("y", C.c_double)]
    class E(C.Structure):
        _fields_ = [("type", C.c_int), ("points", C.POINTER(P))]
    cb_type = C.CFUNCTYPE(None, C.c_void_p, C.POINTER(E))
    cg.CGPathCreateMutable.restype = C.c_void_p
    cg.CGPathMoveToPoint.argtypes = [C.c_void_p, C.c_void_p, C.c_double, C.c_double]
    cg.CGPathAddLineToPoint.argtypes = cg.CGPathMoveToPoint.argtypes
    cg.CGPathAddCurveToPoint.argtypes = [C.c_void_p, C.c_void_p] + [C.c_double] * 6
    cg.CGPathCreateCopyByStrokingPath.argtypes = [C.c_void_p, C.c_void_p, C.c_double, C.c_int, C.c_int, C.c_double]
    cg.CGPathCreateCopyByStrokingPath.restype = C.c_void_p
    cg.CGPathCreateCopyBySubtractingPath.argtypes = [C.c_void_p, C.c_void_p, C.c_bool]
    cg.CGPathCreateCopyBySubtractingPath.restype = C.c_void_p
    cg.CGPathApply.argtypes = [C.c_void_p, C.c_void_p, cb_type]
    cg.CGPathRelease.argtypes = [C.c_void_p]
    def make(start, line, curves):
        p = cg.CGPathCreateMutable()
        cg.CGPathMoveToPoint(p, None, *start)
        cg.CGPathAddLineToPoint(p, None, *line)
        for curve in curves:
            cg.CGPathAddCurveToPoint(p, None, *curve)
        return p
    rear = make((70,72), (50,58), [(42,53,34,55,28,63),(17,76,22,96,35,107),(48,118,66,119,82,110)])
    front = make((57,81), (80,65), [(88,59,97,63,102,73),(110,88,102,105,87,111),(74,117,61,110,46,101)])
    thick_rear = cg.CGPathCreateCopyByStrokingPath(rear, None, 16, 1, 1, 10)
    gap = cg.CGPathCreateCopyByStrokingPath(front, None, 25, 1, 1, 10)
    result = cg.CGPathCreateCopyBySubtractingPath(thick_rear, gap, False)
    commands = []
    @cb_type
    def receive(_, ptr):
        el = ptr.contents
        op, count = [("M",1),("L",1),("Q",2),("C",3),("Z",0)][el.type]
        commands.append(op + " ".join(f"{el.points[j].x:.4f} {el.points[j].y:.4f}" for j in range(count)))
    cg.CGPathApply(result, None, receive)
    for path in [rear, front, thick_rear, gap, result]:
        cg.CGPathRelease(path)
    return "".join(commands)

REAR_OUTLINE = rear_outline()

def embrace(color=CORAL, prefix="embrace"):
    return f'''<g fill="{color}">
    <circle cx="44" cy="30" r="12"/>
    <circle cx="85" cy="36" r="12"/>
    <path d="{REAR_OUTLINE}"/>
  </g>
  <g fill="none" stroke="{color}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
    <path d="{FRONT}"/>
  </g>'''

# Custom geometric lettering. These are hand-authored paths, not live type.
# Each lowercase bowl and terminal uses the same optical stroke weight.
LETTERS = [
    (0, "M0 3H48M24 3V78"),
    (62, "M48 52C48 35 39 25 24 25S0 35 0 52 9 79 24 79 48 69 48 52Z"),
    (126, "M48 28V81C48 101 30 111 9 100M48 52C48 35 39 25 24 25S0 35 0 52 9 79 24 79 48 69 48 52Z"),
    (192, "M1 51H47C47 35 38 25 24 25 9 25 0 36 0 52 0 70 10 79 25 79 34 79 41 76 47 71"),
    (257, "M14 8V60C14 77 22 83 36 77M0 28H34"),
    (308, "M0 0V78M0 49C0 34 9 25 23 25 37 25 45 33 45 48V78"),
    (372, "M1 51H47C47 35 38 25 24 25 9 25 0 36 0 52 0 70 10 79 25 79 34 79 41 76 47 71"),
    (437, "M0 28V78M0 49C0 33 12 23 29 26"),
]

def lettering(color=INK):
    paths = "\n".join(f'<path transform="translate({x} 0)" d="{d}"/>' for x, d in LETTERS)
    return f'<g fill="none" stroke="{color}" stroke-width="11.5" stroke-linecap="round" stroke-linejoin="round">{paths}</g>'

def svg(name, width, height, title, desc, body):
    content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="{name}-title {name}-desc">
  <title id="{name}-title">{escape(title)}</title>
  <desc id="{name}-desc">{escape(desc)}</desc>
  {body}
</svg>
'''
    (OUT / f"{name}.svg").write_text(content)

svg("mark", 128, 128, "Together", "Two people leaning into a shared embrace. Coral symbol on a transparent background.", embrace())
svg("wordmark", 720, 160, "Together", "The Together embrace symbol and custom rounded Together lettering, in coral and near-black.", f'<g transform="translate(4 4) scale(1.08)">{embrace(prefix="wordmark")}</g><g transform="translate(186 33) scale(1.08)">{lettering()}</g>')

# An alternative raised fist: four rounded knuckles, a folded thumb, and a cuff.
FIST = '''<defs><mask id="fist-gap" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128" style="mask-type:luminance">
    <path fill="#fff" d="M0 0h128v128H0z"/>
    <g fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 40V51M60 34V51M80 39V54"/>
      <path d="M27 64C28 55 34 52 42 55L64 63C70 65 72 70 69 74 67 79 61 80 56 77L43 71"/>
      <path d="M43 97H91"/>
    </g>
  </mask></defs>
  <path mask="url(#fist-gap)" d="M40 116V94L26 79C22 75 20 69 20 63V43C20 37 24 33 30 33S40 37 40 43V32C40 26 44 22 50 22S60 26 60 32V29C60 23 64 19 70 19S80 23 80 29V39C80 33 84 29 90 29S100 33 100 39V57C110 60 113 70 109 80 106 88 101 92 96 96L93 116Z"/>'''
svg("fist-concept", 640, 176, "Together — raised fist concept", "Alternative identity exploration: a coral raised fist for collective strength beside custom Together lettering. Primary identity uses the embrace.", f'<g transform="translate(0 22)" fill="{CORAL}">{FIST}</g><g transform="translate(154 36)">{lettering()}</g>')
svg("logo-square", 512, 512, "Together app icon", "An ivory embrace on a coral square. The symbol fits within the central maskable icon safe area.", f'<path fill="{CORAL}" d="M0 0h512v512H0z"/><g transform="translate(64 48) scale(3)">{embrace(IVORY, "app")}</g>')

# Outline the supplementary banner copy using CoreText. Only the exported paths
# are shipped in the assets, so font availability cannot change their layout.
CF = C.CDLL("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation")
CT = C.CDLL("/System/Library/Frameworks/CoreText.framework/CoreText")
CG = C.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
class Point(C.Structure):
    _fields_ = [("x", C.c_double), ("y", C.c_double)]
class Size(C.Structure):
    _fields_ = [("width", C.c_double), ("height", C.c_double)]
class Element(C.Structure):
    _fields_ = [("type", C.c_int), ("points", C.POINTER(Point))]
CF.CFStringCreateWithCString.argtypes = [C.c_void_p, C.c_char_p, C.c_uint32]
CF.CFStringCreateWithCString.restype = C.c_void_p
CF.CFRelease.argtypes = [C.c_void_p]
CT.CTFontCreateWithName.argtypes = [C.c_void_p, C.c_double, C.c_void_p]
CT.CTFontCreateWithName.restype = C.c_void_p
CT.CTFontGetGlyphsForCharacters.argtypes = [C.c_void_p, C.POINTER(C.c_uint16), C.POINTER(C.c_uint16), C.c_long]
CT.CTFontGetGlyphsForCharacters.restype = C.c_bool
CT.CTFontGetAdvancesForGlyphs.argtypes = [C.c_void_p, C.c_uint32, C.POINTER(C.c_uint16), C.POINTER(Size), C.c_long]
CT.CTFontGetAdvancesForGlyphs.restype = C.c_double
CT.CTFontCreatePathForGlyph.argtypes = [C.c_void_p, C.c_uint16, C.c_void_p]
CT.CTFontCreatePathForGlyph.restype = C.c_void_p
CALLBACK = C.CFUNCTYPE(None, C.c_void_p, C.POINTER(Element))
CG.CGPathApply.argtypes = [C.c_void_p, C.c_void_p, CALLBACK]
CG.CGPathRelease.argtypes = [C.c_void_p]

def outlined_text(text, x, y, size, font="AvenirNext-Medium", color=INK, tracking=0):
    name = CF.CFStringCreateWithCString(None, font.encode(), 0x08000100)
    face = CT.CTFontCreateWithName(name, size, None)
    CF.CFRelease(name)
    chars = (C.c_uint16 * len(text))(*map(ord, text))
    glyphs = (C.c_uint16 * len(text))()
    assert CT.CTFontGetGlyphsForCharacters(face, chars, glyphs, len(text))
    advances = (Size * len(text))()
    CT.CTFontGetAdvancesForGlyphs(face, 0, glyphs, advances, len(text))
    pieces, cursor = [], 0.0
    def n(v):
        return f"{v:.3f}".rstrip("0").rstrip(".") if v else "0"
    for i, glyph in enumerate(glyphs):
        path = CT.CTFontCreatePathForGlyph(face, glyph, None)
        if path:
            commands = []
            @CALLBACK
            def receive(_, element_ptr):
                el = element_ptr.contents
                kind, points = el.type, el.points
                op, count = [("M", 1), ("L", 1), ("Q", 2), ("C", 3), ("Z", 0)][kind]
                commands.append(op + " ".join(n(points[j].x + cursor) + " " + n(-points[j].y) for j in range(count)))
            CG.CGPathApply(path, None, receive)
            pieces.append("".join(commands))
            CG.CGPathRelease(path)
        cursor += advances[i].width + tracking
    CF.CFRelease(face)
    return f'<path transform="translate({x} {y})" fill="{color}" d="{"".join(pieces)}"/>'

banner = f'''<path fill="{IVORY}" d="M0 0h1600v900H0z"/>
  <circle cx="108" cy="109" r="10" fill="{CORAL}"/>
  {outlined_text("WHEN IT MATTERS MOST", 139, 116, 18, "AvenirNext-DemiBold", tracking=2.6)}
  <g transform="translate(104 282) scale(1.67)">{lettering()}</g>
  {outlined_text("Find help.", 96, 540, 64)}
  {outlined_text("Offer hope.", 96, 618, 64)}
  <path d="M1074 598V408C1074 297 1164 207 1275 207S1476 297 1476 408V598Z" fill="#e3e8dd"/>
  <g transform="translate(1064 265) scale(3.3)">{embrace(prefix="banner")}</g>
  <path d="M96 778H1504" stroke="{SAGE}" stroke-width="1.5"/>
  {outlined_text("A community that shows up.", 96, 832, 24)}
  {outlined_text("TOGETHER", 1340, 830, 16, "AvenirNext-DemiBold", tracking=2.2)}'''
svg("banner", 1600, 900, "Together — Find help. Offer hope.", "Together. When it matters most. Find help. Offer hope. A community that shows up. An original coral embrace sits against a pale sage arch on warm ivory.", banner)
print("Built mark.svg, wordmark.svg, fist-concept.svg, logo-square.svg, and banner.svg")
