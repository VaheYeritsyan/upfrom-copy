import { useEffect } from 'react';
import { AppState } from 'react-native';

export const useBackgroundEffect = (callback: () => void) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'background') return;

      callback();
    });

    return () => {
      subscription.remove();
    };
  }, [callback]);
};
