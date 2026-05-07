import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Asset, Job, Project } from '../packages/shared/src';
import {
  RECIPE_ASSET_EXTENSION,
  defaultCodexHome,
  defaultStudioLibraryDir,
  recipeCardsDir,
  repoRelative,
  request,
  writeRepoWebpAsset,
} from './style-default-utils';

interface RecipeCardDef {
  id: string;
  title: string;
  fileName: string;
  accentColor: string;
  prompt: string;
}

interface ManifestEntry {
  id: string;
  title: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  generatedAt: string;
}

const manifestPath = path.join(recipeCardsDir, 'manifest.json');
const failuresPath = path.join(recipeCardsDir, 'failures.json');
const libraryDir = process.env.STUDIO_LIBRARY_DIR || defaultStudioLibraryDir;
const parallelArg = process.argv.find((arg) => arg.startsWith('--parallel='));
const parallel = Math.max(1, Number(parallelArg?.split('=')[1] || 4));
const replaceExisting = process.argv.includes('--replace');

const ILLUSTRATION_STYLE_BLOCK = `
GLOBAL ART DIRECTION:
- This must be a simple illustration, not a photoreal image.
- Visual language: restrained poster-like graphic illustration.
- Use only black, an off-white paper tone, and one single accent color assigned to the card.
- Strong black contour lines, flat shapes, minimal shading, and very limited detail.
- Keep the composition calm, neutral, iconic, and readable at card size.
- Avoid busy texture, clutter, realism, collage, or multi-color rendering.
- No realistic UI, no labels, no typography, no watermark.
`.trim();

const RECIPE_CARDS: RecipeCardDef[] = [
  {
    id: 'styles',
    title: 'Styles',
    fileName: `recipe-styles${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'purple',
    prompt: `Generate one default cover image for the STYLES recipe card in a local AI image studio.

RECIPE: STYLES
ROLE: style transfer preset browser cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: purple

Create one simple editorial portrait illustration.
Show one striking adult subject in a clean fashion-forward pose, with a strong silhouette and a few graphic surrounding shapes that suggest style experimentation.
Keep it minimal and elegant, like a design poster for aesthetic transformation.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no UI.`.trim(),
  },
  {
    id: 'remaster',
    title: 'Remaster',
    fileName: `recipe-remaster${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'amber',
    prompt:
      `Generate one default cover image for the REMASTER recipe card in a local AI image studio.

RECIPE: REMASTER
ROLE: image restoration and enhancement cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: amber

Create one simple archival portrait illustration with visible age and restoration potential: faint dust, scratches, paper wear, and slight damage, but still a clearly readable human subject.
The scene should suggest restoration and enhancement without using a before/after split.
Avoid a split before/after layout; this must remain one unified image.
Favor a timeless printed-poster mood with restrained damage cues.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no UI.`.trim(),
  },
  {
    id: 'camera',
    title: 'Camera',
    fileName: `recipe-camera${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'cyan',
    prompt: `Generate one default cover image for the CAMERA recipe card in a local AI image studio.

RECIPE: CAMERA
ROLE: virtual camera guidance cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: cyan

Create a visually clear illustrated subject designed for alternate camera-angle exploration.
Show one human figure or mannequin-like subject in a simple studio setup with a few graphic depth planes that make orbit, elevation, and zoom changes feel plausible.
Favor spatial clarity and readable perspective over decorative clutter.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no UI.`.trim(),
  },
  {
    id: 'cinematic',
    title: 'Cinematic',
    fileName: `recipe-cinematic${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'rose',
    prompt:
      `Generate one default cover image for the CINEMATIC recipe card in a local AI image studio.

RECIPE: CINEMATIC
ROLE: storyboard contact sheet cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: rose

Create a simple vertical storyboard contact sheet made of three or four cinematic panels.
All panels should belong to the same scene with continuity of main character and location.
Use minimal film-language cues: strong blocking, simple shadows, and clear narrative progression.
This should feel like a clean storyboard board, not a detailed comic page.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no interface overlays.`.trim(),
  },
  {
    id: 'timeline',
    title: 'Timeline',
    fileName: `recipe-timeline${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'teal',
    prompt:
      `Generate one default cover image for the TIMELINE recipe card in a local AI image studio.

RECIPE: TIMELINE
ROLE: temporal extrapolation cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: teal

Create a vertical triptych of the same illustrated scene across three closely related moments in time.
Show one central character in a clear situation where cause and effect are easy to imagine, with subtle pose and mood changes across the three beats.
The scene should read as previous moment, anchor moment, next moment without any labels.
Keep the environment consistent while the action and mood progress subtly between frames.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no UI.`.trim(),
  },
  {
    id: 'spritesheet',
    title: 'Sprite Sheet',
    fileName: `recipe-spritesheet${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'emerald',
    prompt:
      `Generate one default cover image for the SPRITE SHEET recipe card in a local AI image studio.

RECIPE: SPRITE SHEET
ROLE: game asset sheet cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: emerald

Create a simple vertical sprite sheet concept for a single original game character.
Use a clean grid layout with a few cells showing consistent poses or action states of the same stylized character.
The character should have a strong readable silhouette, bold costume shapes, game-ready proportions, and a palette that remains consistent across cells.
Make it feel like a clean game-art planning sheet with minimal detail.
Use a quiet neutral sheet background that keeps the cells easy to read.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no UI.`.trim(),
  },
  {
    id: 'character',
    title: 'Character',
    fileName: `recipe-character${RECIPE_ASSET_EXTENSION}`,
    accentColor: 'indigo',
    prompt:
      `Generate one default cover image for the CHARACTER recipe card in a local AI image studio.

RECIPE: CHARACTER
ROLE: character sheet designer cover

${ILLUSTRATION_STYLE_BLOCK}
CARD COLOR: indigo

Create a simple character design sheet for one original protagonist.
Show a clean turnaround-oriented presentation with multiple consistent views of the same character, plus one closer portrait or expression panel.
The design should feel clear and organized, with coherent costume language and readable anatomy.
Favor a calm entertainment-design poster look.

Portrait orientation, 2:3 vertical composition, designed for a 3:4 card crop.
No text, no logos, no watermark, no UI labels.`.trim(),
  },
];

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupExternalJobArtifacts(jobId: string, sourceAssetPath: string) {
  const transcriptPath = path.join(libraryDir, 'transcripts', jobId, 'events.jsonl');
  const codexHome = process.env.CODEX_HOME || defaultCodexHome;
  const transcript = await readFile(transcriptPath, 'utf8').catch(() => '');
  for (const line of transcript.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as any;
      const item = event.params?.item;
      if (item?.type !== 'imageGeneration' || !item.id || !event.params?.threadId) continue;
      await rm(path.join(codexHome, 'generated_images', event.params.threadId, `${item.id}.png`), {
        force: true,
      }).catch(() => {});
    } catch {
      // Best-effort cleanup.
    }
  }
  await rm(sourceAssetPath, { force: true }).catch(() => {});
  await rm(path.join(libraryDir, 'transcripts', jobId), { recursive: true, force: true }).catch(
    () => {},
  );
}

async function waitForJob(jobId: string) {
  while (true) {
    const jobs = await request<Job[]>('/api/jobs');
    const job = jobs.find((candidate) => candidate.id === jobId);
    if (!job) throw new Error(`Job ${jobId} disappeared from /api/jobs`);
    if (job.status === 'completed') return job;
    if (job.status === 'failed' || job.status === 'cancelled' || job.status === 'needs_review') {
      throw new Error(`Job ${jobId} ended as ${job.status}: ${job.error || 'no error'}`);
    }
    await Bun.sleep(2000);
  }
}

async function newestAssetForJob(jobId: string) {
  const assets = await request<Asset[]>('/api/assets');
  return assets.find((asset) => asset.jobId === jobId);
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8')) as ManifestEntry[];
  } catch {
    return [];
  }
}

async function saveManifest(entries: ManifestEntry[]) {
  entries.sort((a, b) => a.id.localeCompare(b.id));
  await writeFile(manifestPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

async function loadFailures() {
  try {
    return JSON.parse(await readFile(failuresPath, 'utf8')) as unknown[];
  } catch {
    return [];
  }
}

async function saveFailure(entry: unknown) {
  const failures = await loadFailures();
  failures.push(entry);
  await writeFile(failuresPath, `${JSON.stringify(failures, null, 2)}\n`, 'utf8');
}

async function generateOne(
  projectId: string,
  recipe: RecipeCardDef,
  manifestById: Map<string, ManifestEntry>,
) {
  const destination = path.join(recipeCardsDir, recipe.fileName);
  if (!replaceExisting && (await exists(destination))) {
    console.log(`[skip] ${recipe.id}`);
    return 'skipped';
  }

  console.log(`[recipe-card] ${recipe.id}`);
  const created = await request<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      kind: 'codex_imagegen',
      prompt: recipe.prompt,
    }),
  });

  await waitForJob(created.id);
  const asset = await newestAssetForJob(created.id);
  if (!asset) throw new Error(`Completed job ${created.id} has no asset in /api/assets`);

  await writeRepoWebpAsset(asset.filePath, destination);
  await cleanupExternalJobArtifacts(created.id, asset.filePath);

  const repoFile = repoRelative(destination);
  manifestById.set(recipe.id, {
    id: recipe.id,
    title: recipe.title,
    file: repoFile,
    jobId: created.id,
    sourceAsset: repoFile,
    generatedAt: new Date().toISOString(),
  });
  await saveManifest(Array.from(manifestById.values()));
  return 'generated';
}

await mkdir(recipeCardsDir, { recursive: true });
const health = await request<{ ok: boolean }>('/api/health');
if (!health.ok) throw new Error('Local studio server is not healthy.');

const projects = await request<Project[]>('/api/projects');
const projectId = projects[0]?.id;
if (!projectId) throw new Error('No default project available.');

const manifestById = new Map((await loadManifest()).map((entry) => [entry.id, entry]));
const queue = [...RECIPE_CARDS];
let generated = 0;
let skipped = 0;
let failed = 0;

async function worker() {
  while (queue.length > 0) {
    const recipe = queue.shift();
    if (!recipe) return;
    try {
      const result = await generateOne(projectId, recipe, manifestById);
      if (result === 'generated') generated += 1;
      if (result === 'skipped') skipped += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[recipe-card-failed] ${recipe.id}: ${message}`);
      await saveFailure({
        id: recipe.id,
        title: recipe.title,
        error: message,
        failedAt: new Date().toISOString(),
      });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(parallel, RECIPE_CARDS.length) }, () => worker()));

console.log(
  `[done] generated=${generated} skipped=${skipped} failed=${failed} total=${RECIPE_CARDS.length}`,
);
