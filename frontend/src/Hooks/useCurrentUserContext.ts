import { useContext } from 'react';
import { CurrentUserContext } from '~Context/CurrentUserContext';

export const useCurrentUserContext = () => {
  const currentUserContext = useContext(CurrentUserContext);

  if (!currentUserContext) {
    throw new Error('useCurrentUserContext should be used only inside <CurrentUserContextProvider>');
  }

  return { ...currentUserContext };
};
