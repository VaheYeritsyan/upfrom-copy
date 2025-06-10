import { useContext } from 'react';
import { OrganizationsModalsContext } from '~Context/OrganizationModalsContext';

export const useOrganizationModalsContext = () => {
  const organizationModalsContext = useContext(OrganizationsModalsContext);

  if (!organizationModalsContext) {
    throw new Error('useOrganizationModalsContext should be used only inside <OrganizationsModalsContextProvider>');
  }

  return { ...organizationModalsContext };
};
