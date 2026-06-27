// react-doctor-disable-next-line react-doctor/no-flush-sync
import { flushSync } from 'react-dom';

export let isGlobalTransitioning = false;

export const setIsGlobalTransitioning = (value: boolean) => {
  isGlobalTransitioning = value;
};

export interface StartViewTransitionOptions {
  useNative?: boolean;
}

export const startViewTransition = (
  callback: () => void,
  options: StartViewTransitionOptions = {},
) => {
  if (
    !options.useNative ||
    isGlobalTransitioning ||
    !document.startViewTransition ||
    document.visibilityState !== 'visible'
  ) {
    callback();
    return;
  }

  isGlobalTransitioning = true;

  // react-doctor-disable-next-line react-doctor/no-document-start-view-transition
  const transition = document.startViewTransition(() => {
    // react-doctor-disable-next-line react-doctor/no-flush-sync
    flushSync(() => {
      callback();
    });
  });

  transition.ready.catch(() => {});
  transition.finished.catch(() => {});

  void transition.finished.finally(() => {
    isGlobalTransitioning = false;
  });

  return transition;
};
