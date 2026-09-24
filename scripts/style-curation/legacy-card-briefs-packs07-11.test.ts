import { describe, expect, it } from 'vitest';
import { legacyBriefPacks07to11 } from './legacy-card-briefs-packs07-11';

describe('legacy preview subjects for packs 07–11', () => {
  it('returns representative scenes for the audited architecture, garden and miniature cases', () => {
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_07' },
        {
          id: 'SP07-041',
          name: 'Formal Topiary Axis',
          category: '4. Landscape And Garden Systems',
        },
      ),
    ).toMatch(/parterre|hedge|garden/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_07' },
        {
          id: 'SP07-065',
          name: 'Papercraft Diorama Construction',
          category: '6. Toy Craft And Miniature Architecture',
        },
      ),
    ).toMatch(/paper model|folded edges/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_07' },
        {
          id: 'SP07-070',
          name: 'Confectionery Structural Ornament',
          category: '6. Toy Craft And Miniature Architecture',
        },
      ),
    ).toMatch(/sugar-cast arch/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_07' },
        { id: 'SP07-002', name: 'Industrial Loft', category: '1. Interior Design Systems' },
      ),
    ).toMatch(/converted warehouse loft/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_07' },
        {
          id: 'SP07-007',
          name: 'Art Deco',
          category: '2. Architectural Movements And Vernaculars',
        },
      ),
    ).toMatch(/art-deco theater facade/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_07' },
        {
          id: 'SP07-039',
          name: 'Data Center Grid',
          category: '3. Civic Infrastructure And Specialty Spaces',
        },
      ),
    ).toMatch(/server racks/i);
  });

  it('keeps clothing previews focused on adult outfits and non-branded original designs', () => {
    const brief = legacyBriefPacks07to11(
      { id: 'pack_08' },
      { id: 'SP08-045', name: 'Superhero Spandex', category: '4. Fantasy Sci-Fi Costume' },
    );
    expect(brief).toMatch(/adult model|original caped athletic costume/i);
    expect(brief).toMatch(/blank chest panel|no symbols/i);
    expect(brief).not.toMatch(/logo|trademark|licensed|famous character/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_08' },
        { id: 'SP08-040', name: 'Space Suit (Retro)', category: '4. Fantasy Sci-Fi Costume' },
      ),
    ).toMatch(/retro space suit/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_08' },
        { id: 'SP08-054', name: 'Chainmail', category: '5. Fabric & Texture Focus' },
      ),
    ).toMatch(/linked metal rings/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_08' },
        {
          id: 'SP08-079',
          name: 'Refractive Concealment Veil',
          category: '4. Fantasy Sci-Fi Costume',
        },
      ),
    ).toMatch(/translucent prism-like veil/i);
  });

  it('renders material and elemental cases as varied close subjects without default vessels', () => {
    const slime = legacyBriefPacks07to11(
      { id: 'pack_09' },
      { id: 'SP09-043', name: 'Slime/Goo', category: '5. Elemental And FX' },
    );
    const rust = legacyBriefPacks07to11(
      { id: 'pack_09' },
      { id: 'SP09-018', name: 'Rusty Iron', category: '3. Weathering And Decay' },
    );
    expect(slime).toMatch(/gel droplet|ribbon/i);
    expect(rust).toMatch(/hinge plate|corrosion/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_09' },
        { id: 'SP09-002', name: 'Mahogany (Polished)', category: '1. Natural Materials' },
      ),
    ).toMatch(/mahogany.*polished highlights/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_09' },
        { id: 'SP09-059', name: 'Soap Bubbles', category: '5. Elemental And FX' },
      ),
    ).toMatch(/soap bubbles touching/i);
    expect(`${slime} ${rust}`).not.toMatch(/\b(vase|jar)\b/i);
  });

  it('keeps diagram previews illustrative and QR-like grids nonfunctional', () => {
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_10' },
        { id: 'SP10-069', name: 'QR Code Style', category: '7. Diagram And Data Systems' },
      ),
    ).toMatch(/no encoded or scannable content/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_11' },
        { id: 'SP11-033', name: 'Blueprint', category: '7. Diagram And Technical Drawing' },
      ),
    ).toMatch(/illustrative blueprint|blank annotation areas/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_10' },
        { id: 'SP10-068', name: 'Topographic Map', category: '7. Diagram And Data Systems' },
      ),
    ).toMatch(/topographic map diagram/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_10' },
        { id: 'SP10-016', name: 'Ferrofluid', category: '2. Fluid & Organic' },
      ),
    ).toMatch(/ferrofluid mound|magnetic spikes/i);
  });

  it('keeps pack 11 subjects original, stable and distinct across the toy, food and macro ranges', () => {
    const toy = legacyBriefPacks07to11(
      { id: 'pack_11' },
      { id: 'SP11-001', name: 'Lego Toy Brick Build', category: '1. Toys And Crafts' },
    );
    const food = legacyBriefPacks07to11(
      { id: 'pack_11' },
      { id: 'SP11-032', name: 'Latte Art', category: '4. Food And Drink' },
    );
    const macro = legacyBriefPacks07to11(
      { id: 'pack_11' },
      { id: 'SP11-069', name: 'Skin Pores', category: '5. Micro Macro' },
    );
    expect(toy).toMatch(/generic interlocking toy bricks/i);
    expect(food).toMatch(/latte surface|crema/i);
    expect(macro).toMatch(/cheek-skin texture|pores/i);
    expect(toy).toBe(
      legacyBriefPacks07to11(
        { id: 'pack_11' },
        { id: 'SP11-001', name: 'Lego Toy Brick Build', category: '1. Toys And Crafts' },
      ),
    );
    expect(`${toy} ${food} ${macro}`).not.toMatch(/\b(vase|jar)\b/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_11' },
        { id: 'SP11-023', name: 'Tin Toy', category: '1. Toys And Crafts' },
      ),
    ).toMatch(/tin wind-up bird/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_11' },
        { id: 'SP11-048', name: 'Sushi Platter', category: '4. Food And Drink' },
      ),
    ).toMatch(/sushi assortment/i);
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_11' },
        { id: 'SP11-057', name: 'Insect Eye', category: '5. Micro Macro' },
      ),
    ).toMatch(/insect eye.*facets/i);
  });

  it('returns null for packs outside its ownership', () => {
    expect(
      legacyBriefPacks07to11(
        { id: 'pack_06' },
        { id: 'SP06-001', name: 'Example', category: '1. Example' },
      ),
    ).toBeNull();
  });
});
