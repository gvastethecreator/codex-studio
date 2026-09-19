export const WORKBENCH_UI_VERSION = '0.4.0';
export const WORKBENCH_DENSITY = 'comfortable';
export const WORKBENCH_PRECISION_DENSITY = 'comfortable';
export const WORKBENCH_TYPOGRAPHY = 'neutral';
export const WORKBENCH_EDGES = 'soft';
export const WORKBENCH_PRESENTATION = 'utility';
export const APPEARANCE_STORAGE_KEY = 'codex-studio-appearance';

export type WorkbenchAppearance = 'dark' | 'light';
export type WorkbenchThemeName = 'carbon' | 'paper';

export function appearanceToWorkbenchTheme(appearance: WorkbenchAppearance): WorkbenchThemeName {
  return appearance === 'light' ? 'paper' : 'carbon';
}

export function readStoredWorkbenchAppearance(): WorkbenchAppearance {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return 'dark';
    const parsed = JSON.parse(raw) as unknown;
    return parsed === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Gate every CSS feature used by the selected Ambient 0.4.0 kernel. */
export function supportsWorkbenchLighting(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSSScopeRule !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('color', 'color(from #333 srgb-linear calc(r * .9) g b)') &&
    CSS.supports('color', 'hsl(from #333 h s calc(l + 2))') &&
    CSS.supports('background', 'linear-gradient(calc(atan2(-1,-1) + 270deg),#fff,#000)')
  );
}

export function workbenchAmbientRootProps(appearance?: WorkbenchAppearance) {
  const lighting = supportsWorkbenchLighting();
  const fromDom =
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-appearance')
      : null;
  const resolvedAppearance: WorkbenchAppearance =
    appearance === 'light' || appearance === 'dark'
      ? appearance
      : fromDom === 'light' || fromDom === 'dark'
        ? fromDom
        : readStoredWorkbenchAppearance();
  const theme = appearanceToWorkbenchTheme(resolvedAppearance);
  return {
    className: 'wb wb-ambient wbp-system',
    'data-theme': theme,
    'data-density': WORKBENCH_DENSITY,
    'data-wbp-density': WORKBENCH_PRECISION_DENSITY,
    'data-wbp-typography': WORKBENCH_TYPOGRAPHY,
    'data-wbp-edges': WORKBENCH_EDGES,
    'data-wbc-presentation': WORKBENCH_PRESENTATION,
    'data-appearance': resolvedAppearance,
    'data-ambient-preset': theme,
    'data-ambient-enabled': lighting ? 'true' : 'false',
    ...(lighting ? {} : { 'data-ambient-fallback': 'unsupported-css' }),
  } as const;
}

/** Portal menus leave `.studio-experience`; they still need Ambient scope + popover albedo. */
export function workbenchAmbientPortalProps(appearance?: WorkbenchAppearance) {
  const root = workbenchAmbientRootProps(appearance);
  return {
    ...root,
    className: `${root.className} studio-popover`,
  } as const;
}

export function applyWorkbenchAmbientToDocument(
  doc: Document = document,
  appearance?: WorkbenchAppearance,
) {
  const root = doc.documentElement;
  const props = workbenchAmbientRootProps(appearance);
  for (const token of props.className.split(/\s+/)) {
    if (token) root.classList.add(token);
  }
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className' || typeof value !== 'string') continue;
    root.setAttribute(key, value);
  }
  root.style.colorScheme = props['data-appearance'] === 'light' ? 'light' : 'dark';
  if (!('data-ambient-fallback' in props)) {
    root.removeAttribute('data-ambient-fallback');
  }
}
