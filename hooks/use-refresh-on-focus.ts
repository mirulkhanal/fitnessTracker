import { useFocusEffect } from 'expo-router';
import { DependencyList, useCallback, useEffect } from 'react';

export const useRefreshOnFocus = (refresh: () => void | Promise<void>, deps: DependencyList) => {
  const runRefresh = useCallback(() => {
    void refresh();
  }, deps);

  useEffect(() => {
    runRefresh();
  }, [runRefresh]);

  useFocusEffect(
    useCallback(() => {
      runRefresh();
      return undefined;
    }, [runRefresh])
  );
};
