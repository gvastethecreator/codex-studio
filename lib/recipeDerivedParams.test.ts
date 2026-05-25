import { describe, expect, it } from 'vite-plus/test';

import {
  createCameraRecipeParams,
  createTimelineRecipeParams,
  getCameraGeometryConstraints,
  getTimelineTimeDeltaValue,
} from './recipeDerivedParams';

describe('recipeDerivedParams', () => {
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
      hPos: 'RIGHT PROFILE (Side View)',
      vPos: 'LOW-ANGLE (Looking Up)',
      framing: 'MACRO (Extreme detail)',
    });
  });

  it('describes camera geometry constraints without UI state', () => {
    expect(getCameraGeometryConstraints(170, 45)).toContain('Back view requested');
    expect(getCameraGeometryConstraints(0, 0)).toBe(
      'Front view requested: favor a centered, symmetrical composition.',
    );
  });

  it('maps timeline labels into durable recipe params', () => {
    expect(getTimelineTimeDeltaValue('Hours')).toBe('DAY_NIGHT_CYCLE');
    expect(
      createTimelineRecipeParams({
        currentRefIndex: 4,
        direction: 'backward',
        timeDeltaLabel: 'Minutes',
        cameraMode: 'dynamic',
        motionAmount: 'Cinematic',
        lightingMode: 'Evolving',
        isAnchored: true,
      }),
    ).toEqual({
      nextIndex: 3,
      direction: 'backward',
      timeDeltaValue: 'MEDIUM_TERM_PROGRESSION',
      timeDeltaLabel: 'Minutes',
      cameraMode: 'dynamic',
      motionAmount: 'Cinematic',
      lightingMode: 'Evolving',
      isAnchored: true,
    });
  });
});
