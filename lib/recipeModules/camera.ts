import {
  createModuleDirectives,
  directive,
  getBoolean,
  getNumber,
  getString,
} from './directiveHelpers';
import { createRecipeModule } from './params';
import type { RecipeDefinition, RecipeParams } from './types';

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

const module = createRecipeModule({
  id: 'camera',
  title: 'Camera View',
  description: 'Generate alternate camera views from orbit, pitch, zoom, and framing.',
  defaultTask: 'image_generate',
  variation: 'none',
  supportedTasks: ['image_generate', 'image_edit'],
  parameters: [
    {
      id: 'azimuth',
      label: 'Azimuth',
      kind: 'number',
      control: 'slider',
      group: 'orbit',
      defaultValue: 0,
      min: -180,
      max: 180,
      step: 1,
    },
    {
      id: 'elevation',
      label: 'Elevation',
      kind: 'number',
      control: 'slider',
      group: 'orbit',
      defaultValue: 0,
      min: -85,
      max: 85,
      step: 1,
    },
    {
      id: 'distance',
      label: 'Distance',
      kind: 'number',
      control: 'slider',
      group: 'orbit',
      defaultValue: 100,
      min: 20,
      max: 200,
      step: 1,
    },
    {
      id: 'hasReference',
      label: 'Has Reference',
      kind: 'boolean',
      control: 'toggle',
      group: 'source',
      defaultValue: false,
    },
    {
      id: 'hPos',
      label: 'Horizontal Position',
      kind: 'string',
      control: 'text',
      group: 'derived',
    },
    { id: 'vPos', label: 'Vertical Position', kind: 'string', control: 'text', group: 'derived' },
    { id: 'framing', label: 'Framing', kind: 'string', control: 'text', group: 'derived' },
    {
      id: 'geometryConstraints',
      label: 'Geometry Constraints',
      kind: 'string',
      control: 'text',
      group: 'derived',
    },
  ],
});

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

function buildCameraDirectives(params: RecipeParams) {
  const azimuth = Math.round(getNumber(params, 'azimuth', 0));
  const elevation = Math.round(getNumber(params, 'elevation', 0));
  const distance = Math.round(getNumber(params, 'distance', 100));
  const director = getCameraDirectorInstructions(azimuth, elevation, distance);
  const hPos = getString(params, 'hPos') || director.hPos;
  const vPos = getString(params, 'vPos') || director.vPos;
  const framing = getString(params, 'framing') || director.framing;
  const geometryConstraints =
    getString(params, 'geometryConstraints') || getCameraGeometryConstraints(azimuth, elevation);

  const hasReference = getBoolean(params, 'hasReference');

  return createModuleDirectives(module, [
    {
      title: 'Objective',
      directives: [
        directive(
          'Goal',
          hasReference
            ? 'Re-render the same subject from the reference image as seen from the camera position below. Keep identity, outfit, materials, palette, and lighting. Invent only what the new angle reveals.'
            : 'Render the subject from the prompt as seen from the camera position below.',
        ),
        directive('Rules', 'One image from one camera. No split views, grids, labels, or text.'),
      ],
    },
    {
      title: 'Camera Transform',
      directives: [
        directive('Orbit', `${azimuth} degrees (${hPos})`),
        directive('Pitch', `${elevation} degrees (${vPos})`),
        directive('Zoom', `${distance}% (${framing}). 100% is a medium shot; higher is closer.`),
      ],
    },
    {
      title: 'Visual Guidance',
      directives: [directive('Geometry Constraints', geometryConstraints)],
    },
  ]);
}

export const cameraRecipe: RecipeDefinition = {
  module,
  policy: {},
  referenceInstruction: (_params, _attachment, index) =>
    index === 0
      ? 'The subject to re-render from the new camera position.'
      : 'Extra view of the same subject.',
  directives: (params) => buildCameraDirectives(params),
};
