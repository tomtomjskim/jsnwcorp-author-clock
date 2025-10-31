import { useEffect, useRef } from 'react';

interface UseDoubleClickOptions {
  onDoubleClick: () => void;
  excludeSelectors?: string[];
  delay?: number;
}

/**
 * Custom hook for handling double-click/double-tap events
 * Excludes specified elements (buttons, links, inputs by default)
 */
export function useDoubleClick({
  onDoubleClick,
  excludeSelectors = ['button', 'a', 'input', 'textarea', 'select'],
  delay = 300,
}: UseDoubleClickOptions) {
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;

      // Check if the click is on an excluded element
      const isExcluded = excludeSelectors.some((selector) => {
        return target.closest(selector) !== null;
      });

      if (isExcluded) {
        return;
      }

      clickCount.current += 1;

      if (clickCount.current === 1) {
        // Start timer for first click
        clickTimer.current = setTimeout(() => {
          clickCount.current = 0;
        }, delay);
      } else if (clickCount.current === 2) {
        // Double click detected
        if (clickTimer.current) {
          clearTimeout(clickTimer.current);
        }
        clickCount.current = 0;
        onDoubleClick();
      }
    };

    // Listen for both mouse and touch events
    document.addEventListener('click', handleClick);
    document.addEventListener('touchend', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchend', handleClick);
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
    };
  }, [onDoubleClick, excludeSelectors, delay]);
}
