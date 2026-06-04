import { useFocusEffect } from 'expo-router';
import { DependencyList, useCallback, useRef } from 'react';

/**
 * Refreshes when the screen gains focus (including first open).
 * Does not also run a separate mount effect — that caused duplicate loads and image flicker.
 */
export const useRefreshOnFocus = (refresh: () => void | Promise<void>, deps: DependencyList) => {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useFocusEffect(
    useCallback(() => {
      void refreshRef.current();
      return undefined;
    }, deps)
  );
};
