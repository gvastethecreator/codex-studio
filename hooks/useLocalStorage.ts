import { useState, useEffect, useCallback } from 'react';
import { runtimeLogger } from '../utils/runtimeLogger';

/**
 * Persist a React state value in `localStorage` while keeping the API aligned
 * with `useState`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      runtimeLogger.warn(`Error reading localStorage key "${key}"`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(value);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      runtimeLogger.warn(`Error setting localStorage key "${key}"`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
