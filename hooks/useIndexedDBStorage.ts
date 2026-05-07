import { useState, useEffect, useCallback, useRef } from 'react';
import { get, set } from '../utils/idb';
import { runtimeLogger } from '../utils/runtimeLogger';

/**
 * A custom hook to manage state persistence in IndexedDB.
 * Includes debouncing for the database write operation to improve performance
 * during rapid state changes.
 *
 * @template T The type of the state to be stored.
 * @param {string} key The key to use in the IndexedDB key-value store.
 * @param {T} initialValue The initial value to use if no value is found in IndexedDB.
 * @returns A stateful value, and a function to update it, analogous to `useState`.
 */
function useIndexedDBStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Load from IDB on mount
  useEffect(() => {
    let isMounted = true;
    get<T>(key)
      .then((value) => {
        if (isMounted) {
          if (value !== undefined) {
            setStoredValue(value);
          }
          setIsInitialized(true);
        }
      })
      .catch((error) => {
        runtimeLogger.error(`Error reading IndexedDB key "${key}"`, error);
        if (isMounted) setIsInitialized(true);
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          return value instanceof Function ? value(prev) : value;
        });
      } catch (error) {
        runtimeLogger.error(`Error updating IndexedDB-backed state for "${key}"`, error);
      }
    },
    [key],
  );

  // Use an effect to save to IDB whenever storedValue changes
  useEffect(() => {
    if (!isInitialized) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      set(key, storedValue).catch((error) => {
        runtimeLogger.error(`Error setting IndexedDB key "${key}"`, error);
      });
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, storedValue, isInitialized]);

  return [storedValue, setValue];
}

export default useIndexedDBStorage;
