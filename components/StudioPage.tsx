import React from 'react';

import type { StudioPageController } from '../lib/buildStudioPageController';

import { StudioGridSurface } from './studio/StudioGridSurface';

export interface StudioPageProps {
  controller: StudioPageController;
}

export const StudioPage: React.FC<StudioPageProps> = ({ controller }) => {
  const { grid } = controller;

  return <StudioGridSurface {...grid} />;
};
