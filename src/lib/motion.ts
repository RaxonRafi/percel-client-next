import { animate, hover, inView, scroll } from 'motion';

export { stagger } from 'motion';

export const EASE = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: 'spring', stiffness: 260, damping: 22 } as const;
export const VIEW = { amount: 0.25, margin: '0px 0px -8% 0px' } as const;

/** False with reduced motion on — the root layout only sets the class otherwise. */
export function motionEnabled(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('js-motion')
  );
}

export const $ = <T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
) => root.querySelector<T>(selector);

export const $$ = <T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
) => [...root.querySelectorAll<T>(selector)];

export const wait = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

/**
 * Collects everything an effect starts — animations, observers, timers — so a
 * single `stop()` from the effect's cleanup tears all of it down. Without this
 * a client-side navigation would leave loops running against detached nodes.
 */
export function createMotionScope() {
  const cleanups: (() => void)[] = [];
  let alive = true;

  const scopedAnimate = ((...args: Parameters<typeof animate>) => {
    const controls = animate(...args);
    cleanups.push(() => controls.stop());
    return controls;
  }) as typeof animate;

  return {
    /** False once the owning component has unmounted. */
    get alive() {
      return alive;
    },
    animate: scopedAnimate,
    /** Resolves when the animation completes (never, if it is stopped first). */
    done: (controls: ReturnType<typeof animate>) =>
      new Promise<void>((resolve) => {
        controls.then(() => resolve());
      }),
    inView(
      target: Element | string | null,
      onEnter: () => void,
      options?: Parameters<typeof inView>[2],
    ) {
      if (!target) return;
      cleanups.push(inView(target, () => onEnter(), options));
    },
    scroll(...args: Parameters<typeof scroll>) {
      cleanups.push(scroll(...args));
    },
    hover(...args: Parameters<typeof hover>) {
      cleanups.push(hover(...args));
    },
    interval(fn: () => void, ms: number) {
      const id = setInterval(fn, ms);
      cleanups.push(() => clearInterval(id));
    },
    timeout(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      cleanups.push(() => clearTimeout(id));
    },
    stop() {
      alive = false;
      cleanups.forEach((fn) => fn());
    },
  };
}

export type MotionScope = ReturnType<typeof createMotionScope>;
