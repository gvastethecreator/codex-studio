import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import {
  createCameraRecipeParams,
  getCameraGeometryConstraints,
  getCameraZoomLabel,
} from './camera';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';

describe('camera recipe', () => {
  it('translates camera controls into provider-independent recipe params', () => {
    expect(
      createCameraRecipeParams({
        azimuth: 88.8,
        elevation: -42.2,
        distance: 174.7,
        hasReference: true,
      }),
    ).toMatchObject({
      azimuth: 89,
      elevation: -42,
      distance: 175,
      hasReference: true,
      hPos: "SIDE VIEW (camera to the viewer's right of the subject; the subject's left side faces the camera)",
      vPos: 'LOW ANGLE (camera below the subject, looking up)',
      framing: 'EXTREME CLOSE-UP (zoomed far in; one detail of the subject fills the frame)',
    });
    expect(getCameraZoomLabel(175)).toBe('175% (closer)');
  });

  it('keeps camera position and geometry wording on the same zone', () => {
    const at15 = createCameraRecipeParams({
      azimuth: 15,
      elevation: 0,
      distance: 100,
      hasReference: true,
    });
    expect(at15.hPos).toContain('FRONT VIEW');
    expect(at15.geometryConstraints).toContain('Front view');
    const at115 = createCameraRecipeParams({
      azimuth: -115,
      elevation: 70,
      distance: 100,
      hasReference: true,
    });
    expect(at115.hPos).toContain("3/4 REAR VIEW (camera behind the subject, to the viewer's left");
    expect(at115.geometryConstraints).toContain(
      "Three-quarter rear view: show the back and the subject's right side",
    );
    expect(at115.geometryConstraints).not.toMatch(/\b(face|chin|jaw|head)\b/i);
    expect(getCameraGeometryConstraints(170, 45)).toContain('Rear view');
  });

  it('builds compact provider directives for camera params', () => {
    const camera = getRecipeModule('camera');
    expect(camera).toBeTruthy();

    const directives =
      camera &&
      buildRecipeProviderDirectives(camera, {
        azimuth: 80,
        elevation: 30,
        distance: 140,
        hasReference: true,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'camera',
      title: 'Camera View',
    });
    expect(serialized).toContain('- Goal: Re-render the same subject from the reference image');
    expect(serialized).toContain('- Orbit: 80 degrees');
    expect(serialized).toContain('- Zoom: 140%');
  });
});
