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
] as const;
export interface OutputLayoutContext {
  jobId: string;
  workspaceSlug?: string | null;
  providerId?: string | null;
  model?: string | null;
  recipeId?: string | null;
  createdAt?: Date;
  extension: string;
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
  };
  const name = cleanOutputPathPart(
    organization.fileNameTemplate.replace(
      /\{([^{}]*)\}/g,
      (_, key: keyof typeof values) => values[key],
    ),
    'image',
  );
  const extension = /^\.[a-z0-9]+$/i.test(context.extension)
    ? context.extension.toLowerCase()
    : '.png';
  return [
    ...organization.subfolderTokens.map((token) => values[token]),
    `${name}${extension}`,
  ].join('/');
}
