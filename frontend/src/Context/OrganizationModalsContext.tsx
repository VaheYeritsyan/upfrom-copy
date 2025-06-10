import React, { ReactNode, createContext, useState, Dispatch, SetStateAction } from 'react';
import { Organization } from '@up-from/graphql/genql';
import { OrganizationDetailsModal } from '~Components/Organizations/OrganizationDetailsModal';

type BriefOrganization = Pick<Organization, 'id' | 'name' | 'details'>;

interface IOrganizationsModalsContext {
  organizationMeta: BriefOrganization | null;
  setOrganizationMeta: Dispatch<SetStateAction<BriefOrganization | null>>;
}

export const OrganizationsModalsContext = createContext<IOrganizationsModalsContext | null>(null);

export const OrganizationsModalsContextProvider = ({ children }: { children: ReactNode }) => {
  const [organizationMeta, setOrganizationMeta] = useState<BriefOrganization | null>(null);

  const contextValue = {
    organizationMeta,
    setOrganizationMeta,
  };

  return (
    <OrganizationsModalsContext.Provider value={contextValue}>
      {children}

      <OrganizationDetailsModal />
    </OrganizationsModalsContext.Provider>
  );
};
