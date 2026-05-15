import React from "react";

import type { StudioPageController } from '../hooks/useStudioPageController';

import { LeftDebugPanel } from "./LeftDebugPanel";
import { StudioGridSurface } from "./studio/StudioGridSurface";
import { StudioOperationsRail } from "./studio/StudioOperationsRail";

export interface StudioPageProps {
  controller: StudioPageController;
}

export const StudioPage: React.FC<StudioPageProps> = ({ controller }) => {
  const { debugPanel, grid, operations } = controller;

  return (
    <>
      {debugPanel.isVisible && <LeftDebugPanel {...debugPanel.props} />}

      <StudioGridSurface {...grid} />

      <StudioOperationsRail {...operations} />
    </>
  );
};
