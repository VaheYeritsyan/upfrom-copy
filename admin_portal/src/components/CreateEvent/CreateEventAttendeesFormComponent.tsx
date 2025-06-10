import React, { FC, PropsWithChildren } from 'react';
import { Control } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import { MutationGenqlSelection, User, Team } from '@up-from/graphql-ap/genql';
import { AutocompleteInputComponent } from '~/components/Input/AutocompleteInputComponent';
import { AutocompleteInputOptionComponent } from '~/components/Input/AutocompleteInputOptionComponent';
import styles from '~/components/CreateEvent/create-event-modal.module.scss';
import { filterTeamOptions, filterUserOptions } from '~/util/autocomplete';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type CreateEventArgs = MutationGenqlSelection['createEvent']['__args'];
export type AttendeesFormArgs = Pick<CreateEventArgs, 'isOwnerAttending' | 'isIndividual' | 'teamId' | 'ownerId'> & {
  team: Team | null;
  owner: User | null;
  attendees?: User[];
};

export enum EventType {
  INDIVIDUAL,
  TEAM,
  ALL_TEAMS,
}

type Props = PropsWithChildren & {
  control: Control<AttendeesFormArgs>;
  eventType: EventType;
  teams: Team[];
  owners: User[];
  isTeamsLoading?: boolean;
  isUsersLoading?: boolean;
};

export const ownerAttendingOptions = [
  {
    label: 'Yes',
    value: true,
  },
  {
    label: 'No',
    value: false,
  },
];

const visibilityNotes = {
  [EventType.INDIVIDUAL]: 'Individual Events are visible to your team members only.',
  [EventType.TEAM]: 'Team Events are visible to your team members only.',
  [EventType.ALL_TEAMS]: 'All Teams Events are publicly visible to all teams and team members.',
};

export const CreateEventAttendeesFormComponent: FC<Props> = ({
  control,
  isTeamsLoading,
  isUsersLoading,
  teams,
  owners,
  children,
  eventType,
}) => (
  <>
    <Box className={styles.createEventModalBodWrapper}>
      {eventType === EventType.ALL_TEAMS ? null : (
        <AutocompleteInputComponent
          control={control}
          name="team"
          label="Team"
          size="small"
          isOptionEqualToValue={(option, value) => option.id === value.id}
          isLoading={isTeamsLoading}
          getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
          filterOptions={filterTeamOptions}
          variant="outlined"
          options={teams}
          rules={{ required: 'Required' }}
          renderOption={(props, team) => (
            <AutocompleteInputOptionComponent
              {...props}
              key={team.id}
              imgSrc={team.imageUrl}
              title={team.name}
              subtitle={team.id}
              isImgCircle={false}
            />
          )}
        />
      )}

      <AutocompleteInputComponent
        control={control}
        name="owner"
        label="Owner"
        size="small"
        isOptionEqualToValue={(option, value) => option.id === value.id}
        isLoading={isUsersLoading}
        getOptionLabel={option => (typeof option === 'string' ? option : `${option.firstName} ${option.lastName}`)}
        filterOptions={filterUserOptions}
        variant="outlined"
        options={owners}
        rules={{ required: 'Required' }}
        renderOption={(props, user) => (
          <AutocompleteInputOptionComponent
            {...props}
            key={user.id}
            imgSrc={user.avatarUrl}
            title={[user.firstName, user.lastName].join(' ')}
            subtitle={[user.phone, user.email].join('; ')}
          />
        )}
      />

      {eventType === EventType.ALL_TEAMS ? (
        <AutocompleteInputComponent
          control={control}
          name="isOwnerAttending"
          label="Is Owner Attending"
          size="small"
          variant="outlined"
          options={ownerAttendingOptions}
          rules={{ required: 'Required' }}
        />
      ) : null}

      <Typography variant="subtitle2">{visibilityNotes[eventType]}</Typography>
    </Box>

    {children}
  </>
);
