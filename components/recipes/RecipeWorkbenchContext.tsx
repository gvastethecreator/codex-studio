import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

export type CanvasCompareChrome = {
  showReference: boolean;
  toggle: () => void;
} | null;

export const RecipeWorkbenchContext = createContext<{
  controls: HTMLElement | null;
  action: HTMLElement | null;
  overlay: HTMLElement | null;
  sidePanel: HTMLElement | null;
  compare: CanvasCompareChrome;
  setCompare: (compare: CanvasCompareChrome) => void;
}>({
  controls: null,
  action: null,
  overlay: null,
  sidePanel: null,
  compare: null,
  setCompare: () => {},
});

export function RecipeControls({ children }: { children: React.ReactNode }) {
  const { controls } = useContext(RecipeWorkbenchContext);
  return controls
    ? createPortal(<section className="recipe-controls">{children}</section>, controls)
    : children;
}

export function RecipePrimaryAction({ children }: { children: React.ReactNode }) {
  const { action } = useContext(RecipeWorkbenchContext);
  return action ? createPortal(children, action) : children;
}

export function RecipeOverlay({ children }: { children: React.ReactNode }) {
  const { overlay } = useContext(RecipeWorkbenchContext);
  return overlay ? createPortal(children, overlay) : children;
}

export function RecipeSidePanel({ children }: { children: React.ReactNode }) {
  const { sidePanel } = useContext(RecipeWorkbenchContext);
  return sidePanel ? createPortal(children, sidePanel) : null;
}
