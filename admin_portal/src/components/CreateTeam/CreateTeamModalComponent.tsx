import React, { FC } from 'react';
import { Control, Controller, RegisterOptions } from 'react-hook-form';
import { ImageCropperShape } from '~/types/image';
import { teamValuesRules, TeamFormValues } from '~/util/validation';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { ImageEditorComponent } from '~/components/Image/ImageEditorComponent';
import { InputComponent } from '~/components/Input/InputComponent';
import styles from './create-team-modal.module.scss';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { filterOrganizationOptions } from '~/util/autocomplete';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import { Organization } from '@up-from/repository/src/rds/sql.generated';

export type CreateTeamArgs = TeamFormValues & {
  image?: Blob | null;
  organization?: Organization | null;
};

type Props = {
  control: Control<CreateTeamArgs>;
  isOpen: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  onSubmit: () => void;
  organizations: Organization[];
  isOrganizationDisabled: boolean;
  isOrganizationsLoading?: boolean;
};

export const CreateTeamModalComponent: FC<Props> = ({
  control,
  isOpen,
  isLoading,
  isOrganizationsLoading,
  isOrganizationDisabled,
  organizations,
  onClose,
  onSubmit,
}) => (
  <ActionModalComponent
    title="Creating a team"
    isOpen={isOpen}
    actionText="Create"
    isLoading={isLoading}
    onSubmit={onSubmit}
    onClose={onClose}>
    <Controller
      name="image"
      control={control}
      render={({ field }) => (
        <ImageEditorComponent
          shape={ImageCropperShape.SQUARE}
          src={field.value}
          className={styles.createTeamModalFormImage}
          onSave={field.onChange}
          onRemove={() => field.onChange(null)}
        />
      )}
    />

    <AutocompleteInputComponent
      control={control}
      name="organization"
      label="Organization"
      size="small"
      disabled={isOrganizationDisabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      isLoading={isOrganizationsLoading}
      getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
      filterOptions={filterOrganizationOptions}
      variant="outlined"
      options={organizations}
      rules={{ required: 'Required' }}
      renderOption={(props, org) => (
        <AutocompleteInputOptionComponent {...props} withoutImg key={org.id} title={org.name} subtitle={org.id} />
      )}
    />

    <InputComponent
      control={control}
      name="name"
      label="Name"
      size="small"
      variant="outlined"
      type="text"
      placeholder="Team Name"
      rules={teamValuesRules.name as RegisterOptions<CreateTeamArgs>}
    />
    <InputComponent
      control={control}
      name="description"
      label="Description"
      size="small"
      multiline
      minRows={2}
      maxRows={6}
      variant="outlined"
      type="text"
      placeholder="Team Description"
      rules={teamValuesRules.description as RegisterOptions<CreateTeamArgs>}
    />
  </ActionModalComponent>
);
