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
        "A knight charging on horseback smears into the previous frame in dragged macroblocks, his lance arriving before he does. No readable text or logo.",
        "A skateboarder mid-kickflip in an empty pool drags the concrete bowl into her own silhouette along broken motion vectors. No readable text or logo.",
        "A couple spinning in a ballroom melt into the chandeliers as frames bleed together, gowns and crystal becoming one moving smear. No readable text or logo.",
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
        "A hilltop fortress at sunset drips into long vertical streaks as its sky and towers are sorted from light to dark. No readable text or logo.",
        "An old fisherman in a yellow raincoat pours downward from his hood in bright sorted columns. No readable text or logo.",
        "A jungle waterfall stretches into long streaks sorted from white to deep green while the rocks around it stay sharp. No readable text or logo.",
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
        "A lone figure walks through a foggy graveyard at night as tracking bands roll up the frame and chroma bleeds around her lantern. No readable text or logo.",
        "A home birthday party in a wood-paneled living room wobbles on worn tape, color bleeding from the candles as a noise band crosses grandma. No readable text or logo.",
        "A late-night cooking show chef flips a pan of flames while a rolling noise bar slices him in half. No readable text or logo.",
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
        "A deep-sea anglerfish glows on a curved monitor in a dark room, phosphor bloom around its lure and the subpixel mask visible. No readable text or logo.",
        "An astronaut's portrait glows through curved glass that reflects the dark room, scanlines crossing her helmet visor. No readable text or logo.",
        "A moonlit harbor with fishing boats flickers in phosphor scanlines, the curved screen darkening at its edges. No readable text or logo.",
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
        "A beast's skull emerges from dense and sparse monospaced symbols in green on black, no readable words anywhere. No readable text or logo.",
        "A galloping horse is built from amber monospaced glyphs on black, dense characters for shadow and sparse dots for highlights. No readable text or logo.",
        "A lighthouse on a cliff glows in white glyphs on dark green, its beam a fan of fading symbols. No readable text or logo.",
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
        "A stage singer under colored lights collapses into visible 8x8 blocks, ringing halos wrapping her microphone. No readable text or logo.",
        "A parrot's feathers crumble into blocky color squares, edge ringing around its beak and banding in the sky. No readable text or logo.",
        "A sunset over a fishing pier is crushed into blocks, mosquito noise buzzing across the water. No readable text or logo.",
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
        "A glass perfume bottle on a mirror splits into red and cyan fringes along every edge, its reflection doubling the error. No readable text or logo.",
        "A cat's eye in extreme close-up tears into red and blue fringes around the pupil and every lash. No readable text or logo.",
        "In a candlelit crypt corridor every flame splits into red, green and blue ghosts toward the edges of the frame. No readable text or logo.",
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
        "A vintage pocket watch, dried roses and a ribbon are pressed onto a scanner bed, everything falling off into black beyond the glass. No readable text or logo.",
        "A bird skull and feathers lie on the glass, the skull dragged during the pass into a long stretched streak. No readable text or logo.",
        "A tangle of old keys and a hand press flat on the glass, the fingers blurred where they moved against black void. No readable text or logo.",
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
        "A rocket launching from a coastal pad is built entirely from red dots on cream paper, its plume dense and its sky sparse. No readable text or logo.",
        "A boxer after a fight appears in black dots of varying size, the coarse screen crossing his bruised cheek. No readable text or logo.",
        "A court jester juggles in overlapping cyan, magenta, yellow and black dot screens slightly out of register. No readable text or logo.",
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
        "A sea serpent rises beside a lighthouse in a storm, pure black and white pixels scattering to form the waves. No readable text or logo.",
        "An old woman in a headscarf is built from ordered black and white pixel patterns, every wrinkle a different dither. No readable text or logo.",
        "A haunted mansion on a hill hums with scattered pixels in the night sky and ordered patterns on its walls. No readable text or logo.",
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
        "A sunset over a mountain lake collapses into six flat color bands, hard steps where orange turns to violet. No readable text or logo.",
        "A peacock displays its tail in a few flat teal and gold bands with stepped edges. No readable text or logo.",
        "A summer festival crowd reduces to a few flat color bands, faces and flags stepping hard at every contour. No readable text or logo.",
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
        "A galloping horse and rider stretch into a warped ribbon, each column caught at a different moment, legs bent into curves. No readable text or logo.",
        "A passing train warps into a long sweeping curve, its windows stretched and the platform lamps smeared into lines. No readable text or logo.",
        "A waltzing couple twist across the frame as they spin while the ballroom floor behind them stays perfectly still. No readable text or logo.",
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
        "A stage sword fight shows comb-tooth tearing on every moving blade and arm while the scenery stays clean. No readable text or logo.",
        "A basketball player mid-dunk splits into alternating offset lines on his arms and the ball, the crowd static behind. No readable text or logo.",
        "A racehorse at full gallop down the home stretch tears into alternate offset lines along its legs and flying mane while the rail stays crisp. No readable text or logo.",
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
        "A mounted rider is built from chunky block cells in eight bright colors on black, the horse a red silhouette. No readable text or logo.",
        "A rocket and a ringed planet form from chunky cyan, yellow and magenta cells on black. No readable text or logo.",
        "A sailboat rides blue and white block waves on black under a single yellow block sun. No readable text or logo.",
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
        "A sea turtle is traced in glowing green lines on a dark scope grid, its flippers slightly blooming. No readable text or logo.",
        "A spinning globe on a round scope screen is drawn in overlapping green meridians, each rotation leaving long glowing persistence trails behind it. No readable text or logo.",
        "A hissing cat arches its back in flickering green lines, whiskers and tail trailing persistence ghosts on a round screen. No readable text or logo.",
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
        "A grey paper-like screen shows an old sailor's portrait while the coastline from the previous refresh still lingers faintly behind him. No readable text or logo.",
        "A snowy mountain village in grey tones hides the faint ghost of a sailing ship in its sky. No readable text or logo.",
        "A crow on a branch shares the screen with the pale ghost of its previous pose beside it. No readable text or logo.",
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
        "A royal court scene breaks as rectangular blocks freeze in wrong green and grey, some stuck on a queen who already left. No readable text or logo.",
        "A football match freezes in blocks mid-play, one player split across stale grey squares and green smears. No readable text or logo.",
        "A mountain car chase leaves the road frozen in blocky magenta and green while the car keeps driving on. No readable text or logo.",
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
        "A medieval town square repeats the same stone texture in obvious tiles, stretching into streaks at the edges around a smeared fountain. No readable text or logo.",
        "A forest uses one bark texture on every tree, roots stretched into streaks and a repeating leaf pattern overhead. No readable text or logo.",
        "A car sits on a road of repeated tire prints, its hood covered in a stretched magenta-and-black missing-texture checkerboard. No readable text or logo.",
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
        "A koi fish swims across a dark panel in glowing red and orange round lights, soft glow between each dot. No readable text or logo.",
        "A running cheetah blazes across a stadium panel in yellow dots, each round light visible on the dark grid as it sprints. No readable text or logo.",
        "A crescent moon rises over pine trees in blue and white dots, dark gaps between every light. No readable text or logo.",
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
        "A cat portrait emerges on curling receipt paper in faded dithered black, slightly yellowed at the edges. No readable text or logo.",
        "A bicycle prints out on a long strip of receipt paper curling off a cafe counter in faded black. No readable text or logo.",
        "A mountain landscape fades across a creased receipt, the heat-printed black already vanishing at one edge. No readable text or logo.",
      ],
    },
  ] satisfies Create[],
};

export default spec;
