import { describe, expect, it } from 'vitest';

import {
  IMAGE_PAN_ZOOM_FIT_SCALE,
  IMAGE_PAN_ZOOM_MAX_SCALE,
  IMAGE_PAN_ZOOM_MIN_SCALE,
  clampImagePanZoomScale,
  nextImageWheelScale,
} from './imagePanZoom';

describe('image pan zoom scale', () => {
  it('lets the wheel zoom out below fit', () => {
    expect(nextImageWheelScale(IMAGE_PAN_ZOOM_FIT_SCALE, 120)).toBe(0.75);
    expect(nextImageWheelScale(IMAGE_PAN_ZOOM_FIT_SCALE, -120)).toBe(1.25);
  });

  it('clamps the wheel at the min and max scale', () => {
    expect(clampImagePanZoomScale(0)).toBe(IMAGE_PAN_ZOOM_MIN_SCALE);
    expect(clampImagePanZoomScale(99)).toBe(IMAGE_PAN_ZOOM_MAX_SCALE);
    expect(nextImageWheelScale(IMAGE_PAN_ZOOM_MIN_SCALE, 400)).toBe(IMAGE_PAN_ZOOM_MIN_SCALE);
    expect(nextImageWheelScale(IMAGE_PAN_ZOOM_MAX_SCALE, -400)).toBe(IMAGE_PAN_ZOOM_MAX_SCALE);
  });
});
