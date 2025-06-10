import { useState } from 'react';
import { useForegroundEffect } from '~Hooks/useForegroundEffect';
import { useBackgroundEffect } from '~Hooks/useBackgroundEffect';

export const useAppState = () => {
  const [isInForeground, setIsInForeground] = useState(true);

  useForegroundEffect(() => {
    setIsInForeground(true);
  });

  useBackgroundEffect(() => {
    setIsInForeground(false);
  });

  return { isInForeground };
};
