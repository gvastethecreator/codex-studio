import { describe, expect, it } from 'vite-plus/test';

import {
  createAnimationSequenceRecipeParams,
  createCameraRecipeParams,
  createTimelineRecipeParams,
  getCameraGeometryConstraints,
  getTimelineTimeDeltaValue,
} from './recipeDerivedParams';
import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
} from '../packages/shared/src/animationSequenceContracts';

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

  it('projects animation frame params without React-only state', () => {
    const contract = createAnimationSequenceContract({
      prompt: 'a ceramic fox waves',
      frameCount: 5,
      fps: 10,
    });
    const frame = createAnimationSequenceFramePlan(contract).frames[2]!;

    expect(
      createAnimationSequenceRecipeParams({
        runId: 'anim-1',
        contract,
        frame,
        correctionMode: true,
      }),
    ).toMatchObject({
      runId: 'anim-1',
      prompt: 'a ceramic fox waves',
      frameCount: 5,
      fps: 10,
      frameId: 'frame-0003',
      frameIndex: 2,
      frameOrdinal: 3,
      task: 'image_edit',
      correctionMode: true,
    });
  });
});
