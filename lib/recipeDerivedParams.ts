import type {
  AnimationSequenceContract,
  AnimationSequenceFramePlanItem,
} from '../packages/shared/src/animationSequenceContracts';
import { createAnimationFrameHandoff } from './animationFrameHandoff';

export type TimelineDirection = 'forward' | 'backward';
export type TimelineCameraMode = 'locked' | 'dynamic';

export interface CameraRecipeInput {
  azimuth: number;
  elevation: number;
  distance: number;
  hasReference: boolean;
}

export interface CameraDirectorInstructions {
  hPos: string;
  vPos: string;
  framing: string;
}

export interface CameraRecipeParams extends CameraDirectorInstructions {
  [key: string]: unknown;
  azimuth: number;
  elevation: number;
  distance: number;
  hasReference: boolean;
  geometryConstraints: string;
}

export interface TimelineRecipeParamsInput {
  /** Null while the active frame's sequence index is not known yet. */
  currentRefIndex: number | null;
  /** Indices already used in this sequence, including the origin (0). */
  sequenceIndices: readonly number[];
  /** Origin attachment id; frames with the same id form one sequence. */
  sequenceId: string | null;
  /** Catalog image id of the active frame, or the origin id when the origin is active. */
  sourceFrameId: string | null;
  direction: TimelineDirection;
  timeDeltaLabel: string;
  cameraMode: TimelineCameraMode;
  motionAmount: string;
  lightingMode: string;
  isAnchored: boolean;
}

export interface AnimationSequenceRecipeParamsInput {
  runId?: string | null;
  contract: AnimationSequenceContract;
  frame: AnimationSequenceFramePlanItem;
  correctionMode?: boolean;
}

const TIME_DELTA_VALUE_BY_LABEL: Record<string, string> = {
  'Split Second': 'IMMEDIATE_REACTION',
  Seconds: 'SHORT_TERM_CONSEQUENCE',
  Minutes: 'MEDIUM_TERM_PROGRESSION',
  Hours: 'DAY_NIGHT_CYCLE',
  Years: 'LONG_TERM_AGING',
};

export function getTimelineTimeDeltaValue(label: string) {
  return TIME_DELTA_VALUE_BY_LABEL[label] ?? label;
}

/**
 * Positive azimuth orbits the camera to the viewer's right, so the subject's left side turns
 * toward it. Wording stays subject-neutral: it works for people, creatures, objects, and scenes.
 */
interface CameraSide {
  camera: "viewer's right" | "viewer's left";
  subject: 'left' | 'right';
}

interface CameraOrbitZone {
  maxAbsAzimuth: number;
  position: (side: CameraSide) => string;
  geometry: (side: CameraSide) => string;
}

// One table per axis drives both the position label and the geometry hint, so they never disagree.
const CAMERA_ORBIT_ZONES: readonly CameraOrbitZone[] = [
  {
    maxAbsAzimuth: 22,
    position: () => 'FRONT VIEW (camera faces the front of the subject)',
    geometry: () => 'Front view: show the front of the subject straight on, centered in the frame.',
  },
  {
    maxAbsAzimuth: 67,
    position: (side) =>
      `3/4 FRONT VIEW (camera to the ${side.camera} of the subject; the subject's ${side.subject} side turns toward the camera)`,
    geometry: (side) =>
      `Three-quarter front view: show the front and the subject's ${side.subject} side together; the far side turns away.`,
  },
  {
    maxAbsAzimuth: 112,
    position: (side) =>
      `SIDE VIEW (camera to the ${side.camera} of the subject; the subject's ${side.subject} side faces the camera)`,
    geometry: (side) =>
      `Side view: show the subject's ${side.subject} side as a clear silhouette; the front and back are seen edge-on.`,
  },
  {
    maxAbsAzimuth: 157,
    position: (side) =>
      `3/4 REAR VIEW (camera behind the subject, to the ${side.camera}; the subject's back and ${side.subject} side face the camera)`,
    geometry: (side) =>
      `Three-quarter rear view: show the back and the subject's ${side.subject} side; the front turns away from the camera.`,
  },
  {
    maxAbsAzimuth: Infinity,
    position: () =>
      'REAR VIEW (camera behind the subject; the back of the subject faces the camera)',
    geometry: () =>
      'Rear view: show the back of the subject; the front faces away from the camera.',
  },
];

const CAMERA_PITCH_ZONES = [
  {
    minElevation: 61,
    position: "OVERHEAD / BIRD'S-EYE VIEW (camera looks almost straight down)",
    geometry:
      'Overhead view: show mostly the top surfaces of the subject and the ground around it; vertical sides are strongly foreshortened.',
  },
  {
    minElevation: 21,
    position: 'HIGH ANGLE (camera above the subject, looking down)',
    geometry: 'High view: show the top surfaces of the subject; vertical lines converge downward.',
  },
  {
    minElevation: -20,
    position: 'EYE LEVEL (camera level with the subject)',
    geometry:
      'Eye-level view: keep the horizon level; show neither the top nor the underside of the subject.',
  },
  {
    minElevation: -60,
    position: 'LOW ANGLE (camera below the subject, looking up)',
    geometry:
      'Low view: show the underside surfaces of the subject; vertical lines converge upward.',
  },
  {
    minElevation: -Infinity,
    position: "WORM'S-EYE VIEW (camera near the ground, looking steeply up)",
    geometry:
      "Worm's-eye view: the subject towers over the camera; show its underside with strong upward foreshortening.",
  },
] as const;

// The camera "distance" control is a zoom: a higher value moves the camera closer.
const CAMERA_ZOOM_ZONES = [
  {
    minZoom: 171,
    framing: 'EXTREME CLOSE-UP (zoomed far in; one detail of the subject fills the frame)',
  },
  {
    minZoom: 131,
    framing: 'CLOSE-UP (zoomed in; the subject fills the frame)',
  },
  {
    minZoom: 50,
    framing: 'MEDIUM SHOT (balanced framing; the subject and some surroundings are in frame)',
  },
  {
    minZoom: -Infinity,
    framing: 'WIDE SHOT (zoomed out; the subject is small and the surroundings are visible)',
  },
] as const;

function getCameraOrbit(azimuth: number) {
  const side: CameraSide =
    azimuth > 0
      ? { camera: "viewer's right", subject: 'left' }
      : { camera: "viewer's left", subject: 'right' };
  const zone = CAMERA_ORBIT_ZONES.find((item) => Math.abs(azimuth) <= item.maxAbsAzimuth)!;
  return { position: zone.position(side), geometry: zone.geometry(side) };
}

function getCameraPitch(elevation: number) {
  return CAMERA_PITCH_ZONES.find((item) => elevation >= item.minElevation)!;
}

/** "180% (closer)": the zoom value with the direction a reader would expect. */
export function getCameraZoomLabel(distance: number) {
  const direction = distance > 100 ? 'closer' : distance < 100 ? 'farther' : 'default';
  return `${distance}% (${direction})`;
}

export function getCameraDirectorInstructions(
  azimuth: number,
  elevation: number,
  distance: number,
): CameraDirectorInstructions {
  return {
    hPos: getCameraOrbit(azimuth).position,
    vPos: getCameraPitch(elevation).position,
    framing: CAMERA_ZOOM_ZONES.find((item) => distance >= item.minZoom)!.framing,
  };
}

export function getCameraGeometryConstraints(azimuth: number, elevation: number) {
  return `${getCameraPitch(elevation).geometry} ${getCameraOrbit(azimuth).geometry}`;
}

export function createCameraRecipeParams(input: CameraRecipeInput): CameraRecipeParams {
  const azimuth = Math.round(input.azimuth);
  const elevation = Math.round(input.elevation);
  const distance = Math.round(input.distance);
  const director = getCameraDirectorInstructions(azimuth, elevation, distance);

  return {
    azimuth,
    elevation,
    distance,
    hasReference: input.hasReference,
    ...director,
    geometryConstraints: getCameraGeometryConstraints(azimuth, elevation),
  };
}

function getTimelineNextIndex(
  currentRefIndex: number,
  direction: TimelineDirection,
  sequenceIndices: readonly number[],
) {
  const neighbor = currentRefIndex + (direction === 'forward' ? 1 : -1);
  if (!sequenceIndices.includes(neighbor)) return neighbor;
  // The neighbor slot is taken, so the new frame goes after the last (or before the first) one.
  return direction === 'forward'
    ? Math.max(currentRefIndex, ...sequenceIndices) + 1
    : Math.min(currentRefIndex, ...sequenceIndices) - 1;
}

export function createTimelineRecipeParams(input: TimelineRecipeParamsInput) {
  return {
    nextIndex:
      input.currentRefIndex === null
        ? null
        : getTimelineNextIndex(input.currentRefIndex, input.direction, input.sequenceIndices),
    sequenceId: input.sequenceId,
    sourceFrameId: input.sourceFrameId,
    direction: input.direction,
    timeDeltaValue: getTimelineTimeDeltaValue(input.timeDeltaLabel),
    timeDeltaLabel: input.timeDeltaLabel,
    cameraMode: input.cameraMode,
    motionAmount: input.motionAmount,
    lightingMode: input.lightingMode,
    isAnchored: input.isAnchored,
  };
}

export function createAnimationSequenceRecipeParams(input: AnimationSequenceRecipeParamsInput) {
  return createAnimationFrameHandoff(input).recipeParams;
}
