import type { StudioOutputOrganizationSettings } from './studioSettings';

export const OUTPUT_FOLDER_TOKENS = [
  'workspace',
  'date',
  'workflow',
  'provider',
  'model',
  'recipe',
] as const;
export const OUTPUT_NAME_TOKENS = [
  'date',
  'time',
  'timestamp',
  'workspace',
  'workflow',
  'provider',
  'model',
  'job',
  'jobId',
  'recipe',
  'prompt',
  'style',
] as const;
export interface OutputLayoutContext {
  jobId: string;
  workspaceSlug?: string | null;
  providerId?: string | null;
  model?: string | null;
  recipeId?: string | null;
  /** The user's prompt; `{prompt}` keeps its first meaningful words. */
  promptText?: string | null;
  /** The applied style name, such as `Kodak Portra 400 - Alec Soth` or `A + B` for a mix. */
  styleName?: string | null;
  createdAt?: Date;
  extension: string;
}

const PROMPT_WORD_LIMIT = 6;
const PROMPT_SLUG_LIMIT = 48;
const STYLE_SLUG_LIMIT = 40;
// Short words that make a filename longer without saying what the image shows.
const FILLER_WORDS = new Set(
  'a an the of on in at to with and or for from by into de del la el los las un una unos unas y o en con por para al'.split(
    ' ',
  ),
);

function slugWords(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** `a small wise owl perched on a brass lantern` -> `small-wise-owl-perched-brass-lantern`. */
export function promptFileSlug(prompt: string | null | undefined) {
  const words = slugWords(prompt ?? '').filter((word) => !FILLER_WORDS.has(word));
  return words.slice(0, PROMPT_WORD_LIMIT).join('-').slice(0, PROMPT_SLUG_LIMIT).replace(/-+$/, '');
}

/** `Kodak Portra 400 - Alec Soth` -> `kodak-portra-400`; a mix joins its styles with `+`. */
export function styleFileSlug(styleName: string | null | undefined) {
  return (styleName ?? '')
    .split('+')
    .map((part) => slugWords(part.split(' - ')[0] ?? '').join('-'))
    .filter(Boolean)
    .join('+')
    .slice(0, STYLE_SLUG_LIMIT)
    .replace(/[-+]+$/, '');
}

export function cleanOutputPathPart(value: string | null | undefined, fallback: string) {
  let result = (value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[. -]+|[. -]+$/g, '')
    .slice(0, 120);
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(result)) result = `_${result}`;
  return result || fallback;
}

export function validateOutputTemplate(template: string): string | null {
  if (!template.trim()) return 'Enter an output filename template.';
  if (template.length > 120) return 'Use at most 120 characters in the filename template.';
  if (/[<>:"/\\|?*\x00-\x1f]/.test(template))
    return 'Use a filename without folder separators or reserved characters.';
  const tokens = [...template.matchAll(/\{([^{}]*)\}/g)].map((match) => match[1]);
  const unknown = tokens.find(
    (token) => !(OUTPUT_NAME_TOKENS as readonly string[]).includes(token),
  );
  if (unknown !== undefined) return `Unknown filename token: {${unknown}}.`;
  if (/[{}]/.test(template.replace(/\{[^{}]*\}/g, '')))
    return 'Close each filename token with matching braces.';
  return null;
}

/** Relative to the selected output directory. The UI and worker use this formatter. */
export function formatOutputRelativePath(
  organization: StudioOutputOrganizationSettings,
  context: OutputLayoutContext,
) {
  const error = validateOutputTemplate(organization.fileNameTemplate);
  if (error) throw new Error(error);
  const date = context.createdAt ?? new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const values = {
    date: day,
    time,
    timestamp: `${day.replaceAll('-', '')}-${time}`,
    workspace: cleanOutputPathPart(context.workspaceSlug, 'default'),
    workflow: cleanOutputPathPart(context.recipeId, 'default'),
    recipe: cleanOutputPathPart(context.recipeId, 'no-recipe'),
    provider: cleanOutputPathPart(context.providerId, 'provider'),
    model: cleanOutputPathPart(context.model, 'model'),
    job: cleanOutputPathPart(context.jobId, 'job'),
    jobId: cleanOutputPathPart(context.jobId, 'job'),
    prompt: promptFileSlug(context.promptText),
    style: styleFileSlug(context.styleName),
  };
  // An empty token, such as {style} without a style, drops one separator next to it, so the
  // name keeps no doubled or dangling separator.
  const filled = organization.fileNameTemplate
    .replace(/\{([^{}]*)\}/g, (_, key: keyof typeof values) => values[key] || '\u0000')
    .replace(/([_-]?)\u0000(?:[_-]?\u0000)*([_-]?)/g, (_, before: string, after: string) =>
      before && after ? before : '',
    );
  const name = cleanOutputPathPart(filled, 'image');
  const extension = /^\.[a-z0-9]+$/i.test(context.extension)
    ? context.extension.toLowerCase()
    : '.png';
  return [
    ...organization.subfolderTokens.map((token) => values[token]),
    `${name}${extension}`,
  ].join('/');
}
