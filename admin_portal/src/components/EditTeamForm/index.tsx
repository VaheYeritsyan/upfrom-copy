import React, { FC } from 'react';
import { Box } from '@mui/material';
import { Organization } from '@up-from/graphql-ap/genql';
import { Control, RegisterOptions } from 'react-hook-form';
import { InputComponent } from '~/components/Input/InputComponent';
import { teamValuesRules, TeamFormValues } from '~/util/validation';
import styles from './editTeamForm.module.scss';
import { filterOrganizationOptions } from '~/util/autocomplete';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';

export type EditTeamArgs = TeamFormValues & {
  organization: Organization | null;
};

type Props = {
  control: Control<EditTeamArgs>;
  organizations: Organization[];
  isOrganizationsLoading?: boolean;
};

export const EditTeamForm: FC<Props> = ({ control, isOrganizationsLoading, organizations }) => (
  <Box className={styles.inputContainer}>
    <InputComponent
      control={control}
      name="name"
      label="Name"
      size="small"
      variant="outlined"
      placeholder="Name"
      rules={teamValuesRules.name as RegisterOptions<EditTeamArgs>}
      fullWidth
      //className={styles.inputBlock}
    />
    <InputComponent
      control={control}
      multiline
      name="description"
      label="Description"
      size="small"
      minRows={1}
      maxRows={6}
      variant="outlined"
      placeholder="Description"
      rules={teamValuesRules.description as RegisterOptions<EditTeamArgs>}
      fullWidth
    />

    <AutocompleteInputComponent
      control={control}
      name="organization"
      label="Organization"
      size="small"
      isOptionEqualToValue={(option, value) => option.id === value.id}
      isLoading={isOrganizationsLoading}
      getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
      filterOptions={filterOrganizationOptions}
      variant="outlined"
      options={organizations}
      rules={{ required: 'Required' }}
      renderOption={(props, org) => (
        <AutocompleteInputOptionComponent {...props} key={org.id} title={org.name} subtitle={org.id} withoutImg />
      )}
    />
  </Box>
);
