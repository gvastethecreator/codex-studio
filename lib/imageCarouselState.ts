export type ImageCarouselState = {
  direction: number;
  isSliding: boolean;
  isFullscreen: boolean;
  copiedPrompt: boolean;
  isComparing: boolean;
};

export function finishCarouselSlideState(state: ImageCarouselState): ImageCarouselState {
  return state.isSliding ? { ...state, isSliding: false } : state;
}
