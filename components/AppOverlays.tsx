import React from 'react';
import { StudioConfirmationOverlay } from './overlays/StudioConfirmationOverlay';
import { StudioImageOverlays } from './overlays/StudioImageOverlays';
import { StudioSystemOverlays } from './overlays/StudioSystemOverlays';
import { StudioWorkspaceOverlays } from './overlays/StudioWorkspaceOverlays';
import type {
  StudioConfirmationOverlayProps,
  StudioImageOverlaysProps,
  StudioOverlayController,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from './overlays/types';

export interface AppOverlaysProps {
  controller: StudioOverlayController;
}

export type {
  StudioConfirmationOverlayProps,
  StudioImageOverlaysProps,
  StudioOverlayController,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from './overlays/types';

export const AppOverlays: React.FC<AppOverlaysProps> = ({ controller }) => {
  const { imageOverlays, systemOverlays, workspaceOverlays, confirmationOverlay } = controller;

  return (
    <>
      <StudioImageOverlays {...imageOverlays} />
      <StudioSystemOverlays {...systemOverlays} />
      <StudioWorkspaceOverlays {...workspaceOverlays} />
      <StudioConfirmationOverlay {...confirmationOverlay} />
    </>
  );
};
