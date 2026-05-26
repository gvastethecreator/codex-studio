import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import type {
  StylePresetManifest,
  StylePresetManifestTask,
} from '../components/recipes/styles/manifestTypes';

const defaultRootDir = process.cwd();
const templateDir = path.join('components', 'recipes', 'styles', 'manifests', 'templates');

const visualDnaFields = [
  'aesthetic',
  'subject_treatment',
  'color_and_tone',
  'lighting_and_shadow',
  'texture_and_material',
  'camera_and_composition',
  'atmosphere_and_mood',
  'rendering_and_quality',
] as const;

const requiredTemplateTasks = new Map<string, StylePresetManifestTask[]>([
  ['style-preset.template.yaml', ['image_generate', 'image_edit', 'style_preset_card']],
  ['sprite-sheet-preset.template.yaml', ['sprite_sheet', 'image_generate', 'style_preset_card']],
  ['texture-preset.template.yaml', ['texture_generate', 'image_generate', 'style_preset_card']],
]);

export interface StylePresetTemplateEntry {
  filePath: string;
  id: string;
  supportedTasks: string[];
}

export interface StylePresetTemplateReport {
  templateCount: number;
  templates: StylePresetTemplateEntry[];
  violations: string[];
}

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

async function listTemplateFiles(rootDir: string) {
  const absoluteTemplateDir = path.join(rootDir, templateDir);
  const entries = await readdir(absoluteTemplateDir, { withFileTypes: true }).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  });

  return entries
    .reduce<string[]>((acc, entry) => {
      if (entry.isFile() && entry.name.endsWith('.template.yaml')) {
        acc.push(path.join(absoluteTemplateDir, entry.name));
      }
      return acc;
    }, [])
    .sort((a, b) => a.localeCompare(b));
}

function validateTemplate({
  fileName,
  repoPath,
  manifest,
}: {
  fileName: string;
  repoPath: string;
  manifest: StylePresetManifest;
}) {
  const violations: string[] = [];

  if (manifest.schemaVersion !== 1) {
    violations.push(`${repoPath} schemaVersion must be 1`);
  }
  for (const field of ['id', 'packId', 'name', 'category'] as const) {
    if (!isNonEmptyString(manifest[field])) {
      violations.push(`${repoPath} missing ${field}`);
    }
  }
  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    violations.push(`${repoPath} version must be a positive integer`);
  }
  if (!Array.isArray(manifest.supportedTasks) || manifest.supportedTasks.length === 0) {
    violations.push(`${repoPath} must declare supportedTasks`);
  }
  const supportedTasksSet = new Set(manifest.supportedTasks);
  const taxonomySupportedTasksSet = new Set(manifest.taxonomy?.supportedTasks ?? []);
  for (const task of requiredTemplateTasks.get(fileName) ?? []) {
    if (!supportedTasksSet.has(task)) {
      violations.push(`${repoPath} missing supported task ${task}`);
    }
    if (!taxonomySupportedTasksSet.has(task)) {
      violations.push(`${repoPath} taxonomy missing supported task ${task}`);
    }
  }
  for (const field of visualDnaFields) {
    if (!isNonEmptyString(manifest.visualDna?.[field])) {
      violations.push(`${repoPath} visualDna.${field} is empty`);
    }
  }
  if (!Array.isArray(manifest.avoidRules) || manifest.avoidRules.length === 0) {
    violations.push(`${repoPath} must include avoidRules`);
  }
  if (!isNonEmptyString(manifest.assets?.defaultImage)) {
    violations.push(`${repoPath} must include assets.defaultImage`);
  }
  if (!manifest.taxonomy) {
    violations.push(`${repoPath} must include taxonomy`);
  }

  return violations;
}

export async function createStylePresetTemplateReport(
  rootDir = defaultRootDir,
): Promise<StylePresetTemplateReport> {
  const files = await listTemplateFiles(rootDir);
  const templates: StylePresetTemplateEntry[] = [];
  const violations: string[] = [];
  const fileNames = new Set(files.map((filePath) => path.basename(filePath)));

  for (const fileName of requiredTemplateTasks.keys()) {
    if (!fileNames.has(fileName)) {
      violations.push(`${templateDir.replace(/\\/g, '/')}/${fileName} is missing`);
    }
  }

  for (const filePath of files) {
    const repoPath = toRepoPath(rootDir, filePath);
    const fileName = path.basename(filePath);
    const manifest = yaml.load(await readFile(filePath, 'utf8')) as StylePresetManifest;

    templates.push({
      filePath: repoPath,
      id: manifest.id,
      supportedTasks: [...(manifest.supportedTasks ?? [])],
    });
    violations.push(...validateTemplate({ fileName, repoPath, manifest }));
  }

  return {
    templateCount: templates.length,
    templates,
    violations,
  };
}

if (import.meta.main) {
  const report = await createStylePresetTemplateReport();

  console.log(`[styles:templates] templates=${report.templateCount}`);
  for (const template of report.templates) {
    console.log(
      `[styles:templates] ${template.filePath} id=${template.id} tasks=${template.supportedTasks.join(',')}`,
    );
  }
  if (report.violations.length > 0) {
    console.error(`[styles:templates] violations=${report.violations.length}`);
    for (const violation of report.violations) {
      console.error(`- ${violation}`);
    }
    process.exitCode = 1;
  } else {
    console.log('[styles:templates] ok');
  }
}
