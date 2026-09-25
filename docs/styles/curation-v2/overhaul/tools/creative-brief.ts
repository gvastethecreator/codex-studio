import type { Dna } from './apply';

// creative_brief reaches user style prompts as the layer "brief", so it must name this preset's
// own look. It is built from the preset's aesthetic and key features, plus one short guard.
export function creativeBriefFromDna(dna: Partial<Dna>): string {
  const aesthetic = String(dna.aesthetic ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const features = String(dna.key_features ?? '')
    .replace(/\s+/g, ' ')
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(', ');
  const lead = /[.!?]$/.test(aesthetic) ? aesthetic : `${aesthetic}.`;
  const carry = features ? ` Carry it through ${features}.` : '';
  return `${lead}${carry} Use it as a reusable look on any subject, keeping the prompt's own subject, action, setting and mood.`;
}
