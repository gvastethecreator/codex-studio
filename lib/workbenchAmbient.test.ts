/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';

import {
  WORKBENCH_EDGES,
  WORKBENCH_PRESENTATION,
  WORKBENCH_PRECISION_DENSITY,
  WORKBENCH_TYPOGRAPHY,
  WORKBENCH_UI_VERSION,
  applyWorkbenchAmbientToDocument,
  supportsWorkbenchLighting,
  workbenchAmbientPortalProps,
  workbenchAmbientRootProps,
} from './workbenchAmbient';

describe('workbenchAmbient', () => {
  it('exposes Carbon Comfortable root props with a lighting gate', () => {
    const props = workbenchAmbientRootProps();
    expect(WORKBENCH_UI_VERSION).toBe('0.4.0');
    expect(props.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['wb', 'wb-ambient', 'wbp-system']),
    );
    expect(props['data-theme']).toBe('carbon');
    expect(props['data-density']).toBe('comfortable');
    expect(props['data-wbp-density']).toBe(WORKBENCH_PRECISION_DENSITY);
    expect(props['data-wbp-typography']).toBe(WORKBENCH_TYPOGRAPHY);
    expect(props['data-wbp-edges']).toBe(WORKBENCH_EDGES);
    expect(props['data-wbc-presentation']).toBe(WORKBENCH_PRESENTATION);
    expect(props['data-ambient-preset']).toBe('carbon');
    expect(
      props['data-ambient-enabled'] === 'true' || props['data-ambient-enabled'] === 'false',
    ).toBe(true);
    if (props['data-ambient-enabled'] === 'false') {
      expect(props['data-ambient-fallback']).toBe('unsupported-css');
    }
  });

  it('reports lighting support as a boolean', () => {
    expect(typeof supportsWorkbenchLighting()).toBe('boolean');
  });

  it('keeps portaled menus inside the Ambient Carbon scope', () => {
    const props = workbenchAmbientPortalProps();
    expect(props.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['wb', 'wb-ambient', 'wbp-system', 'studio-popover']),
    );
    expect(props['data-theme']).toBe('carbon');
  });

  it('stamps Carbon Comfortable on the document element', () => {
    applyWorkbenchAmbientToDocument();
    expect(document.documentElement.classList.contains('wb-ambient')).toBe(true);
    expect(document.documentElement.classList.contains('wbp-system')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('carbon');
    expect(document.documentElement.getAttribute('data-density')).toBe('comfortable');
    expect(document.documentElement.getAttribute('data-wbp-density')).toBe('comfortable');
    expect(document.documentElement.getAttribute('data-wbp-typography')).toBe('neutral');
    expect(document.documentElement.getAttribute('data-wbc-presentation')).toBe('utility');
  });

  it('maps light appearance onto Paper tokens', () => {
    const props = workbenchAmbientRootProps('light');
    expect(props['data-theme']).toBe('paper');
    expect(props['data-appearance']).toBe('light');
    expect(props['data-ambient-preset']).toBe('paper');
    applyWorkbenchAmbientToDocument(document, 'light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('paper');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
