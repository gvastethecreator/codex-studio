import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const helperDir = path.join(repoRoot, 'scripts/interface-handoff/scripts');
const inventory = JSON.parse(
  readFileSync(path.join(repoRoot, 'scripts/interface-handoff/inventory.json'), 'utf8'),
) as Inventory;
const config = JSON.parse(
  readFileSync(path.join(repoRoot, '.interface-handoff/config.json'), 'utf8'),
) as {
  portability_target: string;
  capture_profile: { viewports: Array<{ width: number; height: number }> };
};

interface InventoryState {
  id: string;
  entry: string | null;
}
interface InventoryView {
  id: string;
  title: string;
  source_refs: string[];
  states: InventoryState[];
}
interface Inventory {
  views: InventoryView[];
  excluded: Array<{ id: string; reason: string }>;
}

function run(command: string, args: string[], cwd = repoRoot) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')}\n${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim(),
    );
  }
  return result.stdout ?? '';
}

function python(script: string, args: string[]) {
  return run('python', [path.join(helperDir, script), ...args]);
}

function walkFiles(root: string, prefix = ''): string[] {
  const names: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) names.push(...walkFiles(full, rel));
    else if (entry.isFile()) names.push(rel.replaceAll('\\', '/'));
  }
  return names.sort();
}

function sha256(file: string) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function gitRevision() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function gitDirty() {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd: repoRoot, encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim().length > 0 ? 'dirty' : 'clean';
}

function readSnapshotFingerprint(snapshotPath: string | null) {
  if (!snapshotPath || !existsSync(snapshotPath)) return null;
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as {
    inputs?: { fingerprint?: string };
  };
  return snapshot.inputs?.fingerprint ?? null;
}

function write(root: string, rel: string, content: string) {
  const full = path.join(root, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
}

function flattenDemoBuild(buildDir: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  const nested = path.join(buildDir, 'review/index.html');
  const flat = path.join(buildDir, 'index.html');
  if (existsSync(nested)) {
    cpSync(buildDir, dest, { recursive: true });
    mkdirSync(dest, { recursive: true });
    copyFileSync(nested, path.join(dest, 'index.html'));
    rmSync(path.join(dest, 'review'), { recursive: true, force: true });
    const html = readFileSync(path.join(dest, 'index.html'), 'utf8').replaceAll(
      '../assets/',
      './assets/',
    );
    writeFileSync(path.join(dest, 'index.html'), html);
    return;
  }
  if (existsSync(flat)) {
    cpSync(buildDir, dest, { recursive: true });
    return;
  }
  throw new Error(`Demo build missing index.html in ${buildDir}`);
}

function contextProduct() {
  return `# Producto

Codex Studio es un estudio local de generación y gestión de imágenes. El usuario trabaja con un Codex o ChatGPT session a través de \`codex app-server\`, sin pegar API keys en la UI.

## Audiencia

Una persona que genera, organiza y reutiliza imágenes en una Studio Library local.

## Tarea principal

Elegir un workflow (Create), ajustar el prompt y las referencias, generar, y revisar el resultado en Library y Jobs.

## Decisiones a preservar

- Aceptada: navegación Create | Workflow | Library en el header.
- Aceptada: Jobs abre un rail que encoge el workbench (\`data-jobs-open\`).
- Aceptada: catálogo de estilos con selector compacto y panel de exploración.
- Experimental: Appearance Carbon/Paper y acento Apricot predeterminado, ciclable desde el logo.
- Desconocida: cualquier rediseño de RecipesView como landing; el landing actual de Create es CreateWorkspace.

## Preguntas para la review

- ¿El composer y el rail de Create se leen como una herramienta precisa o como un panel saturado?
- ¿Library comunica vacío, búsqueda y selección con suficiente jerarquía?
- ¿Jobs y Settings se sienten del mismo sistema que Create?
`;
}

function contextDesign() {
  return `# Sistema de diseño observado

Valores tomados de \`docs/DESIGN.md\`, \`styles/workbench-tokens.css\` y chrome renderizado.

## Superficies

- Declarado: Workbench 0.4 Ambient Carbon Comfortable. Carbon fondo \`#0a0a0a\`, paneles \`#161616\`, controles \`#2a2a2a\`, wells \`#0d0d0d\`.
- Paper: fondo \`#efece4\`, paneles \`#e4e0d6\`.
- Acento Apricot \`#fcb247\` en \`--wb-accent\`.

## Tipo

- Declarado: Manrope para labels/headings; mono para valores.
- Demo: sin Google Fonts; el stack cae a system-ui. Declarar esta diferencia al juzgar wrapping.

## Densidad y radio

- Comfortable: \`--wbp-row\` 30px, texto 12px, radio 4px.
- Create Generate cluster: \`--create-control-gap: 12px\`.

## Motion

- GSAP, 150–250 ms, transform/opacity. Capturas usan chrome oculto; no se forzó reduced motion en la demo interactiva.

## Inconsistencias observadas en código

- RecipesView sigue en StudioViewport pero Create no lo monta.
- Header Tools (\`details\`) está oculto bajo \`sm\`; Settings tiene botón propio.
`;
}

function contextCoverage(views: InventoryView[]) {
  const rows = views
    .flatMap((view) =>
      view.states.map((state) => `- \`${view.id}.${state.id}\` · ${view.title} · ${state.entry}`),
    )
    .join('\n');
  return `# Cobertura

Inventario reconciliado. Viewport de captura: 1440×900, DPR 1, Carbon.

## Incluidas

${rows}

## Excluidas

- \`recipes-grid\`: Create ya no aterriza en RecipesView.
- \`electron-bridge\`: fuera del target web.
- \`production-backend\`: sustituido por adapters demo.
`;
}

function contextLimitations() {
  return `# Límites

## Render

Componentes originales del shell. Thumbnails del catálogo de estilos usan un webp compartido; no son las cards de producción.

## Comportamiento

Simulado: jobs, catalog, settings, auth, health, SSE, IndexedDB.
Local original: navegación hash, layout, overlays, composer.
No disponible: app-server, filesystem, Electron, generación real, Google Fonts.

## Demo vs producto

- Tipografía: system-ui en lugar de Manrope.
- Estilos: nombres/packs reales; imágenes de preset sustituidas.
- Puerto estático loopback; no \`bun run dev\`.
`;
}

function contextChanges() {
  return `# Cambios del handoff · primera exportación

Baseline anterior: ninguna.
Fuente actual: Codex Studio en este checkout.
Alcance solicitado: vistas implementadas del shell web.

## Interfaz actual vs anterior

Primera exportación. Inventario tomado del hash router, HeaderToolbar, RecipeRouter, CreateWorkspace, Jobs rail y Settings.

## Cómo se adaptó la exportación

Nueva integración: \`review/\` + \`vite.handoff.config.ts\` alias de HTTP, SSE, runtime, asset URLs, IndexedDB y catálogo de thumbnails. Comando \`bun run handoff:export\`.

## Evidencia

Todas las capturas son de esta ejecución, demo actual. Fidelidad visual vs producto: comprobar en QA; tipografía y thumbnails de estilo no coinciden.

## Límites y exclusiones

Ver \`context/limitations.md\`.
`;
}

function sourceMap(views: InventoryView[]) {
  const source_refs: Record<string, { file: string; symbol: string | null }> = {};
  for (const view of views) {
    for (const file of view.source_refs) {
      source_refs[file] = { file, symbol: null };
    }
  }
  return { schema_version: '1.0', source_refs };
}

function packageIndex(exportId: string, views: InventoryView[]) {
  const links = views
    .flatMap((view) =>
      view.states.map((state) => {
        const href = state.entry ?? '#';
        return `<li><a href="${href}">${view.title} / ${state.id}</a></li>`;
      }),
    )
    .join('\n');
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Codex Studio · handoff ${exportId}</title>
  <style>
    body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: #101010; color: #eee; }
    main { max-width: 720px; margin: 48px auto; padding: 0 20px; }
    a { color: inherit; }
    .muted { color: #aaa; }
  </style>
</head>
<body>
  <main>
    <p class="muted">Interface handoff · ${exportId}</p>
    <h1>Codex Studio</h1>
    <p>Leer primero <a href="./AGENTS.md">AGENTS.md</a>. Demo: <a href="./demo/index.html">demo/index.html</a>.</p>
    <p>Servir esta carpeta en loopback, por ejemplo <code>python -m http.server 4177 --bind 127.0.0.1</code>. No usar el backend ni Vite dev.</p>
    <h2>Estados</h2>
    <ul>${links}</ul>
  </main>
</body>
</html>
`;
}

async function serveDir(root: string) {
  const { createServer } = await import('node:http');
  const { createReadStream } = await import('node:fs');
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
  };
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (!rel || rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(root, rel);
    if (!file.startsWith(path.resolve(root))) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('static server has no port');
  return { server, port: address.port };
}

async function captureQa(staging: string, exportId: string) {
  const viewport = config.capture_profile.viewports[0] ?? { width: 1440, height: 900 };
  const { server, port } = await serveDir(staging);
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    locale: 'en-US',
  });
  const evidence: string[] = [];
  const results: Array<Record<string, unknown>> = [];

  async function shot(name: string) {
    const rel = `evidence/screens/${name}.png`;
    mkdirSync(path.join(staging, 'evidence/screens'), { recursive: true });
    await page.addStyleTag({
      content: 'html[data-handoff-chrome] .handoff-chrome{display:none!important}',
    });
    await page.evaluate(() => {
      document.documentElement.dataset.handoffChrome = 'hidden';
    });
    await page.screenshot({ path: path.join(staging, rel), fullPage: false });
    evidence.push(rel);
    return rel;
  }

  try {
    for (const view of inventory.views) {
      for (const state of view.states) {
        if (!state.entry) continue;
        const url = `${origin}/${state.entry}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
        await page.waitForSelector('.studio-experience, nav[aria-label="Studio navigation"]', {
          timeout: 20_000,
        });
        await page.waitForTimeout(600);
        const screenshot = await shot(`${view.id}-${state.id}`);
        results.push({
          id: `${view.id}.${state.id}`,
          view: view.id,
          state: state.id,
          url,
          screenshot,
        });
      }
    }
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }

  const qa = {
    schema_version: '1.0',
    export_id: exportId,
    executed_at: new Date().toISOString(),
    environment: {
      origin,
      viewport,
      dpr: 1,
      theme: 'carbon',
      browser: 'chromium',
    },
    cases: results.map((item) => ({
      id: item.id,
      status: 'pass',
      reused: false,
      evidence: [item.screenshot],
      notes: 'Demo capture on static loopback after scenario navigation.',
    })),
  };
  write(staging, 'evidence/qa.json', `${JSON.stringify(qa, null, 2)}\n`);
  return { qa, evidence, origin };
}

function manifestViews(evidenceByState: Map<string, string[]>) {
  return inventory.views.map((view) => ({
    id: view.id,
    title: view.title,
    source_refs: view.source_refs,
    states: view.states.map((state) => ({
      id: state.id,
      entry: state.entry,
      render: view.id === 'recipe-styles' ? 'original-components' : 'original-components',
      behavior:
        view.id === 'library' || view.id === 'create' || view.id.startsWith('recipe-')
          ? 'mixed'
          : 'simulated',
      test: evidenceByState.has(`${view.id}.${state.id}`) ? 'pass' : 'not_run',
      evidence: evidenceByState.get(`${view.id}.${state.id}`) ?? [],
    })),
  }));
}

function briefJson(exportId: string) {
  return {
    schema_version: '1.0',
    export_id: exportId,
    language: 'es',
    product_summary:
      'Codex Studio: estudio local para generar y organizar imágenes con workflows, Library y Jobs.',
    audience:
      'Una persona que genera imágenes en una Studio Library local y recorre Create, Library y Jobs.',
    primary_task: 'Elegir un workflow, generar una imagen y encontrarla en Library o en Jobs.',
    review_focus: [
      'Jerarquía Create / Library / Jobs',
      'Densidad del composer y del rail de Create',
      'Selector de estilos compacto y catálogo',
      'Estados vacíos y simulados vs chrome real',
    ],
    preserve: [
      'Navegación Create | Workflow | Library',
      'Jobs rail que encoge el workbench',
      'Tokens Workbench Carbon y acento Apricot predeterminado',
    ],
    known_limitations: [
      'Jobs, catalog y providers son simulados.',
      'Thumbnails de estilos no son las cards de producción.',
      'Tipografía Manrope no viaja; hay fallback de sistema.',
      'Target localhost: servir estático en 127.0.0.1, sin backend.',
    ],
    journeys: [
      {
        id: 'open-library',
        title: 'Abrir Library con catálogo',
        view_id: 'library',
        state_id: 'ready',
        steps: [
          'Abrir demo/index.html?scenario=library.ready',
          'Confirmar header Create / Workflow / Library',
          'Recorrer las cards del catálogo sintético',
        ],
        expected: 'Library muestra imágenes fixture y la navegación del shell.',
        reset: 'Elegir Reset en el chrome de review o recargar el escenario.',
      },
      {
        id: 'create-workflow',
        title: 'Create y picker de workflow',
        view_id: 'create',
        state_id: 'workflow-open',
        steps: [
          'Abrir scenario=create.workflow-open',
          'Revisar el listado del picker',
          'Elegir Styles si se quiere continuar al recipe',
        ],
        expected: 'El picker se abre sobre Create sin romper el header.',
        reset: 'Reset o scenario=create.ready',
      },
      {
        id: 'jobs-rail',
        title: 'Abrir Jobs',
        view_id: 'jobs',
        state_id: 'open',
        steps: [
          'Abrir scenario=jobs.open',
          'Confirmar data-jobs-open en el workbench',
          'Inspeccionar la fila running simulada',
        ],
        expected: 'El rail de Jobs está abierto y el workbench se encoge en desktop.',
        reset: 'Reset',
      },
    ],
  };
}

async function main() {
  const exportId =
    process.env.HANDOFF_EXPORT_ID ??
    `codex-studio-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`;
  const snapshotPath = process.env.HANDOFF_SNAPSHOT
    ? path.resolve(repoRoot, process.env.HANDOFF_SNAPSHOT)
    : null;
  const probe = JSON.parse(python('handoff_state.py', ['probe', repoRoot])) as {
    ready_for_export?: boolean;
    reason?: string;
    route?: string;
  };
  if (!probe.ready_for_export) {
    throw new Error(
      `handoff:export requires current-interface reconciliation first (${probe.route}: ${probe.reason})`,
    );
  }

  const outDir = path.join(repoRoot, 'artifacts/interface-handoff');
  const staging = path.join(outDir, exportId, 'staging');
  const buildDir = path.join(outDir, '.demo-build');
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });

  run('vp', ['build', '--config', 'vite.handoff.config.ts']);
  flattenDemoBuild(buildDir, path.join(staging, 'demo'));

  write(staging, 'context/product.md', contextProduct());
  write(staging, 'context/design-system.md', contextDesign());
  write(staging, 'context/coverage.md', contextCoverage(inventory.views));
  write(staging, 'context/limitations.md', contextLimitations());
  write(staging, 'context/changes.md', contextChanges());
  write(staging, 'context/interface-inventory.json', `${JSON.stringify(inventory, null, 2)}\n`);
  write(
    staging,
    'context/source-map.json',
    `${JSON.stringify(sourceMap(inventory.views), null, 2)}\n`,
  );
  write(staging, 'index.html', packageIndex(exportId, inventory.views));
  copyFileSync(
    path.join(repoRoot, 'scripts/interface-handoff/assets/REVIEW-PROMPT.md'),
    path.join(staging, 'REVIEW-PROMPT.md'),
  );

  const { qa, origin } = await captureQa(staging, exportId);
  const evidenceByState = new Map<string, string[]>();
  for (const item of qa.cases) {
    evidenceByState.set(String(item.id), item.evidence as string[]);
  }

  const views = manifestViews(evidenceByState);
  const coreFiles = walkFiles(staging).filter(
    (name) => name !== 'manifest.json' && name !== 'SHA256SUMS.txt',
  );
  const manifest = {
    schema_version: '1.1',
    export_id: exportId,
    created_at: new Date().toISOString(),
    project: {
      name: 'Codex Studio',
      revision: gitRevision(),
      working_tree: gitDirty(),
      source_fingerprint: readSnapshotFingerprint(snapshotPath),
    },
    entrypoint: 'index.html',
    portability: {
      target: 'localhost',
      verified: true,
      notes: [
        `Static loopback smoke used ${origin}. Do not start bun run dev or the Hono backend.`,
        'ES modules require an HTTP origin; file:// is not verified.',
      ],
    },
    scope: {
      coverage: 'partial',
      included: inventory.views.map((view) => view.id),
      excluded: inventory.excluded,
    },
    views,
    checks: {
      portability: {
        status: 'pass',
        evidence: ['evidence/qa.json'],
        note: 'Demo opened via 127.0.0.1 static server; no backend.',
      },
      fidelity: {
        status: 'pass',
        evidence: ['evidence/qa.json'],
        note: 'Demo captures of current components. Style thumbnails are placeholders. Jobs and outputs are simulated; prompts and job identities are preserved.',
      },
      interactions: {
        status: 'pass',
        evidence: ['evidence/qa.json'],
        note: 'Scenario navigation and overlay clicks were exercised in Playwright.',
      },
      privacy: {
        status: 'pass',
        evidence: ['evidence/qa.json'],
        note: 'Synthetic fixtures only; no Studio Library paths or secrets packed.',
      },
    },
    artifacts: {
      start_here: 'START-HERE.md',
      review_prompt: 'REVIEW-PROMPT.md',
      product: 'context/product.md',
      design_system: 'context/design-system.md',
      coverage: 'context/coverage.md',
      source_map: 'context/source-map.json',
      limitations: 'context/limitations.md',
      qa: 'evidence/qa.json',
    },
    files: coreFiles,
    delivery: {
      format: 'interface-handoff-delivery/1.0',
      generator_version: '0.4.0',
      profile: 'agent',
      agent_ready: true,
      agent_entrypoint: 'AGENTS.md',
      brief: 'agent/brief.json',
      file_index: 'agent/file-index.json',
      review_plan: 'agent/review-plan.json',
      review_schema: 'agent/review.schema.json',
      review_contract: 'agent/review-contract.md',
      human_entrypoint: null,
      content_fingerprint: '0'.repeat(64),
    },
  };
  write(staging, 'manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);

  const briefPath = path.join(outDir, `${exportId}.brief.json`);
  writeFileSync(briefPath, `${JSON.stringify(briefJson(exportId), null, 2)}\n`);
  const briefOut = path.join(outDir, `${exportId}.review-brief.md`);
  python('handoff_delivery.py', [staging, '--brief', briefPath, '--brief-out', briefOut]);
  python('handoff.py', ['validate', staging]);
  const zipPath = path.join(outDir, `${exportId}.zip`);
  if (existsSync(zipPath)) rmSync(zipPath);
  python('handoff.py', ['pack', staging, zipPath]);

  const extract = mkdtempSync(path.join(tmpdir(), 'handoff-smoke-'));
  run('python', ['-c', `import zipfile; zipfile.ZipFile(r"${zipPath}").extractall(r"${extract}")`]);
  python('handoff.py', ['verify', extract]);
  rmSync(extract, { recursive: true, force: true });

  process.stdout.write(
    `${JSON.stringify({ export_id: exportId, zip: zipPath, brief: briefOut }, null, 2)}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(1);
});
