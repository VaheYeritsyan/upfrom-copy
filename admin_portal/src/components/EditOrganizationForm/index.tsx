import React, { FC } from 'react';
import { Box } from '@mui/material';
import { Control, RegisterOptions } from 'react-hook-form';
import { InputComponent } from '~/components/Input/InputComponent';
import { organizationValuesRules, OrganizationFormValues } from '~/util/validation';
import styles from './editOrganizationForm.module.scss';

export type EditOrganizationArgs = OrganizationFormValues;

type Props = {
  control: Control<EditOrganizationArgs>;
};

export const EditOrganizationForm: FC<Props> = ({ control }) => (
  <Box className={styles.inputContainer}>
    <InputComponent
      control={control}
      name="name"
      label="Name"
      size="medium"
      variant="outlined"
      placeholder="Name"
      rules={organizationValuesRules.name as RegisterOptions<EditOrganizationArgs>}
      fullWidth
    />
    <InputComponent
      control={control}
      multiline
      name="details"
      label="Details"
      size="medium"
      minRows={1}
      maxRows={6}
      variant="outlined"
      placeholder="Details"
      rules={organizationValuesRules.details as RegisterOptions<EditOrganizationArgs>}
      fullWidth
    />
  </Box>
);
