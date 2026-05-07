import React from 'react';
import { StudioImageOverlays } from './overlays/StudioImageOverlays';
import { StudioSystemOverlays } from './overlays/StudioSystemOverlays';
import { StudioWorkspaceOverlays } from './overlays/StudioWorkspaceOverlays';
import type {
  StudioImageOverlaysProps,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from './overlays/types';

export interface AppOverlaysProps {
  imageOverlays: StudioImageOverlaysProps;
  systemOverlays: StudioSystemOverlaysProps;
  workspaceOverlays: StudioWorkspaceOverlaysProps;
}

export type {
  StudioImageOverlaysProps,
  StudioSystemOverlaysProps,
  StudioWorkspaceOverlaysProps,
} from './overlays/types';

export const AppOverlays: React.FC<AppOverlaysProps> = ({
  imageOverlays,
  systemOverlays,
  workspaceOverlays,
}) => {
  return (
    <>
      <StudioImageOverlays {...imageOverlays} />
      <StudioSystemOverlays {...systemOverlays} />
      <StudioWorkspaceOverlays {...workspaceOverlays} />
    </>
  );
};
