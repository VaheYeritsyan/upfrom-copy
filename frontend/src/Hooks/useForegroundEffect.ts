import { useEffect } from 'react';
import { AppState } from 'react-native';

export const useForegroundEffect = (callback: () => void) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') return;

      callback();
    });

    return () => {
      subscription.remove();
    };
  }, [callback]);
};
