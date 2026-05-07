import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const WEBP_OPTIONS = { quality: 92, effort: 6 } as const;

const recipeAssetMappings = [
  {
    sourceDir: path.join(rootDir, 'components', 'recipes', 'defaults'),
    targetDir: path.join(rootDir, 'assets', 'recipes', 'cards'),
  },
  {
    sourceDir: path.join(rootDir, 'components', 'recipes', 'styles', 'category-bases'),
    targetDir: path.join(rootDir, 'assets', 'recipes', 'styles', 'category-bases'),
  },
  {
    sourceDir: path.join(rootDir, 'components', 'recipes', 'styles', 'defaults'),
    targetDir: path.join(rootDir, 'assets', 'recipes', 'styles', 'defaults'),
  },
  {
    sourceDir: path.join(rootDir, 'components', 'recipes', 'styles', 'previews'),
    targetDir: path.join(rootDir, 'assets', 'recipes', 'styles', 'previews'),
  },
];

const inPlaceImageDirs = [
  path.join(rootDir, 'output', 'imagegen'),
  path.join(rootDir, 'output', 'style-audit'),
];

const textFilesToRewrite = [path.join(rootDir, 'docs', 'active', 'style-category-bases-audit.md')];

const pathReplacements = [
  ['components/recipes/defaults/', 'assets/recipes/cards/'],
  ['components/recipes/styles/category-bases/', 'assets/recipes/styles/category-bases/'],
  ['components/recipes/styles/defaults/', 'assets/recipes/styles/defaults/'],
  ['components/recipes/styles/previews/', 'assets/recipes/styles/previews/'],
] as const;

async function exists(targetPath: string) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureParentDir(targetPath: string) {
  await mkdir(path.dirname(targetPath), { recursive: true });
}

async function convertToWebp(sourcePath: string, destinationPath: string) {
  await ensureParentDir(destinationPath);
  await sharp(sourcePath).webp(WEBP_OPTIONS).toFile(destinationPath);

  const destinationStats = await stat(destinationPath).catch(() => null);
  if (!destinationStats || destinationStats.size <= 0) {
    throw new Error(`Failed to create ${destinationPath}`);
  }
}

async function copyAndConvertTree(sourceDir: string, targetDir: string) {
  if (!(await exists(sourceDir))) return { copiedImages: 0, copiedFiles: 0 };

  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  let copiedImages = 0;
  let copiedFiles = 0;

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      const nested = await copyAndConvertTree(sourcePath, targetPath);
      copiedImages += nested.copiedImages;
      copiedFiles += nested.copiedFiles;
      continue;
    }

    if (/\.png$/i.test(entry.name)) {
      const webpTarget = path.join(targetDir, `${path.parse(entry.name).name}.webp`);
      await convertToWebp(sourcePath, webpTarget);
      copiedImages += 1;
      continue;
    }

    await ensureParentDir(targetPath);
    await copyFile(sourcePath, targetPath);
    copiedFiles += 1;
  }

  return { copiedImages, copiedFiles };
}

function rewriteAssetText(content: string) {
  let next = content;
  for (const [from, to] of pathReplacements) {
    next = next.replaceAll(from, to);
  }
  next = next.replace(/\.png\b/g, '.webp');
  return next;
}

async function rewriteTextFile(filePath: string) {
  if (!(await exists(filePath))) return false;

  const original = await readFile(filePath, 'utf8');
  const rewritten = rewriteAssetText(original);
  if (rewritten === original) return false;

  await writeFile(filePath, rewritten, 'utf8');
  return true;
}

async function rewriteTextFilesRecursively(rootPath: string) {
  if (!(await exists(rootPath))) return 0;

  const entries = await readdir(rootPath, { withFileTypes: true });
  let rewrittenCount = 0;

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      rewrittenCount += await rewriteTextFilesRecursively(entryPath);
      continue;
    }

    if (!/\.(json|md|txt)$/i.test(entry.name)) continue;
    if (await rewriteTextFile(entryPath)) {
      rewrittenCount += 1;
    }
  }

  return rewrittenCount;
}

async function convertImagesInPlace(dirPath: string) {
  if (!(await exists(dirPath))) return 0;

  const entries = await readdir(dirPath, { withFileTypes: true });
  let converted = 0;

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      converted += await convertImagesInPlace(entryPath);
      continue;
    }

    if (!/\.png$/i.test(entry.name)) continue;

    const webpPath = path.join(dirPath, `${path.parse(entry.name).name}.webp`);
    await convertToWebp(entryPath, webpPath);
    await rm(entryPath, { force: true });
    converted += 1;
  }

  return converted;
}

let migratedRecipeImages = 0;
let migratedRecipeFiles = 0;
let rewrittenTextFiles = 0;

for (const mapping of recipeAssetMappings) {
  const result = await copyAndConvertTree(mapping.sourceDir, mapping.targetDir);
  migratedRecipeImages += result.copiedImages;
  migratedRecipeFiles += result.copiedFiles;

  rewrittenTextFiles += await rewriteTextFilesRecursively(mapping.targetDir);

  if (await exists(mapping.sourceDir)) {
    await rm(mapping.sourceDir, { recursive: true, force: true });
  }
}

for (const filePath of textFilesToRewrite) {
  if (await rewriteTextFile(filePath)) {
    rewrittenTextFiles += 1;
  }
}

let convertedOutputImages = 0;
for (const dirPath of inPlaceImageDirs) {
  convertedOutputImages += await convertImagesInPlace(dirPath);
}

console.log(
  JSON.stringify(
    {
      migratedRecipeImages,
      migratedRecipeFiles,
      rewrittenTextFiles,
      convertedOutputImages,
    },
    null,
    2,
  ),
);
