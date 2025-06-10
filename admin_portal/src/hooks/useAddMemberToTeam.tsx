import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '@up-from/graphql-ap/genql';
import { useTeamMembersMutations } from '~/api/useTeamMembersMutations';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { filterUserOptions } from '~/util/autocomplete';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import { useAllUsersQuery } from '~/api/useAllUsersQuery';
import { TeamMember } from '~/components/EntityTable/TeamMembersTable';

type FormValues = {
  user?: User | null;
  role: { label: string; value: string };
};

enum UserRole {
  MEMBER = 'member',
  MENTOR = 'mentor',
}

const userRoleOptions = Object.values(UserRole).map(value => ({ label: value, value }));

export const useAddMemberToTeam = (teamId?: string, members?: TeamMember[]) => {
  const [isCreateMemberModalVisible, setIsCreateMemberModalVisible] = useState(false);

  const usersData = useAllUsersQuery();
  const { createMember } = useTeamMembersMutations(teamId);

  const { control, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (isCreateMemberModalVisible) return;

    reset({ role: undefined, user: null });
  }, [isCreateMemberModalVisible]);

  const membersIds = useMemo(() => members?.map(({ id }) => id) || [], [members]);

  const usersOptions = useMemo(() => {
    if (!usersData.users.length || !membersIds.length) return [];

    return usersData.users.filter(user => {
      return user.isSignupCompleted && !user.isDisabled && !membersIds.includes(user.id);
    });
  }, [usersData.users, membersIds]);

  const handleAddMemberClick = () => {
    setIsCreateMemberModalVisible(true);
  };

  const handleAddMemberModalClose = () => {
    setIsCreateMemberModalVisible(false);
  };

  const addMemberSubmit = async ({ role, user }: FormValues) => {
    if (!teamId || !user?.id) return;

    await createMember.create({ role: role.value, teamId, userId: user?.id });
    setIsCreateMemberModalVisible(false);
  };

  const modalsNode = (
    <>
      <ActionModalComponent
        title="Adding a member"
        isOpen={isCreateMemberModalVisible}
        actionText="Add"
        isLoading={createMember.fetching}
        onSubmit={handleSubmit(addMemberSubmit)}
        onClose={handleAddMemberModalClose}>
        <AutocompleteInputComponent
          control={control}
          name="user"
          label="User"
          size="small"
          isOptionEqualToValue={(option, value) => option.id === value.id}
          isLoading={usersData.fetching}
          getOptionLabel={option => (typeof option === 'string' ? option : `${option.firstName} ${option.lastName}`)}
          filterOptions={filterUserOptions}
          variant="outlined"
          options={usersOptions}
          rules={{ required: 'Required' }}
          renderOption={(props, user) => (
            <AutocompleteInputOptionComponent
              {...props}
              key={user.id}
              imgSrc={user.avatarUrl}
              title={`${user.firstName} ${user.lastName}`}
              subtitle={user.id}
              isImgCircle
            />
          )}
        />
        <AutocompleteInputComponent
          control={control}
          name="role"
          label="Role"
          size="small"
          options={userRoleOptions}
          variant="outlined"
          type="text"
          placeholder="Role"
          rules={{ required: 'Required' }}
        />
      </ActionModalComponent>
    </>
  );

  return {
    modalsNode,
    handleAddMemberClick,
  };
};
