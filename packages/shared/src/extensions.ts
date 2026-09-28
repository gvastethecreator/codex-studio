// Cozy Extensions (ADR 0011): versioned declarative content packages. An extension holds data
// files and images only, never code that Studio runs.

export const EXTENSION_SCHEMA_VERSION = 1 as const;
export const EXTENSION_MANIFEST_FILE = 'extension.json' as const;
export const EXTENSION_KINDS = ['style-pack'] as const;

export type ExtensionKind = (typeof EXTENSION_KINDS)[number];

/** Compiled files of a style-pack extension, relative to its root. */
export interface StylePackExtensionFiles {
  pack: string;
  runtime: string;
  search: string;
  thumbnails: string;
  /** Retired presets kept so old favorites still resolve; only packs that retired presets. */
  archived?: string;
  /** Cover, description and sample cards shown before a pack is opened or installed. */
  preview?: string;
}

/** A downloadable part of an extension, such as full-size cards, verified by sha256. */
export interface ExtensionAsset {
  name: string;
  optional: boolean;
  sha256: string;
  bytes: number;
}

/** What a style-pack extension shows in the catalogue before its files load. */
export interface StylePackSummary {
  /** Style pack id used by preset manifests, such as `pack_14`. */
  id: string;
  name: string;
  description: string;
  cardTitle?: string;
  cardDescription?: string;
  presetCount: number;
  /** Style browser landing data this pack contributes; Studio sums it across installed packs. */
  landing?: StylePackLanding;
  /**
   * Presets copied from other packs, such as Essentials, keyed by the copy's preset id. Studio
   * hides a copy while its source pack is installed.
   */
  copiedFrom?: Record<string, StylePresetSource>;
}

export interface StylePresetSource {
  packId: string;
  presetId: string;
}

export interface StylePackLandingFolder {
  presetCount: number;
  /** Thumbnail keys, best first. */
  imageKeys: string[];
}

export interface StylePackLanding {
  /** Images for the pack's own landing folder. */
  imageKeys: string[];
  /** This pack's share of each style collection, by collection id. */
  collections: Record<string, StylePackLandingFolder>;
}

export interface ExtensionManifest {
  schemaVersion: typeof EXTENSION_SCHEMA_VERSION;
  /** `publisher.name`, lowercase. Preset global ids are `<id>/<presetId>`. */
  id: string;
  kind: ExtensionKind;
  version: string;
  /** Compatible Studio versions, as a semver range. */
  studio: string;
  title: string;
  files: StylePackExtensionFiles;
  stylePack: StylePackSummary;
  assets: ExtensionAsset[];
}

export type ExtensionManifestParseResult =
  | { ok: true; manifest: ExtensionManifest }
  | { ok: false; issues: string[] };

const EXTENSION_ID_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const STYLE_PACK_FILE_KEYS = ['pack', 'runtime', 'search', 'thumbnails'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeRelativePath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.includes('\\') &&
    !value.split('/').includes('..')
  );
}

/**
 * `index.json` on the default branch of an Extension Source. `archive` names a zip asset of
 * the GitHub release `tag`; the zip holds the extension root.
 */
/** Optional download layers of an extension; `cards` holds the full-quality style cards. */
export const EXTENSION_LAYERS = ['cards'] as const;
export type ExtensionLayerName = (typeof EXTENSION_LAYERS)[number];

/** A zip release asset that extracts into `<extension root>/<name>/`. */
export interface ExtensionReleaseLayer {
  name: ExtensionLayerName;
  archive: string;
  sha256: string;
  bytes: number;
}

export interface ExtensionReleaseEntry {
  id: string;
  version: string;
  title: string;
  tag: string;
  archive: string;
  sha256: string;
  bytes: number;
  layers?: ExtensionReleaseLayer[];
  /** Small zip with the pack's preview.json and the images it names, for browsing before install. */
  preview?: ExtensionReleaseAsset;
}

export interface ExtensionReleaseAsset {
  archive: string;
  sha256: string;
  bytes: number;
}

/** preview.json: what the pack browser shows. Image paths are relative to the preview root. */
export interface StylePackPreview {
  schemaVersion: 1;
  title: string;
  description: string;
  presetCount: number;
  categories: { name: string; presetCount: number }[];
  cover: string | null;
  samples: { presetId: string; name: string; image: string }[];
}

export function parseStylePackPreview(value: unknown): StylePackPreview | null {
  if (!isRecord(value) || value.schemaVersion !== 1) return null;
  const { title, description, presetCount, categories, cover, samples } = value;
  if (
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    typeof presetCount !== 'number' ||
    !Array.isArray(categories) ||
    !categories.every(
      (category) =>
        isRecord(category) &&
        typeof category.name === 'string' &&
        typeof category.presetCount === 'number',
    ) ||
    !(cover === null || isSafeRelativePath(cover)) ||
    !Array.isArray(samples) ||
    !samples.every(
      (sample) =>
        isRecord(sample) &&
        typeof sample.presetId === 'string' &&
        typeof sample.name === 'string' &&
        isSafeRelativePath(sample.image),
    )
  )
    return null;
  return value as unknown as StylePackPreview;
}

function isReleaseAsset(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.archive === 'string' &&
    value.archive.endsWith('.zip') &&
    !value.archive.includes('/') &&
    typeof value.sha256 === 'string' &&
    SHA256_PATTERN.test(value.sha256) &&
    typeof value.bytes === 'number' &&
    Number.isInteger(value.bytes) &&
    value.bytes > 0
  );
}

export interface ExtensionReleaseIndex {
  schemaVersion: typeof EXTENSION_SCHEMA_VERSION;
  extensions: ExtensionReleaseEntry[];
}

export type ExtensionReleaseIndexParseResult =
  | { ok: true; index: ExtensionReleaseIndex }
  | { ok: false; issues: string[] };

export function parseExtensionReleaseIndex(value: unknown): ExtensionReleaseIndexParseResult {
  if (!isRecord(value)) return { ok: false, issues: ['index.json must be an object'] };
  if (value.schemaVersion !== EXTENSION_SCHEMA_VERSION)
    return { ok: false, issues: ['unsupported schemaVersion'] };
  if (!Array.isArray(value.extensions))
    return { ok: false, issues: ['extensions must be an array'] };
  const issues: string[] = [];
  value.extensions.forEach((entry, index) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      !EXTENSION_ID_PATTERN.test(entry.id) ||
      typeof entry.version !== 'string' ||
      !SEMVER_PATTERN.test(entry.version) ||
      typeof entry.title !== 'string' ||
      typeof entry.tag !== 'string' ||
      entry.tag === '' ||
      typeof entry.archive !== 'string' ||
      !entry.archive.endsWith('.zip') ||
      entry.archive.includes('/') ||
      typeof entry.sha256 !== 'string' ||
      !SHA256_PATTERN.test(entry.sha256) ||
      typeof entry.bytes !== 'number' ||
      !Number.isInteger(entry.bytes) ||
      entry.bytes <= 0
    )
      issues.push(`extensions[${index}] needs id, version, title, tag, archive, sha256 and bytes`);
    else if (entry.preview !== undefined && !isReleaseAsset(entry.preview))
      issues.push(`extensions[${index}].preview needs archive, sha256 and bytes`);
    else if (entry.layers !== undefined) {
      if (!Array.isArray(entry.layers)) issues.push(`extensions[${index}].layers must be an array`);
      else
        entry.layers.forEach((layer, layerIndex) => {
          if (
            !isRecord(layer) ||
            !EXTENSION_LAYERS.includes(layer.name as ExtensionLayerName) ||
            typeof layer.archive !== 'string' ||
            !layer.archive.endsWith('.zip') ||
            layer.archive.includes('/') ||
            typeof layer.sha256 !== 'string' ||
            !SHA256_PATTERN.test(layer.sha256) ||
            typeof layer.bytes !== 'number' ||
            !Number.isInteger(layer.bytes) ||
            layer.bytes <= 0
          )
            issues.push(
              `extensions[${index}].layers[${layerIndex}] needs a known name, archive, sha256 and bytes`,
            );
        });
    }
  });
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, index: value as unknown as ExtensionReleaseIndex };
}

/** Compares two semver strings by their numeric parts; pre-release tags sort before releases. */
export function compareExtensionVersions(a: string, b: string) {
  const [aCore, aPre] = a.split('-', 2);
  const [bCore, bPre] = b.split('-', 2);
  const aParts = aCore.split('.').map(Number);
  const bParts = bCore.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff;
  }
  if (aPre === bPre) return 0;
  if (aPre === undefined) return 1;
  if (bPre === undefined) return -1;
  return aPre.localeCompare(bPre);
}

export function globalStylePresetId(extensionId: string, presetId: string) {
  return `${extensionId}/${presetId}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isStylePackLanding(value: unknown): value is StylePackLanding {
  return (
    isRecord(value) &&
    isStringArray(value.imageKeys) &&
    isRecord(value.collections) &&
    Object.values(value.collections).every(
      (folder) =>
        isRecord(folder) &&
        typeof folder.presetCount === 'number' &&
        Number.isInteger(folder.presetCount) &&
        folder.presetCount >= 0 &&
        isStringArray(folder.imageKeys),
    )
  );
}

export function parseExtensionManifest(value: unknown): ExtensionManifestParseResult {
  if (!isRecord(value)) return { ok: false, issues: ['extension.json must be an object'] };
  const issues: string[] = [];
  const { schemaVersion, id, kind, version, studio, title, files, stylePack, assets = [] } = value;

  if (schemaVersion !== EXTENSION_SCHEMA_VERSION) issues.push('unsupported schemaVersion');
  if (typeof id !== 'string' || !EXTENSION_ID_PATTERN.test(id))
    issues.push('id must be a lowercase publisher.name');
  if (!EXTENSION_KINDS.includes(kind as ExtensionKind)) issues.push('unknown kind');
  if (typeof version !== 'string' || !SEMVER_PATTERN.test(version))
    issues.push('version must be semver');
  if (typeof studio !== 'string' || studio.trim() === '') issues.push('studio range is required');
  if (typeof title !== 'string' || title.trim() === '') issues.push('title is required');

  if (!isRecord(files)) issues.push('files must be an object');
  else
    for (const key of STYLE_PACK_FILE_KEYS)
      if (!isSafeRelativePath(files[key])) issues.push(`files.${key} must be a relative path`);
  if (isRecord(files) && files.archived !== undefined && !isSafeRelativePath(files.archived))
    issues.push('files.archived must be a relative path');
  if (isRecord(files) && files.preview !== undefined && !isSafeRelativePath(files.preview))
    issues.push('files.preview must be a relative path');

  if (
    !isRecord(stylePack) ||
    typeof stylePack.id !== 'string' ||
    stylePack.id === '' ||
    typeof stylePack.name !== 'string' ||
    typeof stylePack.description !== 'string' ||
    typeof stylePack.presetCount !== 'number' ||
    !Number.isInteger(stylePack.presetCount) ||
    stylePack.presetCount < 0
  )
    issues.push('stylePack needs id, name, description and presetCount');
  else if (stylePack.landing !== undefined && !isStylePackLanding(stylePack.landing))
    issues.push('stylePack.landing needs imageKeys and collections');
  else if (
    stylePack.copiedFrom !== undefined &&
    !(
      isRecord(stylePack.copiedFrom) &&
      Object.values(stylePack.copiedFrom).every(
        (source) =>
          isRecord(source) &&
          typeof source.packId === 'string' &&
          typeof source.presetId === 'string',
      )
    )
  )
    issues.push('stylePack.copiedFrom maps preset ids to a source packId and presetId');

  if (!Array.isArray(assets)) issues.push('assets must be an array');
  else
    assets.forEach((asset, index) => {
      if (
        !isRecord(asset) ||
        typeof asset.name !== 'string' ||
        typeof asset.optional !== 'boolean' ||
        typeof asset.sha256 !== 'string' ||
        !SHA256_PATTERN.test(asset.sha256) ||
        typeof asset.bytes !== 'number' ||
        !Number.isInteger(asset.bytes) ||
        asset.bytes < 0
      )
        issues.push(`assets[${index}] needs name, optional, sha256 and bytes`);
    });

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, manifest: value as unknown as ExtensionManifest };
}
