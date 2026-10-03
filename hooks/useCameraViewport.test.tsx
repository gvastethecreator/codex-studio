/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useCameraViewport } from './useCameraViewport';

vi.mock('three', async (importOriginal) => {
  const three = await importOriginal<typeof import('three')>();
  return {
    ...three,
    WebGLRenderer: class {
      constructor() {
        throw new Error('WebGL unavailable');
      }
    },
  };
});

function Camera() {
  const { mountRef, viewportError, cameraState, setAzimuth, setElevation } = useCameraViewport({
    aspectRatio: '1:1',
    referenceImageSrc: null,
    ranges: {
      azimuth: { min: -180, max: 180 },
      elevation: { min: -85, max: 85 },
      distance: { min: 20, max: 200 },
    },
  });
  return (
    <>
      <div ref={mountRef} />
      <p role="status">{viewportError}</p>
      <input
        aria-label="Azimuth"
        type="number"
        value={cameraState.azimuth}
        onChange={(event) => setAzimuth(Number(event.target.value))}
      />
      <input
        aria-label="Elevation"
        type="number"
        value={cameraState.elevation}
        onChange={(event) => setElevation(Number(event.target.value))}
      />
    </>
  );
}

it('keeps numeric camera controls working after WebGL initialization fails', async () => {
  const view = render(<Camera />);
  expect(await screen.findByText(/3D preview is unavailable/)).toBeTruthy();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Azimuth' }), {
    target: { value: '45' },
  });
  expect(screen.getByRole('spinbutton', { name: 'Azimuth' })).toHaveProperty('value', '45');
  // A top-down drag past the recipe range must not produce a value the recipe rejects.
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Elevation' }), {
    target: { value: '89' },
  });
  expect(screen.getByRole('spinbutton', { name: 'Elevation' })).toHaveProperty('value', '85');
  view.unmount();
});
