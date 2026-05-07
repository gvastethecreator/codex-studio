import { flushSync } from 'react-dom';

export let isGlobalTransitioning = false;

export const setIsGlobalTransitioning = (value: boolean) => {
  isGlobalTransitioning = value;
};

export const startViewTransition = (callback: () => void) => {
  if (
    isGlobalTransitioning ||
    !document.startViewTransition ||
    document.visibilityState !== 'visible'
  ) {
    callback();
    return;
  }

  isGlobalTransitioning = true;
  const transition = document.startViewTransition(() => {
    flushSync(() => {
      callback();
    });
  });

  transition.ready.catch(() => {});
  transition.finished.catch(() => {});

  transition.finished.finally(() => {
    isGlobalTransitioning = false;
  });

  return transition;
};
