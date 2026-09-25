import type { Spec } from '../tools/apply';
import { design } from './_design';

// App & illustrative icons (part B): R-APP-11..16 styles, R-APP-17/18 finish modifiers, R-APP-19 mask profile,
// R-APP-20 family-reduction recipe as a sheet profile.
const A = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'modifier' | 'profile' = 'style',
) => design(name, domain, tag, 'app-icon', fields, avoid, briefs, { text: false, source, kind });

const spec: Spec = {
  pack: 'pack_25',
  category: '3. App & Illustrative Icons',
  updates: {},
  creates: [
    A(
      'R-APP-11',
      'Tensioned Membrane Tokens',
      'stretched membrane app icon',
      'tensioned-membrane',
      {
        aesthetic:
          'Tensioned Membrane Tokens: one smooth surface stretched between three or four fixed points forms an expressive, clearly built icon.',
        subject_treatment:
          "Stretch the prompt's subject as one membrane between three or four persistent points, letting its hollows and curves explain the metaphor.",
        color_and_tone:
          'One main color in broad value bands, with the support points in a secondary contrast.',
        lighting_and_shadow:
          'Diffuse light revealing curvature and tension with soft, even highlights.',
        texture_and_material:
          'Smooth membrane of uniform apparent thickness, taut and wrinkle-free.',
        camera_and_composition: 'Asymmetric support points balanced around one dominant void.',
        atmosphere_and_mood: 'Stable tension and resilient lightness, held rather than inflated.',
        rendering_and_quality:
          'The tension points stay identifiable even when the view shifts slightly.',
        key_features: 'stretched membrane; three or four anchors; dominant void; taut curves',
      },
      ['random fabric', 'floating supports', 'material that erases the function'],
      [
        'A dark membrane stretched between four spikes like the wing of a sleeping bat, the icon of an app for night-shift workers, deep plum, taut and elegant. No readable text or logo.',
        'The icon of a hammock-review app for extremely lazy travelers: one coral membrane stretched between two points, sagging under an invisible, very comfortable weight. No readable text or logo.',
        'A pale triangular membrane curves between three points to form a small sail with no boat, the icon of a quiet navigation app, slate green, soft light. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-12',
      'Contour-Locked Miniatures',
      'focused-detail miniature app icon',
      'contour-locked',
      {
        aesthetic:
          'Contour-Locked Miniatures: a simple calm outer mass with all functional detail gathered in one limited focal area.',
        subject_treatment:
          "Keep the prompt's subject with a simple outer contour and concentrate its functional detail in one limited region, about a third of the icon.",
        color_and_tone: 'High-contrast silhouette with the detail in a subordinate tonal range.',
        lighting_and_shadow:
          'One soft light for the outer volume and a focused light only on the detail.',
        texture_and_material:
          'Sober surfaces with minimal grain and fine detail only in the focus zone.',
        camera_and_composition: 'Compact object with its detail gathered in one region.',
        atmosphere_and_mood: 'Overall calm with local discovery where the eye lands.',
        rendering_and_quality:
          'The miniature reads at small size even when the focal detail disappears.',
        key_features: 'simple outer mass; one detail zone; calm silhouette; local discovery',
      },
      [
        'detail spread everywhere',
        'generic object with one ornament',
        'silhouette broken by accessories',
      ],
      [
        'A plain black treasure chest whose only detail is a tiny glowing lock with a skull keyhole, the icon of an app for storing secrets, charcoal and gold. No readable text or logo.',
        'A simple smooth teapot with all detail packed into its spout, which is clearly a tiny elephant trunk, the icon of a tea-timer app, cream and sage. No readable text or logo.',
        'A calm oval seed jar with one small window revealing three large seeds, the icon of a seed-saving app, dark green matte. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-13',
      'Interlocking Toy Volumes',
      'interlocking block app icon',
      'interlocking-toy',
      {
        aesthetic:
          'Interlocking Toy Volumes: pieces with obvious original connectors lock together into one compact, recognizable metaphor.',
        subject_treatment:
          "Assemble the prompt's subject from a few pieces with an original, obvious connector system, every connection explaining the function.",
        color_and_tone: 'Colors assigned by piece function, one dominant mass and limited accents.',
        lighting_and_shadow: 'One broad common light with short contact shadows between the parts.',
        texture_and_material: 'Smooth matte materials, large joints and original connectors.',
        camera_and_composition:
          'Compact build with visible connections and no loose meaningless parts.',
        atmosphere_and_mood: 'The pleasure of building and a clear assembly, playful and precise.',
        rendering_and_quality:
          'The pieces can be mentally taken apart and the fit still makes sense.',
        key_features: 'original connectors; locking pieces; functional colors; compact build',
      },
      ['copied toy-brand connectors', 'floating parts', 'too many parts for a simple metaphor'],
      [
        'Three chunky interlocking pieces build a small robot guard dog with one raised ear, the icon of a home-security app, blue, cream and orange, original slot connectors. No readable text or logo.',
        'Two interlocking volumes form a toilet and a throne at once, the icon of an app for finding clean public restrooms, yellow and charcoal, ridiculous and clear. No readable text or logo.',
        'Two complementary pieces lock into a tiny three-step staircase, the icon of a learning app for adults going back to school, warm yellow and charcoal. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-14',
      'Cut-Pixel Medallions',
      'pixel cluster emblem app icon',
      'cut-pixel-medallion',
      {
        aesthetic:
          'Cut-Pixel Medallions: stepped pixel clusters and broad flat value planes build compact illustrative emblems on one fixed logical grid.',
        subject_treatment:
          "Build the prompt's subject as a compact emblem of stepped pixel clusters and large planes on one fixed logical grid such as 32, 40 or 48 pixels.",
        color_and_tone: 'A small palette of well-separated values and one accent with hard steps.',
        lighting_and_shadow: 'Shading in bands of whole pixels, stepped and crisp.',
        texture_and_material: 'Quantized edges and deliberate cluster surfaces placed by hand.',
        camera_and_composition: 'Compact silhouette of any shape, every element on the same grid.',
        atmosphere_and_mood: 'Illustrative solidity and digital rhythm, handmade pixel craft.',
        rendering_and_quality:
          'Shown at logical size and at a whole-number enlargement with the same palette.',
        key_features: 'stepped clusters; fixed logical grid; small palette; whole-pixel shading',
      },
      ['automatic pixelation', 'mandatory round medal', 'mixed internal scales'],
      [
        'A 48 by 48 pixel emblem of a wolf howling inside a broken crescent, the icon of a werewolf-support-group app, four cold blues and bone, carved by hand. No readable text or logo.',
        'A 40 by 40 pixel emblem of a heroic sandwich with a tiny cape, the icon of a lunch-delivery app for superheroes, five bright colors, proudly stepped. No readable text or logo.',
        'A 32 by 32 pixel emblem of an old brass key lying on a leaf, the icon of a garden-journal app, three greens and one gold accent. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-15',
      'Stitched-Edge Symbols',
      'stitched patch app icon',
      'stitched-edge',
      {
        aesthetic:
          'Stitched-Edge Symbols: cut pieces of flat material joined by large controlled stitches that explain how the parts connect.',
        subject_treatment:
          "Join the prompt's subject from a few cut pieces with large visible stitches where they meet, keeping the silhouette clean.",
        color_and_tone: 'Limited colors per piece with controlled contrast for the thread.',
        lighting_and_shadow: 'Diffuse light with minimal raised relief along the thread line.',
        texture_and_material: 'Matte surfaces, stitches of consistent scale and clean cut edges.',
        camera_and_composition: 'A few large pieces with one focal seam, most edges left plain.',
        atmosphere_and_mood: 'Handmade closeness and a repairable build, warm and tidy.',
        rendering_and_quality:
          'The figure reads without the stitches, which only add the relationship.',
        key_features: 'cut pieces; large stitches; one focal seam; repairable build',
      },
      ['embroidery as the only style', 'microscopic stitches', 'anatomy deformed by the pieces'],
      [
        'A torn black heart stitched back together with one thick silver seam, the icon of an app for people rebuilding their lives after a breakup, bold and hopeful. No readable text or logo.',
        'Two felt pieces stitched into a slightly lopsided cactus wearing a sweater, the icon of an app for knitting clothes for houseplants, terracotta and cream. No readable text or logo.',
        'A leaf made of two cut pieces joined by a few large stitches, the icon of a field-notes app, slate green and bone, calm. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-16',
      'Orbiting Part Icons',
      'orbit-linked app icon',
      'orbiting-part',
      {
        aesthetic:
          'Orbiting Part Icons: one main form and one secondary element linked by an open asymmetric arc that represents a real relationship.',
        subject_treatment:
          "Link the prompt's subject with one secondary element through an open arc that stands for a real relationship in the app.",
        color_and_tone:
          'Dominant primary mass, an accent secondary element and a lower-contrast arc.',
        lighting_and_shadow: 'One shared light with consistent contact across both forms.',
        texture_and_material: 'Sober surfaces and an arc thick enough to read at small size.',
        camera_and_composition:
          'Asymmetric open orbit with the secondary element away from key traits.',
        atmosphere_and_mood: 'Contained dynamic relationship, lively but never cosmic by default.',
        rendering_and_quality: 'Removing the arc clearly breaks the meaning of the icon.',
        key_features: 'open arc; main form; secondary element; real relationship',
      },
      ['gratuitous orbits', 'default planet', 'oversized secondary element'],
      [
        'A small moth circling a candle flame on an open arc, the icon of an app that warns you when you are about to text your ex, charcoal and coral. No readable text or logo.',
        'A dog bowl with one kibble orbiting it on an open arc like a tiny moon, the icon of an automatic pet feeder that is clearly running late, green and cream. No readable text or logo.',
        'A house with one small paper plane circling back to it on an open arc, the icon of an app for sending letters home, ink blue and amber. No readable text or logo.',
      ],
    ),
    A(
      'R-APP-17',
      'Soft Enamel Finish',
      'enamel pin finish modifier',
      'soft-enamel',
      {
        aesthetic:
          'Soft Enamel Finish: a surface modifier that fills an existing icon with smooth colored enamel between slightly raised metal borders.',
        subject_treatment:
          "Apply enamel only to the regions of the prompt's existing icon or mark, keeping its contour, openings and colors exactly as they are.",
        color_and_tone:
          'Source colors kept, with even enamel coverage and borders of a separate value.',
        lighting_and_shadow: 'Broad soft highlights that never cover text or close any gap.',
        texture_and_material: 'Smooth slightly domed enamel with a discreet raised metal border.',
        camera_and_composition: 'Camera and composition of the input artwork kept unchanged.',
        atmosphere_and_mood: 'Warm compact tactility, like a small collectible pin.',
        rendering_and_quality:
          'Before and after contours match; only the surface response changes.',
        key_features: 'domed enamel; raised metal border; kept contour; source colors',
      },
      ['redesign through material', 'border that fattens the silhouette', 'changed source colors'],
      [
        'Soft enamel finish on a skull-and-roses app icon for a tattoo-booking app: every region filled with glossy enamel between thin gold borders, contour unchanged. No readable text or logo.',
        'The icon of a burger app gets the soft enamel treatment, each layer of the burger filled with shiny enamel like a collectible pin, borders raised, shape exactly the same. No readable text or logo.',
        'A folder icon finished in soft enamel, tab and proportions exactly kept, calm blue enamel with a faint silver border and a short shadow. No readable text or logo.',
      ],
      'modifier',
    ),
    A(
      'R-APP-18',
      'Translucent Edge Finish',
      'translucent edge finish modifier',
      'translucent-edge',
      {
        aesthetic:
          'Translucent Edge Finish: a surface modifier that turns an existing icon into a solid translucent body with light gathering along its thickness and edges.',
        subject_treatment:
          "Change only the transmission and edge glow of the prompt's existing icon, keeping its silhouette locked and its front readable.",
        color_and_tone: 'Source palette kept, the transparency never fading the figure away.',
        lighting_and_shadow:
          'Broad controlled edge light with a readable front face and a tight halo.',
        texture_and_material:
          'Translucent material of moderate thickness, sober refraction and smooth surface.',
        camera_and_composition:
          'Framing and orientation of the input kept, background only for contrast.',
        atmosphere_and_mood: 'Optical lightness with a recognizable body, luminous yet calm.',
        rendering_and_quality:
          'Tested on light and dark grounds with an opaque version for control.',
        key_features: 'translucent body; edge light; locked silhouette; readable front',
      },
      ['glass as a new style', 'invisible silhouette', 'refraction that warps letters'],
      [
        'A dragon-head app icon rendered as solid translucent amber, light pooling along its horns and jaw edges, silhouette exactly unchanged, dark background for contrast. No readable text or logo.',
        'A ghost icon for a haunted-house rental app gets a translucent edge finish, which honestly makes it look even more like a ghost, soft blue light along the edges. No readable text or logo.',
        'An audio-wave icon turned into translucent green glass, the inner gaps kept open, shown on light and dark grounds side by side. No readable text or logo.',
      ],
      'modifier',
    ),
    A(
      'R-APP-19',
      'Platform Mask Preview',
      'app icon mask preview sheet',
      'platform-mask',
      {
        aesthetic:
          'Platform Mask Preview: one app icon shown under several container masks and backgrounds side by side, the artwork itself unchanged.',
        subject_treatment:
          "Show the prompt's subject icon unchanged inside square, circle and rounded-square masks and on light and dark grounds, with the same scale.",
        color_and_tone: 'Artwork colors kept, alternative backgrounds only as control views.',
        lighting_and_shadow:
          'The same lighting in every mask so the comparison only measures the crop.',
        texture_and_material: 'Original materials kept, the mask acting as a separate container.',
        camera_and_composition: 'Icons centered on a declared safe area in an even row of masks.',
        atmosphere_and_mood:
          'Consistent identity across every context, tidy, calm and comparative.',
        rendering_and_quality: 'Mask, scale and safe area noted outside the artwork.',
        key_features: 'mask row; unchanged artwork; safe area; light and dark grounds',
      },
      ['invented masks shown as official', 'icon redesign', 'inconsistent scales'],
      [
        'A mask preview sheet for a pirate-radio app icon, the skull-and-antenna artwork shown unchanged inside square, circle and rounded-square masks on dark and light grounds. No readable text or logo.',
        'Preview row for the icon of a very anxious houseplant app, the same trembling fern placed in four masks, every crop checked for leaves that get cut off. No readable text or logo.',
        'A quiet lighthouse app icon shown in three masks on light and dark grounds, the beam kept inside the safe area every time. No readable text or logo.',
      ],
      'profile',
    ),
    A(
      'R-APP-20',
      'Icon Family Reduction',
      'app icon family size sheet',
      'icon-family-reduction',
      {
        aesthetic:
          'Icon Family Reduction: a family of related app icons built from one shared rule, shown large and at small sizes on one sheet.',
        subject_treatment:
          "Present the prompt's subject as a family of related icons from shared rules, each shown large and reduced with only local simplifications.",
        color_and_tone:
          'Shared color roles across the family, each icon also checked in greyscale.',
        lighting_and_shadow: 'One light direction and softness for every member of the family.',
        texture_and_material:
          'Materials at one consistent scale, fine detail reduced before sharpening.',
        camera_and_composition: 'Rows of large and small versions with equal optical weight.',
        atmosphere_and_mood:
          'Clear kinship across the set without making every object the same shape.',
        rendering_and_quality:
          'Each small version keeps its own metaphor and the shared system traits.',
        key_features: 'shared rules; large and small rows; equal weight; kept metaphors',
      },
      ['family of clones', 'lost meaning when reduced', 'different materials for no reason'],
      [
        'A family of five app icons for a monster-hunter guild, bestiary, map, forge, tavern and graveyard, built from one folded-sheet rule and shown at large and tiny sizes in rows. No readable text or logo.',
        'Three sibling app icons for a chaotic family calendar, chores, snacks and blame, sharing one inflated-junction rule, each shown large and reduced beside its siblings. No readable text or logo.',
        'A calm family of four library icons, borrow, return, search and sit quietly, one shared inlay rule, large and small rows on a soft background. No readable text or logo.',
      ],
      'profile',
    ),
  ],
};

export default spec;
