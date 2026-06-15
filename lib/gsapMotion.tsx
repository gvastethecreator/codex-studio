import React, {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
} from 'react';

type MotionValue = number | string;

type MotionState = {
  opacity?: number;
  scale?: number;
  x?: MotionValue;
  y?: MotionValue;
  width?: MotionValue;
  height?: MotionValue;
  filter?: string;
  rotate?: MotionValue;
  zIndex?: number;
  transformOrigin?: string;
  transition?: MotionTransition;
};

type VariantResolver = MotionState | ((custom: never) => MotionState);

type MotionTransitionValue = {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: 'spring' | 'tween';
  stiffness?: number;
  damping?: number;
};

type MotionTransition = MotionTransitionValue | Record<string, MotionTransitionValue>;

type MotionProps = {
  initial?: false | string | MotionState;
  animate?: string | MotionState;
  exit?: string | MotionState;
  variants?: Variants;
  custom?: unknown;
  transition?: MotionTransition;
  layout?: boolean;
  onAnimationComplete?: () => void;
};

type PresenceConfig = {
  initial: boolean;
  custom?: unknown;
};

type MotionRenderableState = false | string | MotionState | undefined;

type MotionTag = 'div' | 'button';
type GsapTween = { kill?: () => void };
type GsapContext = { revert?: () => void };
type GsapLike = {
  set: (target: Element, vars: Record<string, unknown>) => void;
  to: (target: Element, vars: Record<string, unknown>) => GsapTween;
  context?: (callback: () => void, scope?: Element | null) => GsapContext;
};

let gsapLoader: Promise<GsapLike> | null = null;

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

const defaultPresenceConfig: PresenceConfig = {
  initial: true,
  custom: undefined,
};

const PresenceConfigContext = createContext<PresenceConfig>(defaultPresenceConfig);

function loadGsap() {
  gsapLoader ??= import('./motionRuntime').then((module) => {
    return module.default as GsapLike;
  });

  return gsapLoader;
}

/**
 * Mirror a forwarded ref into both callback refs and mutable ref objects.
 */
function assignRef<T>(ref: Ref<T | null> | undefined, value: T | null) {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
}

/**
 * Narrow a Motion transition object away from the per-property transition map.
 */
function isTransitionValue(transition?: MotionTransition): transition is MotionTransitionValue {
  if (!transition) return false;

  return ['duration', 'delay', 'ease', 'type', 'stiffness', 'damping'].some(
    (key) => key in transition,
  );
}

/**
 * Normalize Framer-style ease values into GSAP eases.
 */
function normalizeEase(ease?: MotionTransitionValue['ease']) {
  if (Array.isArray(ease)) return 'power3.out';
  if (!ease) return 'power2.out';

  if (ease === 'easeOut') return 'power2.out';
  if (ease === 'easeIn') return 'power2.in';
  if (ease === 'easeInOut') return 'power2.inOut';

  return ease;
}

/**
 * Collapse either a single transition or a property transition map into the
 * subset of values the GSAP adapter currently applies.
 */
function normalizeTransition(transition?: MotionTransition) {
  if (!transition) {
    return { duration: 0.28, delay: 0, ease: 'power2.out' };
  }

  if (isTransitionValue(transition)) {
    return {
      duration: transition.duration ?? (transition.type === 'spring' ? 0.42 : 0.28),
      delay: transition.delay ?? 0,
      ease: transition.type === 'spring' ? 'power3.out' : normalizeEase(transition.ease),
    };
  }

  const values = Object.values(transition);
  const first = values[0];
  const longestDuration = values.reduce((duration, entry) => {
    return Math.max(duration, entry.duration ?? 0);
  }, 0);
  const longestDelay = values.reduce((delay, entry) => {
    return Math.max(delay, entry.delay ?? 0);
  }, 0);

  return {
    duration: longestDuration || (first?.type === 'spring' ? 0.42 : 0.28),
    delay: longestDelay,
    ease: first?.type === 'spring' ? 'power3.out' : normalizeEase(first?.ease),
  };
}

/**
 * Resolve a named variant or inline state into a concrete animation payload.
 */
function resolveState(
  state: MotionRenderableState,
  variants: Variants | undefined,
  custom: unknown,
) {
  if (state == null || state === false) return null;

  if (typeof state === 'string') {
    const variant = variants?.[state];
    if (!variant) return null;
    return typeof variant === 'function' ? variant(custom as never) : variant;
  }

  return state;
}

function stripTransition(state: MotionState | null | undefined) {
  if (!state) return null;

  const { transition, ...values } = state;
  return {
    values,
    transition,
  };
}

/**
 * Create a tiny `motion.*` compatible primitive backed by GSAP.
 */
function createMotionComponent<Tag extends MotionTag>(tagName: Tag) {
  type ElementType = Tag extends 'button' ? HTMLButtonElement : HTMLDivElement;
  type Props = ComponentPropsWithoutRef<Tag> & MotionProps & { ref?: Ref<ElementType> };

  return function GsapMotionComponent({
    initial,
    animate,
    exit: _exit,
    variants,
    custom,
    transition,
    layout: _layout,
    onAnimationComplete,
    style,
    ref: forwardedRef,
    ...rest
  }: Props) {
    const elementRef = useRef<ElementType | null>(null);
    const hasAnimatedRef = useRef(false);
    const presenceConfig = use(PresenceConfigContext);
    const resolvedCustom = custom ?? presenceConfig.custom;

    const initialState = useMemo(
      () => stripTransition(resolveState(initial, variants, resolvedCustom)),
      [initial, variants, resolvedCustom],
    );
    const animateState = useMemo(
      () => stripTransition(resolveState(animate, variants, resolvedCustom)),
      [animate, variants, resolvedCustom],
    );
    const mergedTransition = useMemo(
      () => normalizeTransition(animateState?.transition ?? transition),
      [animateState?.transition, transition],
    );
    const setRefs = useCallback(
      (value: ElementType | null) => {
        elementRef.current = value;
        assignRef(forwardedRef, value);
      },
      [forwardedRef],
    );
    const initialStateKey = JSON.stringify(initialState);
    const animateStateKey = JSON.stringify(animateState);
    const mergedTransitionKey = JSON.stringify(mergedTransition);

    useIsomorphicLayoutEffect(() => {
      let isCancelled = false;
      let tween: GsapTween | undefined;
      let context: GsapContext | undefined;

      void loadGsap().then((gsap) => {
        const element = elementRef.current;
        if (isCancelled || !element || !animateState) return;

        const runAnimation = () => {
          const shouldSkipInitial = !hasAnimatedRef.current && presenceConfig.initial === false;
          const startValues = shouldSkipInitial ? animateState.values : initialState?.values;

          if (startValues) {
            gsap.set(element, startValues as Record<string, unknown>);
          }

          if (!shouldSkipInitial || hasAnimatedRef.current) {
            tween = gsap.to(element, {
              ...(animateState.values as Record<string, unknown>),
              duration: mergedTransition.duration,
              delay: mergedTransition.delay,
              ease: mergedTransition.ease,
              overwrite: 'auto',
              onComplete: onAnimationComplete,
            });
          }

          if (shouldSkipInitial) {
            onAnimationComplete?.();
          }

          hasAnimatedRef.current = true;
        };

        context = gsap.context ? gsap.context(runAnimation, element) : undefined;
        if (!context) runAnimation();
      });

      return () => {
        isCancelled = true;
        context?.revert?.();
        tween?.kill?.();
      };
    }, [
      initialStateKey,
      animateStateKey,
      mergedTransitionKey,
      presenceConfig.initial,
      onAnimationComplete,
    ]);

    if (tagName === 'button') {
      return (
        <button
          type="button"
          {...(rest as ComponentPropsWithoutRef<'button'>)}
          ref={setRefs as Ref<HTMLButtonElement>}
          style={style}
        />
      );
    }

    return (
      <div
        {...(rest as ComponentPropsWithoutRef<'div'>)}
        ref={setRefs as Ref<HTMLDivElement>}
        style={style}
      />
    );
  };
}

/**
 * Minimal presence wrapper backed by context so existing components can opt out
 * of the first mount animation while the project transitions away from
 * `motion/react`.
 */
export function AnimatePresence({
  children,
  initial = true,
  custom,
}: PropsWithChildren<{
  initial?: boolean;
  mode?: 'wait' | 'sync' | 'popLayout';
  custom?: unknown;
}>) {
  const value = useMemo(() => ({ initial, custom }), [initial, custom]);
  return (
    <PresenceConfigContext.Provider value={value}>
      <>{children}</>
    </PresenceConfigContext.Provider>
  );
}

// react-doctor-disable-next-line react-doctor/only-export-components -- factory-created React components
export const MotionDiv = createMotionComponent('div');
// react-doctor-disable-next-line react-doctor/only-export-components -- factory-created React components
export const MotionButton = createMotionComponent('button');

export type Variants = Record<string, VariantResolver>;
export type MotionComponentChildren = ReactNode;
