import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

let reducedMotion = false;
let initialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function initialize() {
  if (initialized) return;
  initialized = true;
  AccessibilityInfo.isReduceMotionEnabled()
    .then((enabled) => {
      reducedMotion = enabled;
      notifyListeners();
    })
    .catch(() => undefined);

  AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
    reducedMotion = enabled;
    notifyListeners();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initialize();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return reducedMotion;
}

/** Keep decorative motion optional for users who request reduced motion. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
