import { describe, expect, it } from 'vitest';

import {
  createAnimationSequenceRecipeParams,
  createCameraRecipeParams,
  createTimelineRecipeParams,
  getCameraGeometryConstraints,
  getCameraZoomLabel,
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

  it('maps timeline labels into durable recipe params', () => {
    expect(getTimelineTimeDeltaValue('Hours')).toBe('DAY_NIGHT_CYCLE');
    const input = {
      currentRefIndex: 4,
      sequenceIndices: [0, 4],
      sequenceId: 'origin',
      sourceFrameId: 'frame-4',
      direction: 'backward',
      timeDeltaLabel: 'Minutes',
      cameraMode: 'dynamic',
      motionAmount: 'Cinematic',
      lightingMode: 'Evolving',
      isAnchored: true,
    } as const;
    expect(createTimelineRecipeParams(input)).toEqual({
      nextIndex: 3,
      sequenceId: 'origin',
      sourceFrameId: 'frame-4',
      direction: 'backward',
      timeDeltaValue: 'MEDIUM_TERM_PROGRESSION',
      timeDeltaLabel: 'Minutes',
      cameraMode: 'dynamic',
      motionAmount: 'Cinematic',
      lightingMode: 'Evolving',
      isAnchored: true,
    });
    // An existing neighbor means the new frame goes past the end of the sequence.
    expect(createTimelineRecipeParams({ ...input, sequenceIndices: [0, 1, 3, 4] }).nextIndex).toBe(
      -1,
    );
    expect(
      createTimelineRecipeParams({
        ...input,
        direction: 'forward',
        sequenceIndices: [0, 4, 5, 6],
      }).nextIndex,
    ).toBe(7);
    expect(createTimelineRecipeParams({ ...input, currentRefIndex: null }).nextIndex).toBeNull();
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
