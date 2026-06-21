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
interface IDBState<T> {
  value: T;
  initialized: boolean;
}

function useIndexedDBStorage<T>(
  key: string,
  initialValue: T,
  options: { prepareForPersist?: (value: T) => T } = {},
): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<IDBState<T>>({ value: initialValue, initialized: false });
  const timeoutRef = useRef<number | null>(null);
  const prepareForPersist = options.prepareForPersist;

  useEffect(() => {
    let isMounted = true;
    get<T>(key)
      .then((loaded) => {
        if (isMounted) {
          setState({
            value: loaded !== undefined ? loaded : initialValue,
            initialized: true,
          });
        }
      })
      .catch((error) => {
        runtimeLogger.error(`Error reading IndexedDB key "${key}"`, error);
        if (isMounted) setState((prev) => ({ ...prev, initialized: true }));
      });

    return () => {
      isMounted = false;
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setState((prev) => ({
          ...prev,
          value: value instanceof Function ? value(prev.value) : value,
        }));
      } catch (error) {
        runtimeLogger.error(`Error updating IndexedDB-backed state for "${key}"`, error);
      }
    },
    [key],
  );

  useEffect(() => {
    if (!state.initialized) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      const value = prepareForPersist ? prepareForPersist(state.value) : state.value;
      set(key, value).catch((error) => {
        runtimeLogger.error(`Error setting IndexedDB key "${key}"`, error);
      });
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, prepareForPersist, state.value, state.initialized]);

  return [state.value, setValue];
}

export default useIndexedDBStorage;
