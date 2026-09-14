import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

export const RecipeWorkbenchContext = createContext<{
  controls: HTMLElement | null;
  action: HTMLElement | null;
}>({ controls: null, action: null });

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
