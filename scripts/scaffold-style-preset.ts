import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type {
  StylePackManifest,
  StylePackManifestCategory,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import { toStylePresetManifestRef } from '../components/recipes/stylePresetManifests';

const defaultRootDir = process.cwd();
const styleManifestsRepoDir = path.join('components', 'recipes', 'styles', 'manifests');
const styleTemplatesRepoDir = path.join(styleManifestsRepoDir, 'templates');
const stylePacksRepoDir = path.join(styleManifestsRepoDir, 'packs');
const stylePresetsRepoDir = path.join(styleManifestsRepoDir, 'presets');

const templateFileByKind = {
  style: 'style-preset.template.yaml',
  sprite: 'sprite-sheet-preset.template.yaml',
  texture: 'texture-preset.template.yaml',
} as const;

const yamlDumpOptions = {
  lineWidth: -1,
  noRefs: true,
  sortKeys: false,
} as const;

export type StylePresetScaffoldTemplate = keyof typeof templateFileByKind;

export interface StylePresetScaffoldInput {
  presetId: string;
  packId: string;
  category: string;
  name: string;
  template: StylePresetScaffoldTemplate;
  defaultImage?: string;
  write?: boolean;
  rootDir?: string;
}

export interface StylePresetScaffoldPlan {
  dryRun: boolean;
  template: StylePresetScaffoldTemplate;
  templateFileRepoPath: string;
  packFileRepoPath: string;
  presetFileRepoPath: string;
  presetRef: string;
  packId: string;
  packName: string;
  categoryId: string;
  categoryName: string;
  defaultImagePath: string;
  defaultImageProvided: boolean;
  presetManifest: StylePresetManifest;
  packManifest: StylePackManifest;
  presetManifestYaml: string;
  packManifestYaml: string;
  nextSteps: string[];
}

function argValue(name: string, argv = process.argv) {
  return argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[0-9]+[.)]\s*/, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeDefaultImagePath(defaultImage?: string) {
  if (!isNonEmptyString(defaultImage)) return undefined;

  const normalized = defaultImage.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (normalized.startsWith('assets/')) {
    return `/${normalized}`;
  }

  return normalized;
}

function createDefaultImagePath(presetId: string) {
  return `/assets/recipes/styles/defaults/${presetId}.webp`;
}

function createYamlString(value: unknown) {
  return `${yaml.dump(value, yamlDumpOptions)}\n`;
}

function parseTemplateKind(value: string | undefined): StylePresetScaffoldTemplate {
  if (value === 'style' || value === 'sprite' || value === 'texture') {
    return value;
  }

  throw new Error('Missing or invalid --template. Use style, sprite, or texture.');
}

function parseRequiredArg(name: string, value: string | undefined) {
  if (!isNonEmptyString(value)) {
    throw new Error(`Missing required --${name}=... argument.`);
  }

  return value.trim();
}

function validatePresetId(presetId: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(presetId)) {
    throw new Error(
      `Invalid preset id "${presetId}". Use letters, numbers, dashes, or underscores only.`,
    );
  }
}

function clonePackManifest(packManifest: StylePackManifest): StylePackManifest {
  return {
    ...packManifest,
    categories: packManifest.categories.map((category) => ({
      ...category,
      presetRefs: [...category.presetRefs],
    })),
    presetRefs: [...packManifest.presetRefs],
  };
}

function findCategory(
  packManifest: StylePackManifest,
  categoryInput: string,
): StylePackManifestCategory {
  const trimmed = categoryInput.trim();
  const exactId = packManifest.categories.find((category) => category.id === trimmed);
  if (exactId) return exactId;

  const exactName = packManifest.categories.find((category) => category.name === trimmed);
  if (exactName) return exactName;

  const available = packManifest.categories.map((category) => `${category.id} (${category.name})`);
  throw new Error(
    `Category "${trimmed}" not found in ${packManifest.id}. Available categories: ${available.join(', ')}`,
  );
}

function findPackPresetInsertIndex(
  packManifest: StylePackManifest,
  category: StylePackManifestCategory,
) {
  let lastCategoryRefIndex = -1;

  for (const ref of category.presetRefs) {
    const index = packManifest.presetRefs.indexOf(ref);
    if (index > lastCategoryRefIndex) {
      lastCategoryRefIndex = index;
    }
  }

  if (category.presetRefs.length > 0 && lastCategoryRefIndex === -1) {
    throw new Error(
      `Pack manifest ${packManifest.id} is inconsistent: category ${category.id} refs are missing from pack presetRefs. Run bun run styles:validate before scaffolding.`,
    );
  }

  if (lastCategoryRefIndex >= 0) {
    return lastCategoryRefIndex + 1;
  }

  const categoryIndex = packManifest.categories.findIndex((entry) => entry.id === category.id);
  for (let index = categoryIndex + 1; index < packManifest.categories.length; index += 1) {
    for (const ref of packManifest.categories[index].presetRefs) {
      const packRefIndex = packManifest.presetRefs.indexOf(ref);
      if (packRefIndex >= 0) {
        return packRefIndex;
      }
    }
  }

  return packManifest.presetRefs.length;
}

function createScaffoldPresetManifest({
  templateManifest,
  packManifest,
  category,
  presetId,
  name,
  defaultImagePath,
  defaultImageProvided,
}: {
  templateManifest: StylePresetManifest;
  packManifest: StylePackManifest;
  category: StylePackManifestCategory;
  presetId: string;
  name: string;
  defaultImagePath: string;
  defaultImageProvided: boolean;
}) {
  const tags = [slugify(packManifest.name), category.id];

  return {
    ...templateManifest,
    id: presetId,
    packId: packManifest.id,
    name,
    category: category.name,
    tags,
    assets: {
      ...templateManifest.assets,
      defaultImage: defaultImagePath,
    },
    taxonomy: {
      ...templateManifest.taxonomy,
      packId: packManifest.id,
      packName: packManifest.name,
      categoryId: category.id,
      categoryName: category.name,
      tags,
      supportedTasks: [...templateManifest.supportedTasks],
      hasDefaultImage: defaultImageProvided,
    },
  } satisfies StylePresetManifest;
}

function applyRefToPackManifest({
  packManifest,
  category,
  presetRef,
}: {
  packManifest: StylePackManifest;
  category: StylePackManifestCategory;
  presetRef: string;
}) {
  if (packManifest.presetRefs.includes(presetRef)) {
    throw new Error(
      `Pack ${packManifest.id} already references ${presetRef}. Refusing duplicate refs.`,
    );
  }
  if (packManifest.categories.some((entry) => entry.presetRefs.includes(presetRef))) {
    throw new Error(
      `Pack ${packManifest.id} already references ${presetRef} in a category. Refusing duplicate refs.`,
    );
  }

  const nextPackManifest = clonePackManifest(packManifest);
  const nextCategory = nextPackManifest.categories.find((entry) => entry.id === category.id);

  if (!nextCategory) {
    throw new Error(`Category ${category.id} disappeared while scaffolding ${presetRef}.`);
  }

  const insertIndex = findPackPresetInsertIndex(nextPackManifest, nextCategory);
  nextCategory.presetRefs.push(presetRef);
  nextPackManifest.presetRefs.splice(insertIndex, 0, presetRef);

  return nextPackManifest;
}

async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readYamlFile<T>(filePath: string, label: string) {
  try {
    return yaml.load(await readFile(filePath, 'utf8')) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read ${label} at ${filePath}: ${message}`);
  }
}

async function readDirIfExists(dirPath: string) {
  try {
    return await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function readExistingPresetIds(rootDir: string) {
  const presetDir = path.join(rootDir, stylePresetsRepoDir);
  const presetFilesById = new Map<string, string>();

  for (const packEntry of await readDirIfExists(presetDir)) {
    if (!packEntry.isDirectory()) continue;
    const packDir = path.join(presetDir, packEntry.name);
    for (const presetEntry of await readDirIfExists(packDir)) {
      if (!presetEntry.isFile() || !presetEntry.name.endsWith('.yaml')) continue;

      const presetFilePath = path.join(packDir, presetEntry.name);
      const presetManifest = await readYamlFile<Partial<StylePresetManifest>>(
        presetFilePath,
        'Style Preset Manifest',
      );
      const manifestId = isNonEmptyString(presetManifest.id)
        ? presetManifest.id.trim()
        : path.basename(presetEntry.name, '.yaml');
      presetFilesById.set(manifestId, toRepoPath(rootDir, presetFilePath));
    }
  }

  return presetFilesById;
}

function usage() {
  return [
    'Usage:',
    '  bun run styles:scaffold -- --preset=<ID> --pack=<pack_id> --category=<category id or exact name> --name=<Name> --template=style|sprite|texture [--default-image=/assets/... ] [--write]',
    '',
    'Notes:',
    '  - Dry-run is the default. Pass --write to create/update files.',
    '  - The scaffold creates the preset YAML and updates both pack-level and category presetRefs.',
    '  - If --default-image is omitted, the scaffold uses /assets/recipes/styles/defaults/<ID>.webp and marks taxonomy.hasDefaultImage as false until the asset exists.',
  ].join('\n');
}

export function parseStylePresetScaffoldArgs(argv = process.argv): StylePresetScaffoldInput {
  const presetId = parseRequiredArg('preset', argValue('preset', argv));
  const packId = parseRequiredArg('pack', argValue('pack', argv));
  const category = parseRequiredArg('category', argValue('category', argv));
  const name = parseRequiredArg('name', argValue('name', argv));
  const template = parseTemplateKind(argValue('template', argv));
  const defaultImage = normalizeDefaultImagePath(argValue('default-image', argv));

  validatePresetId(presetId);

  return {
    presetId,
    packId,
    category,
    name,
    template,
    ...(defaultImage ? { defaultImage } : {}),
    write: argv.includes('--write'),
  };
}

export async function createStylePresetScaffoldPlan(
  input: StylePresetScaffoldInput,
): Promise<StylePresetScaffoldPlan> {
  const rootDir = input.rootDir ?? defaultRootDir;
  validatePresetId(input.presetId);
  const templateFileName = templateFileByKind[input.template];
  const templateFilePath = path.join(rootDir, styleTemplatesRepoDir, templateFileName);
  const packFilePath = path.join(rootDir, stylePacksRepoDir, `${input.packId}.yaml`);
  const presetFilePath = path.join(
    rootDir,
    stylePresetsRepoDir,
    input.packId,
    `${input.presetId}.yaml`,
  );
  const presetRef = toStylePresetManifestRef(input.packId, input.presetId);

  const [templateManifest, packManifest, existingPresetIds, presetFileAlreadyExists] =
    await Promise.all([
      readYamlFile<StylePresetManifest>(templateFilePath, 'Style Preset template'),
      readYamlFile<StylePackManifest>(packFilePath, 'Style Pack Manifest'),
      readExistingPresetIds(rootDir),
      fileExists(presetFilePath),
    ]);

  if (existingPresetIds.has(input.presetId)) {
    throw new Error(
      `Preset id ${input.presetId} already exists at ${existingPresetIds.get(input.presetId)}. Refusing overwrite.`,
    );
  }
  if (presetFileAlreadyExists) {
    throw new Error(
      `Preset file already exists at ${toRepoPath(rootDir, presetFilePath)}. Refusing overwrite.`,
    );
  }

  const category = findCategory(packManifest, input.category);
  const normalizedDefaultImage = normalizeDefaultImagePath(input.defaultImage);
  const defaultImagePath = normalizedDefaultImage ?? createDefaultImagePath(input.presetId);
  const defaultImageProvided = Boolean(normalizedDefaultImage);
  const presetManifest = createScaffoldPresetManifest({
    templateManifest,
    packManifest,
    category,
    presetId: input.presetId,
    name: input.name,
    defaultImagePath,
    defaultImageProvided,
  });
  const nextPackManifest = applyRefToPackManifest({
    packManifest,
    category,
    presetRef,
  });

  const nextSteps = [
    defaultImageProvided
      ? `Confirm the default image exists at ${defaultImagePath}.`
      : `Add the default image at ${defaultImagePath}, then set taxonomy.hasDefaultImage to true once the asset exists.`,
    `Run bun run styles:validate -- --preset=${input.presetId}`,
    'Run bun run styles:runtime',
    'Run bun run styles:verify',
  ];

  return {
    dryRun: !input.write,
    template: input.template,
    templateFileRepoPath: toRepoPath(rootDir, templateFilePath),
    packFileRepoPath: toRepoPath(rootDir, packFilePath),
    presetFileRepoPath: toRepoPath(rootDir, presetFilePath),
    presetRef,
    packId: packManifest.id,
    packName: packManifest.name,
    categoryId: category.id,
    categoryName: category.name,
    defaultImagePath,
    defaultImageProvided,
    presetManifest,
    packManifest: nextPackManifest,
    presetManifestYaml: createYamlString(presetManifest),
    packManifestYaml: createYamlString(nextPackManifest),
    nextSteps,
  };
}

export async function applyStylePresetScaffoldPlan(
  plan: StylePresetScaffoldPlan,
  rootDir = defaultRootDir,
) {
  const presetFilePath = path.join(rootDir, plan.presetFileRepoPath);
  const packFilePath = path.join(rootDir, plan.packFileRepoPath);

  await mkdir(path.dirname(presetFilePath), { recursive: true });
  await writeFile(presetFilePath, plan.presetManifestYaml, 'utf8');
  await writeFile(packFilePath, plan.packManifestYaml, 'utf8');
}

export async function scaffoldStylePreset(input: StylePresetScaffoldInput) {
  const rootDir = input.rootDir ?? defaultRootDir;
  const plan = await createStylePresetScaffoldPlan(input);

  if (input.write) {
    await applyStylePresetScaffoldPlan(plan, rootDir);
  }

  return plan;
}

function printPlan(plan: StylePresetScaffoldPlan) {
  console.log(
    `[styles:scaffold] preset=${plan.presetManifest.id} template=${plan.template} dryRun=${plan.dryRun}`,
  );
  console.log(`[styles:scaffold] pack=${plan.packId} (${plan.packName})`);
  console.log(`[styles:scaffold] category=${plan.categoryId} (${plan.categoryName})`);
  console.log(`[styles:scaffold] create=${plan.presetFileRepoPath}`);
  console.log(`[styles:scaffold] update=${plan.packFileRepoPath}`);
  console.log(`[styles:scaffold] ref=${plan.presetRef}`);
  console.log(
    `[styles:scaffold] defaultImage=${plan.defaultImagePath} hasDefaultImage=${plan.presetManifest.taxonomy?.hasDefaultImage ? 'true' : 'false'}`,
  );
  if (plan.dryRun) {
    console.log('[styles:scaffold] pass --write to apply the planned file changes.');
  }
  console.log('[styles:scaffold] nextSteps:');
  for (const step of plan.nextSteps) {
    console.log(`- ${step}`);
  }
}

if (import.meta.main) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage());
  } else {
    try {
      const input = parseStylePresetScaffoldArgs(process.argv);
      const plan = await scaffoldStylePreset(input);
      printPlan(plan);
    } catch (error) {
      console.error(`[styles:scaffold] ${error instanceof Error ? error.message : String(error)}`);
      console.error(usage());
      process.exitCode = 1;
    }
  }
}
