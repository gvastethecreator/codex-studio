const PUBLIC_LIBRARY_ROOTS = [
  'outputs',
  'assets',
  'thumbnails',
  'exports',
  'references',
  'masks',
  '.studio/references',
  '.studio/masks',
] as const;

function normalizeLibraryRelativePath(relativePath: string) {
  return relativePath.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
}

function hasUnsafePathSegment(normalizedPath: string) {
  return normalizedPath.split('/').some((segment) => segment === '.' || segment === '..');
}

function isUnderRoot(normalizedPath: string, root: string) {
  return normalizedPath === root || normalizedPath.startsWith(`${root}/`);
}

export function isPublicLibraryAssetPath(relativePath: string) {
  const normalized = normalizeLibraryRelativePath(relativePath);
  if (!normalized || hasUnsafePathSegment(normalized)) return false;
  return PUBLIC_LIBRARY_ROOTS.some((root) => isUnderRoot(normalized, root));
}
