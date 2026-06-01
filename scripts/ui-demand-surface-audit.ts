import { readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultRootDir = process.cwd();

export interface UiDemandSurfaceRule {
  id: string;
  filePath: string;
  forbidden: string[];
  message: string;
}

export interface UiDemandSurfaceViolation {
  ruleId: string;
  filePath: string;
  forbidden: string;
  message: string;
}

export interface UiDemandSurfaceAuditReport {
  scannedRules: number;
  violations: UiDemandSurfaceViolation[];
}

export const uiDemandSurfaceRules: UiDemandSurfaceRule[] = [
  {
    id: 'prod-entry-no-static-react-scan',
    filePath: 'main.tsx',
    forbidden: ["import { scan } from 'react-scan'", 'from "react-scan"'],
    message: 'react-scan must stay DEV-only through dynamic import.',
  },
  {
    id: 'zip-export-no-static-vendors',
    filePath: 'utils/fileUtils.ts',
    forbidden: ["from 'jszip'", 'from "jszip"', "from 'file-saver'", 'from "file-saver"'],
    message: 'ZIP/export vendors must load only inside downloadMultipleImagesAsZip().',
  },
  {
    id: 'camera-no-static-three',
    filePath: 'hooks/useCameraViewport.ts',
    forbidden: ["import * as THREE from 'three'", 'from "three";'],
    message: 'Three.js must stay demand-loaded by the Camera viewport.',
  },
  {
    id: 'catalog-search-no-static-catalog-data',
    filePath: 'components/recipes/StylePresetCatalogSearchSurface.tsx',
    forbidden: ["from './stylePresetCatalogData'", 'from "./stylePresetCatalogData"'],
    message: 'Catalog data glob must load after the user opens catalog search.',
  },
  {
    id: 'catalog-data-no-static-yaml-parser',
    filePath: 'components/recipes/stylePresetCatalogData.ts',
    forbidden: ["import yaml from 'js-yaml'", 'from "js-yaml"'],
    message: 'YAML parser must load only while parsing catalog manifests.',
  },
  {
    id: 'viewport-no-static-route-pages',
    filePath: 'components/shell/StudioViewport.tsx',
    forbidden: [
      "import { StudioPage } from '../StudioPage'",
      'import { StudioPage } from "../StudioPage"',
      "import { RecipesView } from '../RecipesView'",
      'import { RecipesView } from "../RecipesView"',
      "import { RecipePage } from '../RecipePage'",
      'import { RecipePage } from "../RecipePage"',
    ],
    message: 'Studio route pages must stay lazy-loaded from the viewport shell.',
  },
];

async function readRepoFile(rootDir: string, repoPath: string) {
  return readFile(path.join(rootDir, repoPath), 'utf8');
}

export async function createUiDemandSurfaceAuditReport(
  rootDir = defaultRootDir,
): Promise<UiDemandSurfaceAuditReport> {
  const violations: UiDemandSurfaceViolation[] = [];

  for (const rule of uiDemandSurfaceRules) {
    const source = await readRepoFile(rootDir, rule.filePath);
    for (const forbidden of rule.forbidden) {
      if (source.includes(forbidden)) {
        violations.push({
          ruleId: rule.id,
          filePath: rule.filePath,
          forbidden,
          message: rule.message,
        });
      }
    }
  }

  return {
    scannedRules: uiDemandSurfaceRules.length,
    violations,
  };
}

if (import.meta.main) {
  const report = await createUiDemandSurfaceAuditReport();
  console.log(`[ui:source] rules=${report.scannedRules} violations=${report.violations.length}`);

  for (const violation of report.violations) {
    console.error(
      `- ${violation.filePath} rule=${violation.ruleId} forbidden=${JSON.stringify(violation.forbidden)} ${violation.message}`,
    );
  }

  if (report.violations.length > 0) {
    console.error('[ui:source] failed');
    process.exitCode = 1;
  } else {
    console.log('[ui:source] ok');
  }
}
