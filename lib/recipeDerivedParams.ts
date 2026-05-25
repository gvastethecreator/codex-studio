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
  currentRefIndex: number;
  direction: TimelineDirection;
  timeDeltaLabel: string;
  cameraMode: TimelineCameraMode;
  motionAmount: string;
  lightingMode: string;
  isAnchored: boolean;
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

export function getCameraDirectorInstructions(
  azimuth: number,
  elevation: number,
  distance: number,
): CameraDirectorInstructions {
  const side = azimuth > 0 ? 'RIGHT' : 'LEFT';
  let hPos = 'FRONT CENTER (0°)';
  const absAzimuth = Math.abs(azimuth);

  if (absAzimuth > 10 && absAzimuth <= 45) hPos = `${side} 3/4 ANGLE (Oblique)`;
  if (absAzimuth > 45 && absAzimuth <= 110) hPos = `${side} PROFILE (Side View)`;
  if (absAzimuth > 110 && absAzimuth <= 160) hPos = `${side} REAR 3/4 ANGLE (Behind)`;
  if (absAzimuth > 160) hPos = 'DIRECT BACK VIEW (Rear)';

  let vPos = 'EYE-LEVEL';
  if (elevation > 20) vPos = 'HIGH-ANGLE (Looking Down)';
  if (elevation > 60) vPos = "OVERHEAD / BIRD'S EYE (Top-Down)";
  if (elevation < -20) vPos = 'LOW-ANGLE (Looking Up)';
  if (elevation < -60) vPos = "WORM'S EYE (Ground View)";

  let framing = 'MEDIUM SHOT';
  if (distance < 50) framing = 'WIDE ANGLE (Environment visible)';
  if (distance > 130) framing = 'CLOSE-UP (Tight face framing)';
  if (distance > 170) framing = 'MACRO (Extreme detail)';

  return { hPos, vPos, framing };
}

export function getCameraGeometryConstraints(azimuth: number, elevation: number) {
  const constraints: string[] = [];
  const absAzimuth = Math.abs(azimuth);

  if (elevation > 35) {
    constraints.push('Favor a high camera view with visible top planes of the head and shoulders.');
  } else if (elevation < -35) {
    constraints.push('Favor a low camera view with visible underside planes such as chin and jaw.');
  }

  if (absAzimuth > 150) {
    constraints.push(
      'Back view requested: emphasize the back of the head and body, with minimal face visibility.',
    );
  } else if (absAzimuth > 60 && absAzimuth < 120) {
    constraints.push(
      'Profile view requested: favor a clear side silhouette and one-eye facial structure.',
    );
  } else if (absAzimuth < 20) {
    constraints.push('Front view requested: favor a centered, symmetrical composition.');
  }

  return constraints.join(' ');
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

export function createTimelineRecipeParams(input: TimelineRecipeParamsInput) {
  return {
    nextIndex: input.currentRefIndex + (input.direction === 'forward' ? 1 : -1),
    direction: input.direction,
    timeDeltaValue: getTimelineTimeDeltaValue(input.timeDeltaLabel),
    timeDeltaLabel: input.timeDeltaLabel,
    cameraMode: input.cameraMode,
    motionAmount: input.motionAmount,
    lightingMode: input.lightingMode,
    isAnchored: input.isAnchored,
  };
}
