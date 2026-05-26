import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();

const recipeSurfaceDirs = ['components/recipes', 'components'] as const;

const recipeSurfaceFiles = new Set(['components/RecipesView.tsx', 'components/RecipeRouter.tsx']);

const allowedRecipeSupportFiles = new Set([
  'components/recipes/recipeModuleUi.ts',
  'components/recipes/recipeModuleUi.test.ts',
]);

const forbiddenMarkers = [
  'buildRecipeContext',
  'buildGenerationTaskSpecFromRecipe',
  'createGenerationTaskSpec',
  'buildRecipeProviderDirectives',
  'recipeContextBuilders',
  'providerInputCompiler',
  'Recipe Provider Directives',
] as const;

export interface RecipeModuleSourceAuditUsage {
  filePath: string;
  markers: string[];
}

export interface RecipeModuleSourceAuditReport {
  scannedFiles: number;
  violations: RecipeModuleSourceAuditUsage[];
}

function toRepoPath(rootDir: string, filePath: string) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function isRecipeSurface(repoPath: string) {
  if (!/\.(ts|tsx)$/.test(repoPath)) return false;
  if (allowedRecipeSupportFiles.has(repoPath)) return false;
  if (recipeSurfaceFiles.has(repoPath)) return true;
  return repoPath.startsWith('components/recipes/');
}

async function listSourceFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const repoPath = toRepoPath(rootDir, absolutePath);
    if (entry.isDirectory()) {
      if (!recipeSurfaceDirs.some((dir) => repoPath === dir || dir.startsWith(`${repoPath}/`))) {
        continue;
      }
      files.push(...(await listSourceFiles(rootDir, absolutePath)));
      continue;
    }
    if (entry.isFile() && isRecipeSurface(repoPath)) {
      files.push(absolutePath);
    }
  }

  return files;
}

export async function createRecipeModuleSourceAuditReport(
  rootDir = defaultRootDir,
): Promise<RecipeModuleSourceAuditReport> {
  const files = await listSourceFiles(rootDir);
  const violations: RecipeModuleSourceAuditUsage[] = [];

  for (const absolutePath of files) {
    const repoPath = toRepoPath(rootDir, absolutePath);
    const source = await readFile(absolutePath, 'utf8');
    const markers = forbiddenMarkers.filter((marker) => source.includes(marker));
    if (markers.length > 0) {
      violations.push({ filePath: repoPath, markers: [...markers] });
    }
  }

  return {
    scannedFiles: files.length,
    violations,
  };
}

if (import.meta.main) {
  const report = await createRecipeModuleSourceAuditReport();

  console.log(
    `[recipes:source] scanned=${report.scannedFiles} violations=${report.violations.length}`,
  );
  for (const violation of report.violations) {
    console.error(`- ${violation.filePath} markers=${violation.markers.join(',')}`);
  }

  if (report.violations.length > 0) {
    console.error(
      '[recipes:source] Recipe surfaces must collect UI params only. Move task specs, contexts, provider directives, and provider compilers into Recipe Modules/lib providers.',
    );
    process.exitCode = 1;
  } else {
    console.log('[recipes:source] ok');
  }
}
