import React, { FC, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useForm } from 'react-hook-form';
import { EventUser } from '@up-from/graphql/genql';
import { EventsStackParamList, Screens } from '~types/navigation';
import { removeEntityFields } from '~utils/entityFormat';
import { KeyboardView } from '~Components/KeyboardView';
import { MainLayout } from '~Components/MainLayout';
import { ContainedButton } from '~Components/ContainedButton';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { EventForm } from '~Components/Events/EventForm';
import { colors } from '~Theme/Colors';
import { ImagePickerData } from '~types/imagePicker';
import { setDate } from '~utils/dateFormat';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { useEditEventQueries } from '~Containers/Events/hooks/useEditEventQueries';
import { EventFormValues } from '~Containers/Events/validations/eventValidation';
import { InviteTeamMembers } from '~Components/Events/InviteTeamMembers';
import { getEventType } from '~utils/eventType';
import { EventType } from '~types/event';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { GQLLocationType } from '~types/location';

type CreateEventProps = BottomTabScreenProps<EventsStackParamList, Screens.EDIT_EVENT>;

export const EditEvent: FC<CreateEventProps> = ({ navigation, route }) => {
  const { eventId } = route.params;

  const { currentUser } = useCurrentUserContext();
  const [invitedMembersIds, setInvitedMembersIds] = useState<string[]>([]);

  const { event, members, isLoading, isUploadLoading, editEvent, uploadImage, removeImage } = useEditEventQueries(
    eventId,
    navigation.goBack,
  );
  const isTeamEvent = getEventType(event?.teamId, event?.isIndividual) === EventType.MY_TEAM;
  const invitedUsers = invitedMembersIds.filter(id => id !== currentUser?.id);

  const teamMembers = useMemo(() => {
    return members
      .filter(({ user }) => user && user.id !== currentUser?.id)
      .map(({ user, role }) => ({
        user: {
          id: user!.id,
          firstName: user!.firstName,
          lastName: user!.lastName,
          avatarUrl: user!.avatarUrl,
        },
        role,
      }));
  }, [members, currentUser?.id]);

  const onMemberPress = (userId: string) => {
    setInvitedMembersIds(prevIds => {
      if (prevIds.includes(userId)) return prevIds.filter(id => id !== userId);

      return [...prevIds, userId];
    });
  };

  const defaultValues = useMemo((): EventFormValues => {
    if (!event) return {} as EventFormValues;

    const { startsAt, endsAt, ...values } = removeEntityFields(event, ['imageUrl', 'teamId', 'guests']);

    return {
      date: new Date(startsAt),
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      ...values,
    };
  }, [event]);

  const { control, handleSubmit, trigger, watch, setValue } = useForm<EventFormValues>({
    defaultValues,
    values: defaultValues,
  });
  const [startsAt, endsAt, date, locationLocationName] = watch(['startsAt', 'endsAt', 'date', 'location.locationName']);

  useEffect(() => {
    if (date) {
      if (startsAt) {
        trigger(['startsAt', 'date']);
      }

      if (endsAt) {
        trigger(['endsAt', 'date']);
      }
    } else {
      if (startsAt && endsAt) {
        trigger(['startsAt', 'endsAt']);
      }
    }
  }, [startsAt, endsAt, date]);

  useEffect(() => {
    if (!event?.guests) return;

    setInvitedMembersIds((event.guests as Required<EventUser>[]).map(({ user }) => (user ? user.id : '')));
  }, [event?.guests]);

  useEffect(() => {
    if (locationLocationName) {
      trigger(['location.locationName']);
    }
  }, [locationLocationName]);

  const handleSelectLocation = (location: GQLLocationType) => {
    setValue('location.locationName', location.locationName as never);
    setValue('location.locationID', location.locationID as never);
    setValue('location.lat', location.lat as never);
    setValue('location.lng', location.lng as never);
  };

  const submit = async (values: EventFormValues) => {
    const formData = removeEntityFields(values, ['date', 'startsAt', 'endsAt']);
    const startsAt = setDate(values.startsAt, values.date);
    const endsAt = setDate(values.endsAt, values.date);

    await editEvent({
      ...formData,
      startsAt,
      endsAt,
      invitedIds: invitedMembersIds,
      id: eventId,
      isIndividual: event?.isIndividual,
    });
  };

  const handleSelectImage = async ({ blob }: ImagePickerData) => {
    await uploadImage(blob);
  };

  const handleSelectAllPress = () => {
    setInvitedMembersIds(teamMembers.map(({ user }) => user!.id));
  };

  const handleClearAllPress = () => {
    setInvitedMembersIds([]);
  };

  const stickyButton = (
    <ContainedButton
      text="Done"
      activeOpacity={0.8}
      color="blueGradient"
      disabled={isLoading || isUploadLoading || (isTeamEvent && !invitedUsers.length)}
      onPress={handleSubmit(submit)}
    />
  );

  return (
    <KeyboardView>
      <MainLayout
        containerStyle={styles.container}
        style={styles.bodyContainer}
        headerContainerStyle={headerBackButtonContainerStyles}
        stickyBottomContainerStyle={styles.stickyBottomContainer}
        isHeaderBackgroundInvisible
        header={<HeaderBackButton text="Cancel" />}
        stickyBottomContent={stickyButton}>
        <LargeTitleHeader title="Edit Event" />

        <EventForm
          style={styles.form}
          isEditing
          control={control}
          imageUrl={event?.imageUrl}
          isUploadLoading={isUploadLoading}
          handleRemoveImage={removeImage}
          handleSelectImage={handleSelectImage}
          onSelectLocation={handleSelectLocation}>
          {isTeamEvent ? (
            <InviteTeamMembers
              teamMembers={teamMembers}
              invitedMembersIds={invitedMembersIds}
              onTeamMemberPress={onMemberPress}
              onSelectAllPress={handleSelectAllPress}
              onClearAllPress={handleClearAllPress}
            />
          ) : null}
        </EventForm>
      </MainLayout>
    </KeyboardView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey100 },
  bodyContainer: {
    marginHorizontal: 24,
  },
  form: {
    marginTop: 32,
  },
  stickyBottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
