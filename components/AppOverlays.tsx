import React from 'react';
import { StudioConfirmationOverlay } from './overlays/StudioConfirmationOverlay';
import { StudioImageOverlays } from './overlays/StudioImageOverlays';
import { StudioSystemOverlays } from './overlays/StudioSystemOverlays';
import { StudioWorkspaceOverlays } from './overlays/StudioWorkspaceOverlays';
import type {
  StudioConfirmationOverlayProps,
  StudioImageOverlaysProps,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from './overlays/types';

export interface AppOverlaysProps {
  imageOverlays: StudioImageOverlaysProps;
  systemOverlays: StudioSystemOverlaysProps;
  workspaceOverlays: StudioWorkspaceOverlaysProps;
  confirmationOverlay: StudioConfirmationOverlayProps;
}

export type {
  StudioConfirmationOverlayProps,
  StudioImageOverlaysProps,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from './overlays/types';

export const AppOverlays: React.FC<AppOverlaysProps> = ({
  imageOverlays,
  systemOverlays,
  workspaceOverlays,
  confirmationOverlay,
}) => {
  return (
    <>
      <StudioImageOverlays {...imageOverlays} />
      <StudioSystemOverlays {...systemOverlays} />
      <StudioWorkspaceOverlays {...workspaceOverlays} />
      <StudioConfirmationOverlay {...confirmationOverlay} />
    </>
  );
};
