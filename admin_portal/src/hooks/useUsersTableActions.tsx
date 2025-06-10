import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useUserMutations } from '~/api/useUsersMutations';
import { useAllUsersQuery } from '~/api/useAllUsersQuery';
import { useAllTeamsQuery } from '~/api/useAllTeamsQuery';
import { useToast } from '~/hooks/useToast';
import { CreateUserArgs, CreateUserModalComponent } from '~/components/CreateUser/CreateUserModalComponent';
import { ConfirmationModalComponent } from '~/components/Modal/ConfirmationModalComponent';
import { DisabledActions } from '~/types/table';
import { UserWithAttendance } from '~/types/eventUsers';
import { GQLLocationType } from '~/types/googlePlaces';

export enum UserActions {
  ENABLE = 'Enable',
  DISABLE = 'Disable',
}

enum UserRole {
  MEMBER = 'member',
  MENTOR = 'mentor',
}

enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
}

const actions = Object.values(UserActions);
const userRoleOptions = Object.values(UserRole).map(value => ({ label: value, value }));
const userGenderOptions = Object.values(UserGender).map(value => ({ label: value, value }));
const disabledActions: DisabledActions<UserActions, UserWithAttendance> = {
  [UserActions.ENABLE]: { isDisabled: false },
  [UserActions.DISABLE]: { isDisabled: true },
};

export const useUsersTableActions = (teamId?: string) => {
  const toast = useToast();

  const [isCreateUserModalVisible, setIsCreateUserModalVisible] = useState(false);
  const [idsToDisable, setIdsToDisable] = useState<string[]>([]);
  const [idsToEnable, setIdsToEnable] = useState<string[]>([]);

  const { createUser, disableUser, enableUser, loadingIds } = useUserMutations();

  const usersData = useAllUsersQuery();
  const teamsData = useAllTeamsQuery();

  const createForm = useForm<CreateUserArgs>({
    defaultValues: { role: userRoleOptions[0] },
  });

  const [birthday] = createForm.watch(['birthday']);

  useEffect(() => {
    if (!isCreateUserModalVisible || !teamId || teamsData.fetching || !teamsData.teams.length) return;

    const team = teamsData.teams.find(team => team.id === teamId);
    if (!team) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    createForm.setValue('team', team);
  }, [isCreateUserModalVisible, teamsData.fetching]);

  useEffect(() => {
    if (isCreateUserModalVisible) return;

    createForm.reset({
      role: userRoleOptions[0],
      birthday: null,
      team: null,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      gender: null,
      about: undefined,
      image: null,
      isSendSms: false,
    });
  }, [isCreateUserModalVisible]);

  useEffect(() => {
    if (!birthday) return;

    createForm.trigger('birthday');
  }, [birthday]);

  const handleActionClick = (action: UserActions, ids: string[]) => {
    switch (action) {
      case UserActions.ENABLE:
        setIdsToEnable(ids);
        return;
      case UserActions.DISABLE:
        setIdsToDisable(ids);
        return;

      default:
        return;
    }
  };

  const handleConfirmEnableActionClick = async () => {
    await enableUser.enableAll(idsToEnable);
    setIdsToEnable([]);
  };

  const handleCloseEnableConfirmationModal = async () => {
    setIdsToEnable([]);
  };

  const handleConfirmDisableActionClick = async () => {
    await disableUser.disableAll(idsToDisable);
    setIdsToDisable([]);
  };

  const handleCloseDisableConfirmationModal = async () => {
    setIdsToDisable([]);
  };

  const handleCreateUserClick = () => {
    setIsCreateUserModalVisible(true);
  };

  const handleCreateUserModalClose = () => {
    setIsCreateUserModalVisible(false);
  };

  const handleSelectLocation = (location: GQLLocationType) => {
    createForm.setValue('location', location as never);
  };

  const createUserSubmit = async ({ role, team, gender, birthday, ...args }: CreateUserArgs) => {
    const phone = args.phone ? `+${args.phone.replace(/\D/g, '')}` : '';
    const existingPhone = usersData.users.find(user => user.phone === phone) || null;
    if (existingPhone) {
      toast.showError(`The user with "${phone}" phone number already exists`);
      return;
    }

    const existingEmail = args.email ? usersData.users.find(user => user.email === args.email) || null : null;
    if (existingEmail) {
      toast.showError(`The user with "${args.email}" email already exists`);
      return;
    }

    await createUser.create(
      {
        ...args,
        role: role?.value,
        gender: gender?.value,
        isSignupCompleted: false,
        birthday: birthday?.toISOString().split('T')[0],
        teamId: team?.id,
        phone,
      },
      () => {
        setIsCreateUserModalVisible(false);
      },
    );
  };

  const modalsNode = (
    <>
      <CreateUserModalComponent
        isOpen={isCreateUserModalVisible}
        isLoading={createUser.fetching}
        onClose={handleCreateUserModalClose}
        onSubmit={createForm.handleSubmit(createUserSubmit)}
        teams={teamsData.teams}
        isTeamDisabled={!!teamId}
        typeOptions={userRoleOptions}
        genderOptions={userGenderOptions}
        isTeamsLoading={teamsData.fetching}
        control={createForm.control}
        onSelectLocation={handleSelectLocation}
      />

      <ConfirmationModalComponent
        isOpen={!!idsToDisable.length}
        actionText="Disable"
        isLoading={disableUser.fetching}
        onActionClick={handleConfirmDisableActionClick}
        onClose={handleCloseDisableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to disable all the selected user accounts?</Typography>
        <Typography variant="body1">
          Selected users: <strong>{idsToDisable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By disabling, all the selected users related data will be disabled as well.
        </Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={!!idsToEnable.length}
        actionText="Enable"
        isLoading={enableUser.fetching}
        buttonColor="success"
        onActionClick={handleConfirmEnableActionClick}
        onClose={handleCloseEnableConfirmationModal}>
        <Typography variant="body1">Are you sure you want to enable all the selected user accounts?</Typography>
        <Typography variant="body1">
          Selected users: <strong>{idsToEnable.length}</strong>
        </Typography>
        <Typography variant="subtitle2">
          By enabling, all the selected users related data will be enabled (restored) as well.
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
    handleCreateUserClick,
  };
};
