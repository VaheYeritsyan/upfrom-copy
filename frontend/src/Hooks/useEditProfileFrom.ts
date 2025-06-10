import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTypedMutation } from '~urql';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { removeEntityFields } from '~utils/entityFormat';
import { ProfileFormValues } from '~Containers/Profile/validations/profileValidation';
import { GQLLocationType } from '~types/location';

type EditableValues = Required<Omit<ProfileFormValues, 'phone' | 'email'>>;

export const useEditProfileFrom = (mutationName: 'completeSignUp' | 'updateMyUser', callback?: () => void) => {
  const { currentUser } = useCurrentUserContext();

  const [{ fetching }, editProfile] = useTypedMutation(
    (args: EditableValues) => ({
      [mutationName]: {
        __args: args,
        id: true,
        firstName: true,
        lastName: true,
        about: true,
        profile: {
          email: true,
          phone: true,
          gender: true,
          isSignupCompleted: true,
          birthday: true,
          location: {
            locationID: true,
            locationName: true,
            lat: true,
            lng: true,
          },
        },
        notificationPreferences: {
          emailChatNewMessage: true,
          emailEventPendingInvitation: true,
          pushChatNewMessage: true,
          pushTeamNewMember: true,
          pushEventCancelled: true,
          pushEventNewAllTeam: true,
          pushEventNewInvitation: true,
          pushEventRemovedIndividual: true,
          pushEventUpdatedDateTime: true,
          pushEventUpdatedLocation: true,
        },
      },
    }),
    undefined,
    callback,
  );

  const defaultValues = useMemo((): ProfileFormValues => {
    if (!currentUser) return { phone: '' } as ProfileFormValues;

    const { profile, ...values } = removeEntityFields(currentUser, [
      'avatarUrl',
      'id',
      'teams',
      'isDisabled',
      'notificationPreferences',
    ]);

    const { birthday, ...profileValues } = removeEntityFields(profile, ['isSignupCompleted']);

    return { birthday: birthday ? new Date(birthday) : undefined, ...values, ...profileValues };
  }, [
    currentUser?.profile.email,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.profile.gender,
    currentUser?.about,
    currentUser?.profile.phone,
    currentUser?.profile.birthday,
    currentUser?.profile.location,
  ]);

  const { control, handleSubmit, watch, trigger, setValue } = useForm<ProfileFormValues>({
    defaultValues: defaultValues,
    values: defaultValues,
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const [birthdayFormValue] = watch(['birthday']);

  useEffect(() => {
    if (!birthdayFormValue) return;

    trigger('birthday');
  }, [birthdayFormValue]);

  const submit = useCallback(
    async ({ birthday, ...values }: ProfileFormValues) => {
      // GraphQL restrictions
      const args = { ...values, birthday: birthday.toISOString().split('T')[0] };
      const payload = removeEntityFields(args, ['email', 'phone']);
      const { data } = await editProfile(payload as EditableValues);
      if (!data?.completeSignUp) return;
    },
    [editProfile],
  );

  const handleSelectLocation = (location: GQLLocationType) => {
    setValue('location', location);
  };

  return {
    isLoading: fetching,
    control,
    isSubmitDisabled: fetching,
    handleSubmit: handleSubmit(submit),
    handleSelectLocation,
  };
};
