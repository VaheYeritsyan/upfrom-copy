import { useContext } from 'react';
import { BottomNavigationBadgesContext } from '~Context/BottomNavigationBadgesContext';

export const useBottomNavigationBadgesContext = () => {
  const bottomNavigationBadgesContext = useContext(BottomNavigationBadgesContext);

  if (!bottomNavigationBadgesContext) {
    throw new Error(
      'useBottomNavigationBadgesContext should be used only inside <BottomNavigationBadgesContextProvider>',
    );
  }

  return { ...bottomNavigationBadgesContext };
};
