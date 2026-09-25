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
      'Keep the prompt framing; concentrate the effect so the main subject remains the clear read at a glance.',
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
        'Datamoshed video frame of a skateboarder mid-kickflip in an empty pool, the concrete bowl smeared into her silhouette by dragged motion vectors, blocks of the previous frame bleeding across the sky. No text or logo.',
        'Datamoshed video frame of a couple spinning in a ballroom, chandeliers and gowns melting into each other as pixels drag between frames, colored macroblocks trailing the turn. No text or logo.',
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
        'Pixel-sorted portrait of an old fisherman in a yellow raincoat, bright columns of pixels streaming downward from his hood into long sorted streaks while his eyes stay intact. No text or logo.',
        'Pixel-sorted image of a tall waterfall in a jungle, the falling water extended into long vertical streaks sorted from white to deep green, rocks untouched at the edges. No text or logo.',
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
        'VHS-glitched frame of a lone figure walking through a foggy graveyard at night, tracking bands rolling up the screen, chroma bleed around the lantern and wobbling horizontal lines. No text or logo.',
        'VHS tape frame of a home birthday party in a wood-paneled living room, color bleeding from the candles, noise bands and a tracking wobble across the smiling faces. No text or logo.',
        'VHS tape frame of a late-night cooking show, a chef flipping a pan of flames, chroma bleed, a rolling noise bar and soft tape blur. No text or logo.',
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
        'Image of a deep-sea anglerfish glowing on a curved CRT monitor in a dark room, phosphor scanlines, bloom around its lure and a visible RGB subpixel mask up close. No text or logo.',
        "CRT monitor image of an astronaut's portrait, curved glass reflecting the room, glowing scanlines and phosphor bloom on the helmet visor. No text or logo.",
        'CRT monitor image of a moonlit harbor with fishing boats, scanlines across the water, soft phosphor glow and the curved screen edge darkening. No text or logo.',
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
        'ASCII art image of a galloping horse built entirely from amber monospaced characters on black, dense glyphs for the shadows and sparse dots for highlights, unreadable as words. No readable text or logo.',
        'ASCII art image of a lighthouse on a cliff in white monospaced glyphs on dark green, the beam made of fading symbols, no readable words. No readable text or logo.',
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
        'Over-compressed JPEG image of a stage singer under colored lights, visible 8x8 blocks in the shadows, ringing halos around the microphone and color blocking in the spotlight. No text or logo.',
        'Over-compressed JPEG image of a parrot on a branch, its feathers collapsing into 8x8 color blocks, edge ringing around the beak and banding in the sky. No text or logo.',
        'Over-compressed JPEG image of a sunset over a fishing pier, gradient crushed into blocks, ringing around the posts and mosquito noise on the water. No text or logo.',
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
        'Image of a glass perfume bottle on a mirror with strong red and cyan chromatic aberration fringes along every edge, the offset channels splitting its highlights. No text or logo.',
        "Image of a cat's eye in extreme close-up with RGB channels split at the iris edge, red and blue fringes around the pupil and lashes. No text or logo.",
        'Image of a candlelit crypt corridor with channel fringes along the arches, the flames split into red, green and blue ghosts at the edges of the frame. No text or logo.',
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
        'Flatbed scan of a vintage pocket watch, dried roses and a ribbon pressed on the glass, crushed-depth focus and everything falling off into black beyond the glass. No text or logo.',
        'Flatbed scan of a bird skull and feathers on the glass, the skull dragged during the scan into a stretched streak, deep black background. No text or logo.',
        'Flatbed scan of a tangle of old keys and a hand pressed flat on the glass, fingers blurred where they moved, black void around them. No text or logo.',
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
        'Halftone image of a rocket launching from a coastal pad, built entirely from red dots of varying size on cream paper, the exhaust plume dense and the sky sparse. No text or logo.',
        'Halftone portrait of a boxer after a fight in black dots of varying size, a coarse regular screen visible across his bruised cheek. No text or logo.',
        'CMYK halftone image of a court jester juggling, cyan, magenta, yellow and black dot screens overlapping at angles, slight misregistration. No text or logo.',
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
        '1-bit dithered image of a lighthouse in a storm with a sea serpent rising, pure black and white pixels in error-diffusion patterns forming the waves and clouds. No text or logo.',
        '1-bit dithered portrait of an old woman in a headscarf, ordered dither patterns building every tone of her wrinkles in pure black and white pixels. No text or logo.',
        '1-bit dithered image of a haunted mansion on a hill, error-diffusion dither in the night sky and ordered patterns on the walls. No text or logo.',
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
        'Bit-crushed image of a sunset over a mountain lake collapsed into six flat color bands, hard contour steps where orange turns to violet and the reflection banded. No text or logo.',
        'Bit-crushed image of a peacock displaying its tail, the feathers posterized into a few flat teal and gold bands with stepped edges. No text or logo.',
        'Bit-crushed image of a crowd at a summer festival, faces and flags reduced to a few flat color bands with hard contour steps. No text or logo.',
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
        'Slit-scan image of a galloping horse and rider stretched into a warped ribbon, each column caught at a different moment, the legs bent into curves. No text or logo.',
        'Slit-scan image of a passing train warped into a long sweeping curve, windows stretched and the platform lamps smeared into lines. No text or logo.',
        'Slit-scan image of a waltzing couple, their spinning bodies stretched and twisted across the frame, the ballroom floor stable behind. No text or logo.',
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
        'Interlaced video frame of a sword fight on a stage, comb-tooth artifacts on the moving blades and arms, the still background clean. No text or logo.',
        'Interlaced video frame of a basketball player dunking, comb-tooth tearing on the arms and ball, the crowd behind static and clean. No text or logo.',
        'Interlaced video frame of a galloping horse at a racetrack, alternate lines offset along its legs and mane. No text or logo.',
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
        'Teletext mosaic image of a mounted rider in chunky 2x3 block cells, eight bright colors on black, the horse a red block silhouette. No readable text or logo.',
        'Teletext mosaic image of a rocket and planet in chunky block cells, cyan, yellow and magenta on black. No readable text or logo.',
        'Teletext mosaic image of a sailboat on waves in coarse block graphics, blue and white cells on black, a yellow block sun. No readable text or logo.',
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
        'Oscilloscope vector drawing of a sea turtle traced in glowing green phosphor lines on a dark scope grid, the lines slightly blooming. No text or logo.',
        'Oscilloscope vector drawing of a spinning globe traced in green lines, meridians overlapping with phosphor persistence trails. No text or logo.',
        'Oscilloscope vector drawing of a hissing cat arching its back, its whiskers and tail flickering with persistence trails on a round green-tinted screen, a fuzzy beam dot where the trace restarts. No text or logo.',
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
        'E-ink display showing a portrait of an old sailor, with a faint ghost of a coastline landscape from the previous refresh lingering in grey. No text or logo.',
        'E-ink display showing a snowy mountain village in grey tones, faint ghosting of a previous image of a sailing ship visible in the sky. No text or logo.',
        'E-ink display showing a crow on a branch, its previous pose ghosting faintly beside it in pale grey. No text or logo.',
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
        'Corrupted video frame of a royal court where rectangular blocks froze in wrong green and grey colors, some blocks stuck on stale content from an earlier shot. No text or logo.',
        'Corrupted video frame of a football match where macroblocks froze mid-play, a player split across stale grey blocks and green smears. No text or logo.',
        'Corrupted video frame of a mountain car chase where the road froze in blocky magenta and green while the car moved on. No text or logo.',
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
        'Broken game render of a medieval town square whose stone walls repeat in obvious tiles and stretch into streaks at the edges, a fountain with smeared textures. No text or logo.',
        'Broken game render of a forest where one bark texture tiles across every tree, stretched UVs along the roots and a repeating leaf pattern in the sky. No text or logo.',
        'Broken game render of a car with a stretched checkerboard missing-texture pattern on its hood and repeated tire textures on the road. No text or logo.',
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
        'LED matrix display showing a koi fish in glowing red and orange round LEDs on a dark panel grid, soft glow between the lights. No text or logo.',
        'LED matrix display showing a running cheetah in glowing yellow LEDs, each dot visible on the dark panel grid. No text or logo.',
        'LED matrix display showing a crescent moon over pine trees in blue and white LEDs, dark gaps between each dot. No text or logo.',
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
        'Thermal receipt printout of a cat portrait in faded dithered black, the paper curling at the edges and slightly yellowed. No readable text or logo.',
        'Thermal receipt printout of a bicycle in faded dithered black, the long paper curling off a cafe counter. No readable text or logo.',
        'Thermal receipt printout of a mountain landscape in faded dither, a fold crease and thermal fading at one edge. No readable text or logo.',
      ],
    },
  ] satisfies Create[],
};

export default spec;
