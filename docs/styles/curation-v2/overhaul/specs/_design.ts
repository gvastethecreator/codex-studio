import type { Create } from '../tools/apply';
import { dna } from './_strict';

// Applied-design presets (pack_25). Adapted from the 2026-09-25 applied-design research package
// (R-* ids, see docs/styles/curation-v2/applied-design/). The style changes how a deliverable is
// constructed; requested words, marks, data and interface content stay exact.
const BASE = [
  'real brand or trademark',
  'copying a specific famous design',
  'real artist signature',
];
const TEXT = [
  'misspelled or altered requested text',
  'extra invented words or letters',
  'lorem ipsum placeholder text',
];
const NO_TEXT = ['readable text', 'logo'];

export type DesignKind = 'style' | 'modifier' | 'profile';

export interface DesignOptions {
  // true: the deliverable shows requested words, marks or UI (textPolicy 'requested').
  text: boolean;
  kind?: DesignKind;
  source: string; // research id, e.g. 'R-LOG-01'
}

export function design(
  name: string,
  domain: string,
  tag: string,
  family: string,
  fields: Parameters<typeof dna>[0],
  avoid: string[],
  briefs: [string, string, string],
  opts: DesignOptions,
): Create {
  const kind = opts.kind ?? 'style';
  return {
    name,
    domain,
    tags: [
      tag,
      'applied-design',
      family,
      ...(kind === 'style' ? [] : [kind]),
      opts.source.toLowerCase(),
    ],
    dna: dna(fields),
    avoid: [...avoid, ...BASE, ...(opts.text ? TEXT : NO_TEXT)],
    ...(opts.text ? { textPolicy: 'requested' as const } : {}),
    briefs,
  };
}
