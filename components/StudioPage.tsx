import React from 'react';

import type { StudioPageController } from '../hooks/useStudioPageController';

import { StudioGridSurface } from './studio/StudioGridSurface';
import { StudioOperationsRail } from './studio/StudioOperationsRail';

export interface StudioPageProps {
  controller: StudioPageController;
}

export const StudioPage: React.FC<StudioPageProps> = ({ controller }) => {
  const { grid, operations } = controller;

  return (
    <>
      <StudioGridSurface {...grid} />

      <StudioOperationsRail {...operations} />
    </>
  );
};
