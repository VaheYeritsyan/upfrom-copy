import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { Controller, FieldPath, useForm } from 'react-hook-form';
import { Box, Tab, Tabs } from '@mui/material';
import { MutationGenqlSelection, Team, User } from '@up-from/graphql-ap/genql';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';
import { CreateEventMainFormComponent, MainFormArgs } from '~/components/CreateEvent/CreateEventMainFormComponent';
import {
  AttendeesFormArgs,
  CreateEventAttendeesFormComponent,
  EventType,
  ownerAttendingOptions,
} from '~/components/CreateEvent/CreateEventAttendeesFormComponent';
import {
  CreateEventLocationFormComponent,
  LocationFormArgs,
} from '~/components/CreateEvent/CreateEventLocationFormComponent';
import { CreateEventAttendeesFormSelectorComponent } from '~/components/CreateEvent/CreateEventAttendeesFormSelectorComponent';
import styles from './create-event-modal.module.scss';
import { GQLLocationType } from '~/types/googlePlaces';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type CreateEventArgs = MutationGenqlSelection['createEvent']['__args'];

enum Step {
  MAIN,
  ATTENDEES,
  LOCATION,
}

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  isLoading?: boolean;
  teams: Team[];
  users: User[];
  isTeamsLoading?: boolean;
  isUsersLoading?: boolean;
  onImageRemove?: () => void;
  onSubmit: (values: CreateEventArgs) => void;
};

export const CreateEventModalComponent: FC<Props> = ({
  isOpen,
  isLoading,
  isTeamsLoading,
  isUsersLoading,
  teams,
  users,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(Step.MAIN);
  const [eventType, setEventType] = useState(EventType.INDIVIDUAL);

  const mainForm = useForm<MainFormArgs>();
  const attendeesForm = useForm<AttendeesFormArgs>({
    defaultValues: { isOwnerAttending: ownerAttendingOptions[0], isIndividual: true },
  });
  const locationForm = useForm<LocationFormArgs>();

  const [owner, team]: [User | null, Team | null] = attendeesForm.watch(['owner', 'team']);
  const [startsAt, endsAt] = mainForm.watch(['startsAt', 'endsAt']);

  useEffect(() => {
    if (isOpen) return;

    setStep(Step.MAIN);
    setEventType(EventType.INDIVIDUAL);
    mainForm.reset({ title: undefined, description: undefined, image: null, endsAt: null, startsAt: null });
    attendeesForm.reset({
      owner: null,
      team: null,
      attendees: [],
      teamId: undefined,
      isOwnerAttending: ownerAttendingOptions[0],
      ownerId: undefined,
      isIndividual: true,
    });
    locationForm.reset({ address: undefined, location: undefined });
  }, [isOpen]);

  useEffect(() => {
    if (!startsAt) return;

    Promise.all([startsAt && mainForm.trigger('startsAt'), endsAt && mainForm.trigger('endsAt')]);
  }, [startsAt]);

  useEffect(() => {
    if (!endsAt) return;

    Promise.all([startsAt && mainForm.trigger('startsAt'), endsAt && mainForm.trigger('endsAt')]);
  }, [endsAt]);

  useEffect(() => {
    if (!owner?.id) return;

    if (eventType === EventType.TEAM) {
      const attendees: User[] = attendeesForm.getValues('attendees');
      attendeesForm.setValue<FieldPath<AttendeesFormArgs>>(
        'attendees',
        attendees?.filter(({ id }) => id !== owner.id) || [],
      );
    }
  }, [owner?.id]);

  const ownerTeamsIds = useMemo(() => owner?.teams.map(({ id }) => id) || [], [owner?.teams]);

  useEffect(() => {
    if (!owner?.id || !team?.id || ownerTeamsIds.includes(team.id)) return;

    attendeesForm.setValue<FieldPath<AttendeesFormArgs>>('owner', null);
  }, [team?.id]);

  useEffect(() => {
    attendeesForm.setValue<FieldPath<AttendeesFormArgs>>('isIndividual', eventType === EventType.INDIVIDUAL);
  }, [eventType]);

  const submitMain = () => {
    setStep(Step.ATTENDEES);
  };

  const handleSelectLocation = (location: GQLLocationType) => {
    locationForm.setValue('location', location as never);
  };

  const submitAttendees = (values: AttendeesFormArgs) => {
    const { team, owner } = values;

    if (team) attendeesForm.setValue<FieldPath<AttendeesFormArgs>>('teamId', team.id);
    if (owner) attendeesForm.setValue<FieldPath<AttendeesFormArgs>>('ownerId', owner.id);

    setStep(Step.LOCATION);
  };

  const submitLocation = (values: LocationFormArgs) => {
    const { startsAt, endsAt, ...mainValues } = mainForm.getValues();
    const { team: _, owner: __, attendees, isOwnerAttending, ...attendeesValues } = attendeesForm.getValues();

    onSubmit({
      ...mainValues,
      ...attendeesValues,
      ...values,
      isOwnerAttending: isOwnerAttending.value,
      attendees: eventType === EventType.TEAM ? attendees || [] : [],
      teamId: eventType === EventType.ALL_TEAMS ? null : attendeesValues.teamId,
      startsAt: startsAt?.getTime(),
      endsAt: endsAt?.getTime(),
    });
  };

  const handleSubmit = useMemo(() => {
    switch (step) {
      case Step.MAIN:
        return mainForm.handleSubmit(submitMain);
      case Step.ATTENDEES:
        return attendeesForm.handleSubmit(submitAttendees);
      case Step.LOCATION:
        return locationForm.handleSubmit(submitLocation);
      default:
        return () => null;
    }
  }, [step]);

  const handleBackClick = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleEventTypeChange = (event: ChangeEvent<unknown>, value: EventType) => {
    setEventType(value);
  };

  const owners = useMemo(() => {
    if (!team) return users;

    return users.filter(
      user => user.teams?.map(({ id }) => id).includes(team.id) && user.isSignupCompleted && !user.isDisabled,
    );
  }, [team, users]);

  const members = useMemo(() => {
    if (!team?.members?.length) return [];

    return (team.members as Team['members']).filter(
      member => member.user?.isSignupCompleted && !member.user?.isDisabled,
    );
  }, [team?.members]);

  const teamsOptions = useMemo(() => {
    if (!owner?.id) return teams;

    return teams.filter(team => ownerTeamsIds.includes(team.id));
  }, [owner?.id, ownerTeamsIds, teams]);

  const modalActionButtonText = useMemo(() => {
    return step === Step.LOCATION ? 'Create' : 'Continue';
  }, [step]);

  const isContinueDisabled = useMemo(() => {
    if (eventType !== EventType.TEAM) return false;

    return !members.length;
  }, [eventType, members.length]);

  return (
    <ActionModalComponent
      className={styles.createEventModal}
      bodyClassName={styles.createEventModalBody}
      title="Creating an event"
      isOpen={isOpen}
      actionText={modalActionButtonText}
      isLoading={isLoading}
      isDisabled={isContinueDisabled}
      onSubmit={handleSubmit}
      onClose={onClose}
      headerBottom={
        step === Step.ATTENDEES ? (
          <Tabs value={eventType} onChange={handleEventTypeChange} variant="fullWidth">
            <Tab tabIndex={eventType} value={EventType.INDIVIDUAL} label="Individual" />
            <Tab tabIndex={eventType} value={EventType.TEAM} label="Team" />
            <Tab tabIndex={eventType} value={EventType.ALL_TEAMS} label="All Teams" />
          </Tabs>
        ) : null
      }
      buttons={
        step === Step.MAIN ? null : (
          <ContainedButtonComponent
            color="secondary"
            size="small"
            variant="contained"
            onClick={handleBackClick}
            type="button"
            disabled={isLoading}>
            Back
          </ContainedButtonComponent>
        )
      }>
      {step === Step.MAIN ? (
        <Box className={styles.createEventModalBodWrapper}>
          <CreateEventMainFormComponent control={mainForm.control} imageClassName={styles.createEventModalFormImage} />
        </Box>
      ) : null}

      {step === Step.ATTENDEES ? (
        <CreateEventAttendeesFormComponent
          control={attendeesForm.control}
          eventType={eventType}
          teams={teamsOptions}
          owners={owners}
          isTeamsLoading={isTeamsLoading}
          isUsersLoading={isUsersLoading}>
          {eventType === EventType.TEAM ? (
            <Controller
              control={attendeesForm.control}
              name="attendees"
              render={({ field }) => (
                <CreateEventAttendeesFormSelectorComponent
                  selectedMembers={field.value || []}
                  members={members.filter(({ user }) => !!user).map(({ user }) => user!) || []}
                  onChange={field.onChange}
                  ownerId={owner?.id}
                />
              )}
            />
          ) : null}
        </CreateEventAttendeesFormComponent>
      ) : null}

      {step === Step.LOCATION ? (
        <Box className={styles.createEventModalBodWrapper}>
          <CreateEventLocationFormComponent control={locationForm.control} onSelectLocation={handleSelectLocation} />
        </Box>
      ) : null}
    </ActionModalComponent>
  );
};
