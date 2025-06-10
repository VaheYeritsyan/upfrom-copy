import { useState } from 'react';
import axios from 'axios';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { MutationGenqlSelection } from '@up-from/graphql-ap/genql';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';
import { teamFieldsWithRelations, userFieldsWithRelations, userFields } from '~/api/queryFields';
import { APP_API_URL } from '~/constants/config';
import { useTeamMembersMutations } from '~/api/useTeamMembersMutations';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type DisableUserArgs = MutationGenqlSelection['disableUser']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type EnableUserArgs = MutationGenqlSelection['enableUser']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type CreateUserArgs = MutationGenqlSelection['createUser']['__args'] & {
  teamId: string;
  role: string;
  image?: Blob;
  isSendEmail?: boolean;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type UpdateUserArgs = MutationGenqlSelection['updateUser']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type GenerateUserAvatarUrlArgs = MutationGenqlSelection['generateAvatarUploadUrl']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type CompleteUserAvatarUploadArgs = MutationGenqlSelection['completeAvatarUpload']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type RemoveUserAvatarArgs = MutationGenqlSelection['removeAvatar']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type SendInvitationEmailArgs = MutationGenqlSelection['sendInvitationEmail']['__args'];

export const useUserMutations = (teamId?: string) => {
  const toast = useToast();
  const [isConfirmationLinkLoading, setIsConfirmationLinkLoading] = useState(false);
  const [isCreateUserLoading, setIsCreateUserLoading] = useState(false);
  const [isUploadImageLoading, setIsUploadImageLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const { createMember, loadingIds: loadingIdsMembers } = useTeamMembersMutations(teamId);

  const [createData, executeCreateUser] = useTypedMutation((args: CreateUserArgs) => ({
    createUser: { __args: args, ...userFieldsWithRelations, teams: teamFieldsWithRelations },
  }));

  const [disableData, executeDisableUser] = useTypedMutation((args: DisableUserArgs) => ({
    disableUser: { __args: args, ...userFieldsWithRelations },
  }));

  const [enableData, executeEnableUser] = useTypedMutation((args: EnableUserArgs) => ({
    enableUser: { __args: args, ...userFieldsWithRelations },
  }));

  const [, executeGenerateUserAvatarUrl] = useTypedMutation((args: GenerateUserAvatarUrlArgs) => ({
    generateAvatarUploadUrl: { __args: args },
  }));

  const [invitationEmail, executeSendInvitationEmail] = useTypedMutation((args: SendInvitationEmailArgs) => ({
    sendInvitationEmail: { __args: args, id: true },
  }));

  const [, executeCompleteUserAvatarUpload] = useTypedMutation((args: CompleteUserAvatarUploadArgs) => ({
    completeAvatarUpload: { __args: args, id: true, avatarUrl: true, updatedAt: true },
  }));

  const [removeAvatarData, executeRemoveUserAvatar] = useTypedMutation((args: RemoveUserAvatarArgs) => ({
    removeAvatar: { __args: args, id: true, avatarUrl: true, updatedAt: true },
  }));

  const [editData, executeUpdateUser] = useTypedMutation((args: UpdateUserArgs) => ({
    updateUser: {
      __args: args,
      ...userFields,
    },
  }));

  const uploadImage = async (id: string, blob: Blob) => {
    setIsUploadImageLoading(true);
    const { data, error } = await executeGenerateUserAvatarUrl({ id });
    if (!data || error) {
      console.log('generating user upload url error: ', error);
      return;
    }

    await fetch(data.generateAvatarUploadUrl, { method: 'PUT', body: blob });
    await executeCompleteUserAvatarUpload({ id });
    setIsUploadImageLoading(false);
  };

  const removeImage = async (id: string) => {
    const { data, error } = await executeRemoveUserAvatar({ id });
    if (!data || error) {
      console.log('removing user image upload url error: ', error);
    }
  };

  const sendConfimationPhoneLink = async (args: CreateUserArgs, callback?: () => void) => {
    setIsConfirmationLinkLoading(true);

    try {
      await axios.get(`${APP_API_URL}/auth/link/authorize`, { params: args });
      toast.showSuccess(`The link has been successfully sent to the user with "${args.phone}" phone number`);
      callback?.();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } catch (error: Record<string, unknown>) {
      if (error.response) {
        toast.showError(error.response.data.message || 'Something went wrong');
      }
    } finally {
      setIsConfirmationLinkLoading(false);
    }
  };

  const sendInvitationEmail = (id: SendInvitationEmailArgs['id']) => {
    return executeSendInvitationEmail({ id });
  };

  const disableAll = async (ids: DisableUserArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeDisableUser({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'user', 'been successfully disabled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const enableAll = async (ids: EnableUserArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeEnableUser({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'user', 'been successfully enabled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const inviteAll = async (ids: SendInvitationEmailArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeSendInvitationEmail({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'invitation', 'been successfully sent'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const updateUser = async (user: UpdateUserArgs) => {
    try {
      const mutation = executeUpdateUser(user);
      const result = await Promise.resolve(mutation);
      if (!result.error) {
        toast.showSuccess('User has been successfully updated');
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const createUser = async ({ image, isSendEmail, teamId, role, ...args }: CreateUserArgs, callback?: () => void) => {
    setIsCreateUserLoading(true);
    try {
      const { data, error } = await executeCreateUser(args);
      if (!data || error) return;

      if (image) await uploadImage(data.createUser.id, image);
      toast.showSuccess('User has been successfully created');

      if (isSendEmail) {
        await sendInvitationEmail(data.createUser.id);
        toast.showSuccess('Email invitation has been sent to the user');
      }

      await createMember.create({ teamId, role, userId: data.createUser.id });
      callback?.();
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setIsCreateUserLoading(false);
    }
  };

  return {
    loadingIds: [...loadingIds, ...loadingIdsMembers],
    createUser: {
      data: createData.data?.createUser,
      fetching: isCreateUserLoading,
      create: createUser,
    },
    sendConfirmationLink: {
      fetching: isConfirmationLinkLoading,
      send: sendConfimationPhoneLink,
    },
    sendInvitationEmail: {
      fetching: invitationEmail.fetching,
      send: sendInvitationEmail,
      sendAll: inviteAll,
    },
    disableUser: {
      data: disableData.data?.disableUser,
      fetching: disableData.fetching,
      disable: executeDisableUser,
      disableAll,
    },
    enableUser: {
      data: enableData.data?.enableUser,
      fetching: enableData.fetching,
      enable: executeEnableUser,
      enableAll,
    },
    updateUser: {
      data: editData.data?.updateUser,
      fetching: editData.fetching,
      updateUser: updateUser,
    },
    uploadAvatar: {
      fetching: isUploadImageLoading,
      upload: uploadImage,
    },
    removeAvatar: {
      fetching: removeAvatarData.fetching,
      remove: removeImage,
    },
  };
};
