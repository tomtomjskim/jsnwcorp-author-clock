import { useState, useEffect, useCallback } from 'react';

interface UseIdleDetectionOptions {
  idleTimeout?: number; // Timeout in milliseconds
  showOnBottomZone?: boolean; // Show when cursor enters bottom zone
  bottomZonePercentage?: number; // Percentage of screen height for bottom zone
}

/**
 * Custom hook for detecting user inactivity
 * Shows controls on activity, hides after idle timeout
 */
export function useIdleDetection({
  idleTimeout = 3000,
  showOnBottomZone = true,
  bottomZonePercentage = 20,
}: UseIdleDetectionOptions = {}) {
  const [isIdle, setIsIdle] = useState(false);
  const [isInBottomZone, setIsInBottomZone] = useState(false);

  // Check if mouse is in bottom zone
  const checkBottomZone = useCallback(
    (clientY: number) => {
      const windowHeight = window.innerHeight;
      const bottomZoneStart = windowHeight * (1 - bottomZonePercentage / 100);
      return clientY >= bottomZoneStart;
    },
    [bottomZonePercentage]
  );

  useEffect(() => {
    let idleTimer: number | null = null;

    const resetIdleTimer = () => {
      setIsIdle(false);

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeout);
    };

    const handleActivity = () => {
      resetIdleTimer();
    };

    const handleMouseMove = (event: MouseEvent) => {
      resetIdleTimer();

      // Check if mouse is in bottom zone
      if (showOnBottomZone) {
        const inBottomZone = checkBottomZone(event.clientY);
        setIsInBottomZone(inBottomZone);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      resetIdleTimer();

      // Check if touch is in bottom zone
      if (showOnBottomZone && event.touches.length > 0) {
        const touch = event.touches[0];
        const inBottomZone = checkBottomZone(touch.clientY);
        setIsInBottomZone(inBottomZone);
      }
    };

    // Start idle timer
    resetIdleTimer();

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('wheel', handleActivity);

    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleActivity);
    };
  }, [idleTimeout, showOnBottomZone, checkBottomZone]);

  // Controls should be visible if:
  // 1. Not idle OR
  // 2. In bottom zone
  const shouldShowControls = !isIdle || isInBottomZone;

  return {
    isIdle,
    isInBottomZone,
    shouldShowControls,
  };
}
