import type { Create, Dna, Spec } from '../tools/apply';
import { STYLE_AVOID } from './_style';

// Digital artifacts: each preset names one signal or representation unit (pixels, scanlines,
// blocks, glyphs, dots) and applies it with a controlled amount. No generic blanket noise.
const AVOID = [...STYLE_AVOID, 'generic blanket noise', 'readable characters or words'];

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const pad = (t: string, min: number, tail: string) =>
  words(t) < min ? `${t.replace(/\.$/, '')}, ${tail}` : t;

function glitch(
  kind: 'signal' | 'representation',
  aesthetic: string,
  unit: string,
  color: string,
  texture: string,
  mood: string,
  key: string,
): Dna {
  return {
    aesthetic,
    subject_treatment:
      kind === 'signal'
        ? `Keep the prompt's image intact and pass it through this signal failure at a controlled strength so the subject stays readable: ${unit}`
        : `Re-render the prompt's image entirely in this representation unit so the subject reads from the pattern of units: ${unit}`,
    color_and_tone: pad(color, 9, 'as produced by the medium, not added as decoration.'),
    lighting_and_shadow:
      'Lighting comes from the source image; the artifact reshapes values and edges without inventing new light.',
    texture_and_material: pad(texture, 9, 'at a consistent unit size across the frame.'),
    camera_and_composition:
      'Keep the prompt framing; concentrate the effect so the main subject remains the clear read at card size.',
    atmosphere_and_mood: pad(mood, 8, 'coming from the medium itself.'),
    rendering_and_quality:
      'Clean, deliberate digital artifact with a consistent unit and no random speckle or smeared noise.',
    key_features: key,
  };
}

const spec: Spec = {
  pack: 'pack_10',
  category: '3. Digital Glitch & Noise',
  updates: {
    'SP10-021': {
      dna: glitch(
        'signal',
        'Datamosh: compressed video motion vectors dragging pixels of one frame into the next.',
        'blocks of the image smear along motion paths while keyframe details bleed through.',
        'Original colors smeared into streaked blocks.',
        'Macroblock smears and motion trails.',
        'Fluid, broken, hypnotic and digital.',
        'motion-vector smear; macroblock drag; bleeding keyframe',
      ),
      avoid: AVOID,
      briefs: [
        'Datamoshed video frame of a knight charging on horseback, his body smearing into the previous frame in dragged macroblocks. No text or logo.',
        'Datamoshed frame of a dragon turning its head, scales smeared across the sky. No text or logo.',
        'Datamoshed frame of a dancer spinning in a ballroom. No text or logo.',
      ],
    },
    'SP10-022': {
      dna: glitch(
        'signal',
        'Pixel sorting: rows or columns of pixels sorted by brightness into long streaks.',
        'bright or dark ranges of pixels are sorted into vertical or horizontal streaks from a threshold.',
        'Original palette stretched into gradient streaks.',
        'Long sorted pixel streaks with sharp thresholds.',
        'Digital, flowing, eerie and precise.',
        'brightness-sorted streaks; threshold edges',
      ),
      avoid: AVOID,
      briefs: [
        'Pixel-sorted image of a castle at sunset, the sky and towers dripping into vertical sorted streaks. No text or logo.',
        'Pixel-sorted portrait of a crowned queen. No text or logo.',
        'Pixel-sorted waterfall with a dragon. No text or logo.',
      ],
    },
    'SP10-023': {
      dna: glitch(
        'signal',
        'VHS tape glitch: tracking errors, chroma bleed, tape noise bands and wobbling horizontal lines.',
        'the image wobbles with tracking lines, color bleed and a few tape-noise bands.',
        'Washed-out colors with red and cyan bleed.',
        'Tracking bands, head-switching noise at the bottom and soft analog blur.',
        'Nostalgic, degraded, eerie and analog.',
        'tracking bands; chroma bleed; head-switching noise',
      ),
      avoid: AVOID,
      briefs: [
        'VHS-glitched frame of a knight walking through a foggy graveyard, tracking bands rolling across. No text or logo.',
        'VHS frame of a witch at a cauldron with color bleed. No text or logo.',
        'VHS frame of a castle banquet. No text or logo.',
      ],
    },
    'SP10-024': {
      dna: glitch(
        'signal',
        'CRT monitor: phosphor scanlines, curved glass, glow and RGB subpixel mask.',
        'the image is shown on a curved CRT with visible scanlines and phosphor glow.',
        'Phosphor-bright colors with bloom.',
        'Scanlines, shadow mask dots and curved-glass vignette.',
        'Retro, glowing, nostalgic and warm.',
        'CRT scanlines; phosphor glow; curved glass',
      ),
      avoid: AVOID,
      briefs: [
        'Image of a dragon shown on a curved CRT with glowing scanlines and phosphor bloom. No text or logo.',
        'CRT image of a knight portrait. No text or logo.',
        'CRT image of a moonlit castle. No text or logo.',
      ],
    },
    'SP10-025': {
      dna: glitch(
        'representation',
        'ASCII art: the image built entirely from monospaced characters used as density values, unreadable as words.',
        'dense and sparse monospaced symbols build shapes and values without forming words.',
        'Green, amber or white on black.',
        'Monospaced glyph grid.',
        'Hacker, retro, cryptic and textual.',
        'glyph density grid; monospaced; no words',
      ),
      avoid: AVOID,
      briefs: [
        'ASCII-style image of a dragon skull made from dense and sparse monospaced symbols in green on black, no readable words. No logo.',
        'ASCII-style image of a knight on horseback in amber. No readable text or logo.',
        'ASCII-style image of a castle in white glyphs. No readable text or logo.',
      ],
    },
    'SP10-026': {
      dna: glitch(
        'signal',
        'JPEG artifacts: heavy 8×8 block compression, ringing around edges and color blocking.',
        'the image is heavily compressed into visible 8×8 blocks with ringing around edges.',
        'Posterized colors with block banding.',
        'Blocky compression and edge ringing.',
        'Degraded, internet-worn, crude and ironic.',
        '8x8 blocks; edge ringing; color banding',
      ),
      avoid: AVOID,
      briefs: [
        'Over-compressed JPEG image of a heroic knight portrait, visible 8x8 blocks and edge ringing. No text or logo.',
        'JPEG-crushed dragon. No text or logo.',
        'JPEG-crushed sunset over a castle. No text or logo.',
      ],
    },
    'SP10-027': {
      dna: glitch(
        'signal',
        'Chromatic aberration: RGB channels offset at edges, producing colored fringes.',
        'red, green and blue channels split slightly at edges, stronger toward the frame corners.',
        'Red and cyan fringes on edges.',
        'Channel-split fringes.',
        'Unstable, cinematic, digital and tense.',
        'RGB channel split; colored fringes',
      ),
      avoid: AVOID,
      briefs: [
        "Image of a knight's helmet with strong red and cyan chromatic aberration fringes. No text or logo.",
        'Image of a dragon eye with RGB split. No text or logo.',
        'Image of a candlelit crypt with channel fringes. No text or logo.',
      ],
    },
    'SP10-028': {
      dna: glitch(
        'representation',
        'Scanography: objects placed on a flatbed scanner — crushed-depth focus, stretched motion and black background.',
        'the subject is scanned face-down on glass: sharp contact areas, falloff into black and stretched parts where it moved.',
        'Hyper-sharp colors against black.',
        'Glass-contact detail, falloff and scan stretch.',
        'Strange, intimate, clinical and surreal.',
        'flatbed contact sharpness; black falloff; scan stretch',
      ),
      avoid: AVOID,
      briefs: [
        "Flatbed scan of a knight's gauntlet and dried roses pressed on glass, falling off into black. No text or logo.",
        'Flatbed scan of a raven skull with scan stretch. No text or logo.',
        'Flatbed scan of a crown and keys. No text or logo.',
      ],
    },
    'SP10-029': {
      dna: glitch(
        'representation',
        'Halftone: the image built from dots of varying size in a regular screen.',
        'values are rebuilt as regular halftone dots at a fixed screen angle.',
        'CMYK or single-ink dots.',
        'Regular dot screen.',
        'Graphic, printed, retro and bold.',
        'regular halftone dot screen; fixed angle',
      ),
      avoid: AVOID,
      briefs: [
        'Halftone image of a dragon rising over a castle, built entirely from red dots of varying size. No text or logo.',
        'Halftone knight portrait in black dots. No text or logo.',
        'CMYK halftone jester. No text or logo.',
      ],
    },
    'SP10-030': {
      dna: glitch(
        'representation',
        '1-bit dithering: pure black and white pixels arranged in ordered or error-diffusion dither patterns.',
        'the image is reduced to 1-bit black and white pixels with dither patterns for grey values.',
        'Pure black and white.',
        'Ordered or diffusion dither pattern.',
        'Retro, crisp, lo-fi and graphic.',
        '1-bit pixels; dither patterns',
      ),
      avoid: AVOID,
      briefs: [
        '1-bit dithered image of a lighthouse in a storm with a sea serpent. No text or logo.',
        '1-bit dither knight portrait. No text or logo.',
        '1-bit dither haunted mansion. No text or logo.',
      ],
    },
  },
  creates: [
    {
      name: 'Bit-Crush Posterize',
      domain: 'bit-depth posterization',
      tags: ['bit-crush', 'posterize', 'glitch'],
      dna: glitch(
        'signal',
        'Bit-crush posterize: color depth reduced to a few flat bands with hard contour steps.',
        'colors collapse into a handful of flat bands with stepped contours.',
        'Few flat saturated bands.',
        'Stepped color bands.',
        'Crude, bold, retro and graphic.',
        'reduced bit depth; flat color bands',
      ),
      avoid: AVOID,
      briefs: [
        'Bit-crushed image of a sunset over a castle collapsed into six flat color bands. No text or logo.',
        'Bit-crushed dragon. No text or logo.',
        'Bit-crushed knight. No text or logo.',
      ],
    },
    {
      name: 'Slit-Scan Stretch',
      domain: 'slit-scan time distortion',
      tags: ['slit-scan', 'time', 'glitch'],
      dna: glitch(
        'signal',
        'Slit-scan: each column captured at a different moment, stretching and warping moving subjects.',
        'moving parts of the subject stretch and bend across columns while static parts stay sharp.',
        'Original palette in stretched streaks.',
        'Stretched warped streaks.',
        'Temporal, uncanny, fluid and strange.',
        'slit-scan stretch; time-warped columns',
      ),
      avoid: AVOID,
      briefs: [
        'Slit-scan image of a galloping horse and rider stretched into a warped ribbon. No text or logo.',
        'Slit-scan dragon in flight. No text or logo.',
        'Slit-scan waltzing couple. No text or logo.',
      ],
    },
    {
      name: 'Interlace Comb Tear',
      domain: 'interlaced video combing',
      tags: ['interlace', 'combing', 'glitch'],
      dna: glitch(
        'signal',
        'Interlace combing: alternate horizontal lines from two fields offset on moving edges.',
        'moving edges show comb-like alternating line offsets.',
        'Original colors.',
        'Comb teeth along motion edges.',
        'Broadcast, twitchy, retro and technical.',
        'interlace comb teeth; motion edges',
      ),
      avoid: AVOID,
      briefs: [
        'Interlaced video frame of a sword fight with comb-tooth artifacts on the moving blades. No text or logo.',
        'Interlaced frame of a dragon wing. No text or logo.',
        'Interlaced frame of a galloping horse. No text or logo.',
      ],
    },
    {
      name: 'Teletext Mosaic',
      domain: 'teletext block graphics',
      tags: ['teletext', 'mosaic', 'glitch'],
      dna: glitch(
        'representation',
        'Teletext mosaic: coarse 2×3 block graphics in eight bright colors on black.',
        'the image is rebuilt from coarse teletext block cells in eight colors.',
        'Eight saturated teletext colors on black.',
        'Chunky 2x3 block cells.',
        'Retro, broadcast, charming and crude.',
        'teletext block cells; eight colors',
      ),
      avoid: AVOID,
      briefs: [
        'Teletext mosaic image of a knight on horseback in chunky block cells. No readable text or logo.',
        'Teletext dragon. No readable text or logo.',
        'Teletext castle. No readable text or logo.',
      ],
    },
    {
      name: 'Oscilloscope Vector Trace',
      domain: 'oscilloscope vector drawing',
      tags: ['oscilloscope', 'vector', 'glitch'],
      dna: glitch(
        'representation',
        'Oscilloscope vector art: the image drawn as glowing green phosphor lines on a dark scope screen.',
        'the subject is traced as continuous glowing vector lines with phosphor persistence.',
        'Phosphor green on black.',
        'Glowing vector lines and grid.',
        'Technical, eerie, retro and precise.',
        'phosphor vector lines; scope grid',
      ),
      avoid: AVOID,
      briefs: [
        'Oscilloscope vector drawing of a dragon traced in glowing green lines on a scope grid. No text or logo.',
        'Oscilloscope knight. No text or logo.',
        'Oscilloscope castle. No text or logo.',
      ],
    },
    {
      name: 'E-Ink Ghosting',
      domain: 'e-ink display ghosting',
      tags: ['e-ink', 'ghosting', 'glitch'],
      dna: glitch(
        'signal',
        'E-ink ghosting: grey e-paper display with faint remnants of previous images.',
        'the image appears on grey e-paper with faint ghost remnants of a previous image.',
        'Soft greys on paper-like white.',
        'Grainy e-paper with ghost layers.',
        'Quiet, haunted, low-power and subtle.',
        'e-paper greys; ghost remnants',
      ),
      avoid: AVOID,
      briefs: [
        'E-ink display showing a knight portrait with a faint ghost of a dragon from the previous refresh. No text or logo.',
        'E-ink castle. No text or logo.',
        'E-ink crow. No text or logo.',
      ],
    },
    {
      name: 'Macroblock Freeze',
      domain: 'frozen macroblock corruption',
      tags: ['macroblock', 'freeze', 'glitch'],
      dna: glitch(
        'signal',
        'Macroblock freeze: stream corruption where some blocks freeze wrong colors or stale content.',
        'patches of the image are replaced by frozen stale blocks and green-grey corruption.',
        'Original palette with green and grey corrupted blocks.',
        'Rectangular corruption blocks.',
        'Broken, digital, jarring and tense.',
        'frozen macroblocks; corruption patches',
      ),
      avoid: AVOID,
      briefs: [
        'Corrupted video frame of a royal court where rectangular blocks froze in green and grey. No text or logo.',
        'Frozen macroblock dragon. No text or logo.',
        'Frozen macroblock knight. No text or logo.',
      ],
    },
    {
      name: 'Texture Repeat Bug',
      domain: 'repeating texture bug',
      tags: ['texture-bug', 'repeat', 'glitch'],
      dna: glitch(
        'signal',
        'Texture repeat bug: surfaces showing obvious tiled repetition and stretched UVs like a broken game render.',
        'surfaces repeat in obvious tiles or stretch into streaks like broken UV mapping.',
        'Original textures in tiled repeats.',
        'Tiled repeats and stretched streaks.',
        'Uncanny, broken, gamey and absurd.',
        'visible texture tiling; stretched UVs',
      ),
      avoid: AVOID,
      briefs: [
        'Broken game render of a castle whose stone walls repeat in obvious tiles and stretch into streaks at the edges. No text or logo.',
        'Texture-bug knight. No text or logo.',
        'Texture-bug dragon. No text or logo.',
      ],
    },
    {
      name: 'LED Matrix Display',
      domain: 'LED dot matrix display',
      tags: ['led-matrix', 'dot-display', 'glitch'],
      dna: glitch(
        'representation',
        'LED matrix: the image rebuilt as glowing round LEDs on a dark panel grid.',
        'the subject is shown as lit round LEDs in a coarse grid.',
        'Glowing LED colors on black.',
        'Round LED dots with glow.',
        'Electronic, bold, nightlife and retro.',
        'round LED dots; coarse grid glow',
      ),
      avoid: AVOID,
      briefs: [
        'LED matrix display showing a dragon in glowing red and orange LEDs. No text or logo.',
        'LED matrix knight. No text or logo.',
        'LED matrix moon and castle. No text or logo.',
      ],
    },
    {
      name: 'Thermal Printer Output',
      domain: 'thermal receipt print',
      tags: ['thermal-print', 'receipt', 'glitch'],
      dna: glitch(
        'representation',
        'Thermal printer: the image printed on curling receipt paper in faded dithered black.',
        'the image is printed as coarse dithered black on thermal receipt paper with fading and streaks.',
        'Faded black on off-white.',
        'Dither, streaks and curled paper.',
        'Humble, ephemeral, odd and lo-fi.',
        'thermal receipt print; dither; fading',
      ),
      avoid: AVOID,
      briefs: [
        'Thermal receipt printout of a knight portrait in faded dithered black, paper curling. No readable text or logo.',
        'Thermal print dragon. No readable text or logo.',
        'Thermal print castle. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
