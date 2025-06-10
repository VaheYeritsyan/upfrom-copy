import { useContext } from 'react';
import { DefaultAuthContext } from '~Context/AuthContext';

export const useAuthContext = () => {
  const authContext = useContext(DefaultAuthContext);
  return { ...authContext };
};
