import React, { useEffect, useState } from 'react';
import { Admin } from '@up-from/graphql-ap/genql';
import { useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';
import { useAdminMutations } from '~/api/useAdminMutations';
import { emailRegExp } from '~/util/validation';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { InputComponent } from '~/components/Input/InputComponent';
import { DisabledActions } from '~/types/table';

enum AdminActions {
  ENABLE = 'Enable',
  DISABLE = 'Disable',
}

type NewAdminFormValues = {
  name: string;
  email: string;
};

const actions = Object.values(AdminActions);
const disabledActions: DisabledActions<AdminActions, Admin> = {
  [AdminActions.ENABLE]: { isDisabled: false },
  [AdminActions.DISABLE]: { isDisabled: true },
};

const validateEmail = (value?: string | null) => {
  if (!value) return 'Required';

  return emailRegExp.test(value) ? undefined : 'Email is invalid';
};

export const useAdminsTableActions = () => {
  const [isAddNewAdminModalVisible, setIsAddNewAdminModalVisible] = useState(false);
  const [idsToDisable, setIdsToDisable] = useState<string[]>([]);
  const [idsToEnable, setIdsToEnable] = useState<string[]>([]);

  const { disableAdmin, createAdmin, enableAdmin, loadingIds } = useAdminMutations();

  const { control, handleSubmit, reset } = useForm<NewAdminFormValues>();

  useEffect(() => {
    reset({ email: '' });
  }, [isAddNewAdminModalVisible]);

  const handleAddNewAdminClick = () => {
    setIsAddNewAdminModalVisible(true);
  };

  const handleAddNewAdminModalClose = () => {
    setIsAddNewAdminModalVisible(false);
  };

  const createNewAdmin = async (state: NewAdminFormValues) => {
    await createAdmin.create(state, () => {
      setIsAddNewAdminModalVisible(false);
    });
  };

  const handleActionClick = async (action: AdminActions, ids: string[]) => {
    switch (action) {
      case AdminActions.DISABLE:
        await setIdsToDisable(ids);
        return;

      case AdminActions.ENABLE:
        await setIdsToEnable(ids);
        return;

      default:
        return;
    }
  };

  const handleConfirmDisableActionClick = async () => {
    await disableAdmin.disableAll(idsToDisable);
    setIdsToDisable([]);
  };

  const handleCloseDisableConfirmationModal = async () => {
    setIdsToDisable([]);
  };

  const handleConfirmEnableActionClick = async () => {
    await enableAdmin.enableAll(idsToEnable);
    setIdsToEnable([]);
  };

  const handleCloseEnableConfirmationModal = async () => {
    setIdsToEnable([]);
  };

  const modalsNode = (
    <>
      <ActionModalComponent
        title="Whitelisting an admin"
        isOpen={isAddNewAdminModalVisible}
        actionText="Whitelist"
        isLoading={createAdmin.fetching}
        onSubmit={handleSubmit(createNewAdmin)}
        onClose={handleAddNewAdminModalClose}>
        <InputComponent
          control={control}
          name="name"
          label="Name"
          size="small"
          variant="outlined"
          type="text"
          placeholder="Admin Name"
        />
        <InputComponent
          control={control}
          name="email"
          label="Email"
          size="small"
          variant="outlined"
          type="email"
          autoComplete="email"
          placeholder="example@example.example"
          rules={{ validate: validateEmail }}
        />
      </ActionModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToDisable.length}
        actionText="Disable"
        isLoading={disableAdmin.fetching}
        onActionClick={handleConfirmDisableActionClick}
        onClose={handleCloseDisableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to disable all the selected admin accounts?</Typography>
        <Typography variant="body1">
          Selected admins: <strong>{idsToDisable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By disabling, selected admins will not be able to login to the admin portal.
        </Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToEnable.length}
        actionText="Enable"
        buttonColor="success"
        isLoading={enableAdmin.fetching}
        onActionClick={handleConfirmEnableActionClick}
        onClose={handleCloseEnableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to enable all the selected admin accounts?</Typography>
        <Typography variant="body1">
          Selected admins: <strong>{idsToEnable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By enabling, selected admins will be able to login to the admin portal.
        </Typography>
      </ConfirmationModalComponent>
    </>
  );

  return {
    actions,
    disabledActions,
    loadingIds,
    modalsNode,
    handleActionClick,
    handleAddNewAdminClick,
  };
};
