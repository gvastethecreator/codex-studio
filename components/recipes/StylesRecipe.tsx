import React from 'react';
import { LazySurfaceFallback } from '../ui/LazySurfaceFallback';
import type { StylesBrowserProps } from './StylesBrowser';

export type StylesRecipeProps = StylesBrowserProps;

const StylesBrowser = React.lazy(() =>
  import('./StylesBrowser').then((module) => ({
    default: module.StylesBrowser,
  })),
);

export const StylesRecipe: React.FC<StylesRecipeProps> = (props) => {
  return (
    <React.Suspense fallback={<LazySurfaceFallback label="Loading styles" />}>
      <StylesBrowser {...props} />
    </React.Suspense>
  );
};
