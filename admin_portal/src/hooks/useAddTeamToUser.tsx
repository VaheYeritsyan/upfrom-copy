import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Team } from '@up-from/graphql-ap/genql';
import { useTeamMembersMutations } from '~/api/useTeamMembersMutations';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { filterTeamOptions } from '~/util/autocomplete';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import { useAllTeamsQuery } from '~/api/useAllTeamsQuery';

type FormValues = {
  team?: Team | null;
  role: { label: string; value: string };
};

enum UserRole {
  MEMBER = 'member',
  MENTOR = 'mentor',
}

const userRoleOptions = Object.values(UserRole).map(value => ({ label: value, value }));

export const useAddTeamToUser = (userId?: string, teams?: Team[]) => {
  const [isCreateMemberModalVisible, setIsCreateMemberModalVisible] = useState(false);

  const teamsData = useAllTeamsQuery();
  const { createMember } = useTeamMembersMutations();

  const { control, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (isCreateMemberModalVisible) return;

    reset({ role: undefined, team: null });
  }, [isCreateMemberModalVisible]);

  const teamsIds = useMemo(() => teams?.map(({ id }) => id) || [], [teams]);

  const teamsOptions = useMemo(() => {
    if (!teamsData.teams.length || !teamsIds.length) return [];

    return teamsData.teams.filter(team => {
      return !team.isDisabled && !teamsIds.includes(team.id);
    });
  }, [teamsData.teams, teamsIds]);

  const handleAddMemberClick = () => {
    setIsCreateMemberModalVisible(true);
  };

  const handleAddMemberModalClose = () => {
    setIsCreateMemberModalVisible(false);
  };

  const addMemberSubmit = async ({ role, team }: FormValues) => {
    if (!userId || !team?.id) return;

    await createMember.create({ role: role.value, userId, teamId: team?.id });
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
          name="team"
          label="Team"
          size="small"
          isOptionEqualToValue={(option, value) => option.id === value.id}
          isLoading={teamsData.fetching}
          getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
          filterOptions={filterTeamOptions}
          variant="outlined"
          options={teamsOptions}
          rules={{ required: 'Required' }}
          renderOption={(props, team) => (
            <AutocompleteInputOptionComponent
              {...props}
              key={team.id}
              title={team.name}
              imgSrc={team.imageUrl}
              subtitle={team.id}
              isImgCircle={false}
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
