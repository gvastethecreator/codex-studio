import type { Spec } from '../tools/apply';
import { design } from './_design';

// Surface & textile design (part B): R-PAT-11..16 styles, R-PAT-17/18 repeat and placement profiles, and the
// seamless proof and colorway recipes as sheet profiles.
const S = (
  source: string,
  name: string,
  domain: string,
  tag: string,
  fields: Parameters<typeof design>[4],
  avoid: string[],
  briefs: [string, string, string],
  kind: 'style' | 'profile' = 'style',
) => design(name, domain, tag, 'surface', fields, avoid, briefs, { text: false, source, kind });

const HIST = 'copied historical or cultural ornament';

const spec: Spec = {
  pack: 'pack_25',
  category: '13. Surface & Textile Design',
  updates: {},
  creates: [
    S(
      'R-PAT-11',
      'Porous Tile Ornament',
      'perforated tile module pattern',
      'porous-tile',
      {
        aesthetic:
          'Porous Tile Ornament: compact perforated tile modules resting on wide supports, their holes forming a secondary rhythm between pieces.',
        subject_treatment:
          "Build a tiled surface from perforated modules based on the prompt's subject, wide supports at alternate corners and holes that form a rhythm across tiles.",
        color_and_tone: 'Two values for mass and perforation with an optional quiet accent.',
        lighting_and_shadow: 'A flat main view, with optional low relief under one light.',
        texture_and_material:
          'Clean edges and legible holes, mineral look only once the fit works.',
        camera_and_composition:
          'A module grid with alternating supports and a four-tile meeting test.',
        atmosphere_and_mood: 'Porous, contained order balancing solid surface and breath.',
        rendering_and_quality: 'Clean tiling with open holes and recoverable module limits.',
        key_features: 'perforated modules; alternating supports; hole rhythm; four-tile test',
      },
      [
        'piece shown as manufacturable',
        'holes closed by texture',
        'joints hidden by shadows',
        HIST,
      ],
      [
        'Floor tiles for an underground temple of the moon: perforated modules whose holes join into crescent shapes when four tiles meet, pale stone and deep blue. No readable text or logo.',
        'Bathroom tiles perforated in the shape of tiny rubber ducks that line up into a parade when the tiles rotate, two tones. No readable text or logo.',
        'Square modules with one curved opening and one angled notch that complete each other when rotated, two values, 3 by 3 mosaic. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-12',
      'Growth-Rule Surface Motifs',
      'rule-based branching motif family',
      'growth-rule',
      {
        aesthetic:
          'Growth-Rule Surface Motifs: a family of motifs grown from one small rule of branching, length and angle, varied within declared limits.',
        subject_treatment:
          "Grow a family of motifs from the prompt's subject with one declared branching rule, then combine several generations into a repeating surface.",
        color_and_tone: 'Color by visual generation or scale in a reduced palette.',
        lighting_and_shadow: 'Flat or lightly modeled, with every branching point visible.',
        texture_and_material: 'Continuous strokes, clear ends and a second level of detail only.',
        camera_and_composition:
          'Several generations mixed with open gaps, edges following the same rule.',
        atmosphere_and_mood: 'Disciplined growth with clear kinship and small local surprises.',
        rendering_and_quality:
          'Clean pattern with countable nodes and a stated maximum complexity.',
        key_features: 'branching rule; motif family; generations mixed; countable nodes',
      },
      ['infinite branches', 'contradictory rules', 'claims of a real simulation', HIST],
      [
        "A surface for an alien botanist's lab coat: motifs grown from one rule, each stem splitting twice at 30 and 60 degrees into glowing pods, three generations mixed. No readable text or logo.",
        'A family of branching motifs that are clearly just increasingly complicated forks, grown by one rule and scattered across a tablecloth. No readable text or logo.',
        'Branching modules of orthogonal lines with one final diagonal split, at most seven segments each, ink and reserve. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-13',
      'Uneven Tessellation Fields',
      'two-scale uneven tessellation',
      'uneven-tessellation',
      {
        aesthetic:
          'Uneven Tessellation Fields: related pieces at two scales share complementary edges and a few orientations, covering the field with no gaps.',
        subject_treatment:
          "Cover a surface with pieces based on the prompt's subject at two scales, with complementary edges and a few allowed orientations, leaving no accidental gaps.",
        color_and_tone: 'Palette by piece family with enough contrast to inspect the edges.',
        lighting_and_shadow: 'Flat geometric art, verified before any material rendering.',
        texture_and_material:
          'Exact shared edges made of clearly defined curves or straight segments.',
        camera_and_composition:
          'Uneven distribution of scales with neighbor rules and no central patch.',
        atmosphere_and_mood: 'Irregularity with clear kinship, varied but never improvised.',
        rendering_and_quality: 'Clean coverage with no overlaps or unauthorized gaps.',
        key_features: 'two-scale pieces; complementary edges; limited rotations; full coverage',
      },
      [
        'puzzles that do not fit',
        'joints disguised by texture',
        'shapes changing between repeats',
        HIST,
      ],
      [
        "A floor for a dragon's lair made of interlocking scale-shaped tiles at two sizes, big armored scales and small ones filling every gap, obsidian and gold. No readable text or logo.",
        'A tessellation of cats and slightly smaller cats that fit together perfectly, only turned by 90 degrees, looking deeply annoyed about it. No readable text or logo.',
        'A field of L-shaped pieces and their square complements, large and small groups mixed, two inks. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-14',
      'Figure-Ground Reversal Patterns',
      'reversible figure-ground pattern',
      'figure-ground',
      {
        aesthetic:
          'Figure-Ground Reversal Patterns: shapes and the spaces between them are equally designed, so either one can be read as the figure.',
        subject_treatment:
          "Build a repeating surface from the prompt's subject where the masses and the gaps are equally complex and share every edge, readable either way.",
        color_and_tone: 'Two balanced values that keep contrast when inverted.',
        lighting_and_shadow: 'Flat surface with figure and ground equally crisp.',
        texture_and_material: 'One family of edges and minimal interior detail.',
        camera_and_composition:
          'Alternating reading zones with both structures continuous at the edges.',
        atmosphere_and_mood: 'A calm perceptual flicker between two equally strong organizations.',
        rendering_and_quality: 'Clean repeat with shared contours and stable reading when reduced.',
        key_features: 'equal figure and ground; shared edges; both polarities; perceptual flip',
      },
      [
        'inverting any pattern and calling it new',
        'leftover empty gaps',
        'elements lost in one polarity',
        HIST,
      ],
      [
        'A pattern where black flying birds and the white spaces between them become swimming fish, both fully drawn, for the wallpaper of a lighthouse. No readable text or logo.',
        'A pattern of coffee cups whose gaps are exactly shaped like tired faces, readable both ways, two tones. No readable text or logo.',
        'Angular stepped masses leaving a second network of windows, one ink and its exact inversion side by side. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-15',
      'Stitched Line Topologies',
      'stitched route network pattern',
      'stitched-topology',
      {
        aesthetic:
          'Stitched Line Topologies: apparent stitch paths form nodes, loops and links with a consistent stitch length and traceable routes.',
        subject_treatment:
          "Build a repeating surface from the prompt's subject as apparent stitch paths forming nodes and loops, one stitch length and every route traceable.",
        color_and_tone: 'One or two thread colors, crossings also shown by direction or break.',
        lighting_and_shadow: 'Very soft raking light, the route still clear when flat.',
        texture_and_material: 'Simplified stitches and steady spacing with relief kept subtle.',
        camera_and_composition: 'Routes grouped in open fields with connectable edges.',
        atmosphere_and_mood: 'A regular handmade rhythm, neither rigid nor chaotic.',
        rendering_and_quality: 'Clean pattern with legible knots that stays calm when reduced.',
        key_features: 'stitch routes; nodes and loops; steady stitch length; traceable paths',
      },
      ['fake embroidery file', 'impossible stitches', 'thread texture with no route grammar', HIST],
      [
        'A quilt for a polar explorer where stitched routes trace every journey between tiny stitched camps, graphite thread on sand, loops at each camp. No readable text or logo.',
        'A cushion where one long stitched path wanders everywhere trying to find the way out, getting lost in loops, charcoal thread. No readable text or logo.',
        'A pillowcase of small open circular stitches linked by straight running stitches, the openings alternating sides row by row, one soft grey thread on cream. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-16',
      'Layered Tracery Fields',
      'fine tracery over bold masses',
      'layered-tracery',
      {
        aesthetic:
          'Layered Tracery Fields: a fine linear network passes over bold ornamental masses, small reserves at every meeting keeping the two scales apart.',
        subject_treatment:
          "Lay a fine linear network over bold masses based on the prompt's subject, with small reserves at each meeting so both scales stay distinct.",
        color_and_tone: 'Moderate contrast for the network and stronger presence for the masses.',
        lighting_and_shadow: 'Flat art where separation comes from the reserves.',
        texture_and_material: 'Fine yet reproducible lines and simple mass edges.',
        camera_and_composition:
          'Network nodes kept off mass centers, with corridors of space between groups.',
        atmosphere_and_mood: 'Structural delicacy with wide pauses and localized complexity.',
        rendering_and_quality: 'Clean tracery that stays legible at use size with no moire.',
        key_features: 'fine tracery; bold masses; reserves at meetings; two scales',
      },
      ['illegible filigree', 'too many ornaments mixed', 'glass effects hiding the grammar', HIST],
      [
        'A stained-glass-like surface for a cathedral of the sea: bold wave masses crossed by a fine web of angular lines, small breaks where they meet, two inks on warm ground. No readable text or logo.',
        'Large abstract pancakes crossed by a fine network of syrup lines that politely stop before touching each pancake. No readable text or logo.',
        'Wide oval windows with fine branching lines behind them that stop short of the masses, even air. No readable text or logo.',
      ],
    ),
    S(
      'R-PAT-17',
      'Half-Drop Repeat Layout',
      'half-drop repeat layout profile',
      'half-drop',
      {
        aesthetic:
          'Half-Drop Repeat Layout: one module repeated with every other column dropped by half its height, the edges matching exactly.',
        subject_treatment:
          "Repeat the prompt's pattern module with alternate columns dropped by half, keeping the module's content and orientation exactly the same.",
        color_and_tone: 'Palette inherited from the module with no recolor between instances.',
        lighting_and_shadow: 'Any light baked into the module kept, no shadows between tiles.',
        texture_and_material: 'The same artwork in every instance, never redrawn per tile.',
        camera_and_composition:
          'Alternate columns offset by 50 percent with checkable edge matches.',
        atmosphere_and_mood: 'A diagonal cadence born purely from the offset.',
        rendering_and_quality: 'Exact placements and no blurry interpolation in the mosaic.',
        key_features: 'half-drop offset; exact module; matching edges; diagonal cadence',
      },
      ['distorted tile', 'approximate offset', 'calling a new layout a new style', HIST],
      [
        'A half-drop repeat of one lantern-and-moth module for a night-market awning, six columns dropping by half so the lanterns climb diagonally. No readable text or logo.',
        'A half-drop repeat of a single sneezing-cat module that turns an ordinary fabric into a cascade of sneezes. No readable text or logo.',
        'A straight repeat and a half-drop of the same arc module side by side, same scale and color. No readable text or logo.',
      ],
      'profile',
    ),
    S(
      'R-PAT-18',
      'Engineered Border Placement',
      'measured border placement profile',
      'border-placement',
      {
        aesthetic:
          'Engineered Border Placement: border, center and corners placed on a defined surface by measurements, every region with its own role.',
        subject_treatment:
          "Place the prompt's border, center and corner pieces on a defined rectangle by measured anchors, keeping a reserved center and the target proportions.",
        color_and_tone: 'Colors inherited from the artwork with a consistent zone hierarchy.',
        lighting_and_shadow: 'A flat main view, any mockup keeping the same placement.',
        texture_and_material:
          'Artwork and region masks kept apart, guides left out of the final view.',
        camera_and_composition: 'Measured anchors, explicit margins and dedicated corner pieces.',
        atmosphere_and_mood: 'A frame fitted to its surface with a breathing center.',
        rendering_and_quality: 'Precise registration of limits with nothing clipped by accident.',
        key_features: 'measured anchors; corner pieces; reserved center; fitted frame',
      },
      ['universal seamless fill', 'invented measurements', 'unevenly compressed borders', HIST],
      [
        'A border placed on a rectangular banner for a jousting tournament: galloping horses along the long sides, crossed lances at the corners and a clean empty center. No readable text or logo.',
        'A border engineered for a pizza box lid, tiny chefs marching along the edges and a lazy chef napping in each corner. No readable text or logo.',
        'A calm border on a 600 by 400 test rectangle with a 24-unit inner reserve and four corner pieces, clean art view. No readable text or logo.',
      ],
      'profile',
    ),
    S(
      'R-PAT-19',
      'Seamless Tile Proof',
      'tile and repeat proof sheet profile',
      'seamless-proof',
      {
        aesthetic:
          'Seamless Tile Proof: one pattern tile shown alone, as a 4 by 4 mosaic and as enlarged seam strips, so the repeat can be judged.',
        subject_treatment:
          "Show the prompt's pattern tile alone, as a 4 by 4 mosaic and as enlarged horizontal and vertical seam strips, the tile itself unchanged.",
        color_and_tone: 'Pattern colors untouched, any review marks kept on a separate layer.',
        lighting_and_shadow: 'Flat presentation with nothing added over the joints.',
        texture_and_material:
          'Original resolution and tile edges kept intact for close inspection.',
        camera_and_composition: 'Single tile, 4 by 4 mosaic and seam strips in one tidy sheet.',
        atmosphere_and_mood: 'A critical reading of close continuity and distant rhythm.',
        rendering_and_quality: 'Clean sheet where seams and repeating hot spots are easy to see.',
        key_features: 'single tile; 4 by 4 mosaic; seam strips; unchanged tile',
      },
      ['seamless claims with no mosaic', 'blurred seams', 'destructive fixes', HIST],
      [
        'A proof sheet for a tile of drifting jellyfish meant for an aquarium wall: the single tile, a 4 by 4 mosaic and two enlarged seam strips showing the tentacles crossing edges. No readable text or logo.',
        'A proof sheet for a tile of spaghetti that looks seamless until the mosaic reveals one meatball repeating far too often. No readable text or logo.',
        'A proof sheet for a simple band tile, single tile, mosaic and seam strips, neutral layout. No readable text or logo.',
      ],
      'profile',
    ),
    S(
      'R-PAT-20',
      'Colorway Family Study',
      'pattern colorway family profile',
      'colorway-family',
      {
        aesthetic:
          'Colorway Family Study: one locked pattern shown in several colorways in equal panels, roles of figure, ground and accent kept in each.',
        subject_treatment:
          "Show the prompt's pattern in three or four colorways in equal panels, geometry locked and the roles of figure, ground and accent kept.",
        color_and_tone: 'Each colorway defined by value and saturation relationships.',
        lighting_and_shadow: 'Identical, even support light in every one of the panels.',
        texture_and_material: 'The same art, masks and finish in every colorway.',
        camera_and_composition: 'Equal panels at one scale and crop with a small palette key.',
        atmosphere_and_mood: 'A color family with distinct personalities and clear kinship.',
        rendering_and_quality: 'Identical coverage and readable detail in every variant.',
        key_features: 'equal colorway panels; locked geometry; kept roles; palette key',
      },
      ['new motifs', 'recolor that inverts hierarchy', 'counting colorways as new styles', HIST],
      [
        'Four colorways of a lantern-festival pattern, midnight, dawn, ember and jade, in equal panels with the lanterns always the brightest element. No readable text or logo.',
        'Three colorways of a pickle pattern called, internally, "slightly green", "very green" and "concerning green", same geometry. No readable text or logo.',
        'Three calm colorways of one pattern, ink on bone, rust on cream and blue on grey, equal panels. No readable text or logo.',
      ],
      'profile',
    ),
  ],
};

export default spec;
