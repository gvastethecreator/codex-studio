import { describe, expect, it } from 'vitest';
import { legacyCardBrief } from './legacy-card-briefs';

describe('legacy preview briefs', () => {
  it('uses a portrait subject for photographic headshots and a spatial subject for architecture', () => {
    const headshot = legacyCardBrief(
      { id: 'pack_01' },
      { id: 'SP01-001', name: 'Studio Headshot', category: '1. Portrait And Studio' },
    );
    const architecture = legacyCardBrief(
      { id: 'pack_07' },
      { id: 'SP07-001', name: 'Warm Modernism', category: '1. Interior Design Systems' },
    );

    expect(headshot).toMatch(/portrait|head-and-shoulders/);
    expect(architecture).toMatch(
      /interior|courtyard|house|hall|street|bedroom|greenhouse|cafe|bridge|foyer|cabin|passage|apartment entry/,
    );
    expect(headshot).not.toMatch(/specimen|symbolic object|jar|vase/i);
    expect(architecture).not.toMatch(/specimen|symbolic object|jar|vase/i);
  });

  it('is stable per preset and varies the representative subject across adjacent cards', () => {
    const pack = { id: 'pack_17' };
    const preset = { id: 'SP17-001', name: 'Dark Fantasy', category: '1. Fantasy Illustration' };
    const first = legacyCardBrief(pack, preset);
    expect(legacyCardBrief(pack, preset)).toBe(first);
    expect(legacyCardBrief(pack, { ...preset, id: 'SP17-002' })).not.toBe(first);
    expect(first).toContain('only to the preview card');
  });

  it('keeps specialized photography cards tied to their subject instead of falling back to portraits', () => {
    const cases = [
      ['SP01-024', 'Drone Aerial', '4. Documentary And Street', /aerial view straight down/],
      ['SP01-049', 'Food Photography', '5. Commercial And Product', /sourdough bread/],
      ['SP01-060', 'Documentary (War)', '4. Documentary And Street', /aid worker/],
      ['SP01-063', 'Real Estate (HDR)', '5. Commercial And Product', /apartment living room/],
      ['SP01-067', 'Wedding Photography', '1. Portrait And Studio', /exchanging wedding rings/],
    ] as const;
    for (const [id, name, category, subject] of cases) {
      const brief = legacyCardBrief({ id: 'pack_01' }, { id, name, category });
      expect(brief).toMatch(subject);
      expect(brief).not.toMatch(/ceramic artist|bookbinder|violin maker|jar|vase/i);
    }
  });
});
