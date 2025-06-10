import React, { FC } from 'react';
import { Control, RegisterOptions } from 'react-hook-form';
import { organizationValuesRules, OrganizationFormValues } from '~/util/validation';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { InputComponent } from '~/components/Input/InputComponent';

export type CreateOrganizationArgs = OrganizationFormValues;

type Props = {
  control: Control<CreateOrganizationArgs>;
  isOpen: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  onSubmit: () => void;
};

export const CreateOrganizationModalComponent: FC<Props> = ({ control, isOpen, isLoading, onClose, onSubmit }) => (
  <ActionModalComponent
    title="Creating an organization"
    isOpen={isOpen}
    actionText="Create"
    isLoading={isLoading}
    onSubmit={onSubmit}
    onClose={onClose}>
    <InputComponent
      control={control}
      name="name"
      label="Name"
      size="small"
      variant="outlined"
      type="text"
      placeholder="Organization Name"
      rules={organizationValuesRules.name as RegisterOptions<CreateOrganizationArgs>}
    />
    <InputComponent
      control={control}
      name="details"
      label="Details"
      size="small"
      multiline
      minRows={2}
      maxRows={6}
      variant="outlined"
      type="text"
      placeholder="Organization Details"
      rules={organizationValuesRules.details as RegisterOptions<CreateOrganizationArgs>}
    />
  </ActionModalComponent>
);
