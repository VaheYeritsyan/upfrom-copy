import { useState } from 'react';
import { MutationGenqlSelection, Team } from '@up-from/graphql-ap/genql';
import { DEFAULT_TEAM_IMG_URL } from '~/constants/config';
import { organizationsFields, organizationsFieldsWithRelations, teamFieldsWithRelations } from '~/api/queryFields';
import { useTypedMutation } from '~/hooks/useTypedMutation';
import { useToast } from '~/hooks/useToast';
import { getNotificationSuccessMessageInPlural } from '~/util/text';
import { removeEntityFields } from 'frontend/src/utils/entityFormat';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type CreateTeamArgs = MutationGenqlSelection['createTeam']['__args'] & {
  image?: Blob;
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type UpdateTeamArgs = MutationGenqlSelection['updateTeam']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type EnableTeamArgs = MutationGenqlSelection['enableTeam']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DisableTeamArgs = MutationGenqlSelection['disableTeam']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type GenerateTeamUploadUrlArgs = MutationGenqlSelection['generateTeamImageUploadUrl']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type CompleteTeamImageUploadArgs = MutationGenqlSelection['completeTeamImageUpload']['__args'];
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type RemoveTeamImageArgs = MutationGenqlSelection['removeTeamImage']['__args'];

export const useTeamMutations = () => {
  const toast = useToast();
  const [isCreateTeamLoading, setIsCreateTeamLoading] = useState(false);
  const [isUploadImageLoading, setIsUploadImageLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const [createData, executeCreateTeam] = useTypedMutation((args: CreateTeamArgs) => ({
    createTeam: {
      __args: args,
      ...teamFieldsWithRelations,
      organization: { ...organizationsFieldsWithRelations, teams: teamFieldsWithRelations },
    },
  }));

  const [updateData, executeUpdateTeam] = useTypedMutation((args: UpdateTeamArgs) => ({
    updateTeam: {
      __args: args,
      name: true,
      description: true,
      id: true,
      imageUrl: true,
      organization: organizationsFields,
    },
  }));

  const [disableData, executeDisableTeam] = useTypedMutation((args: DisableTeamArgs) => ({
    disableTeam: { __args: args, ...teamFieldsWithRelations },
  }));

  const [enableData, executeEnableTeam] = useTypedMutation((args: EnableTeamArgs) => ({
    enableTeam: { __args: args, ...teamFieldsWithRelations },
  }));

  const [, executeGenerateTeamUploadUrl] = useTypedMutation((args: GenerateTeamUploadUrlArgs) => ({
    generateTeamImageUploadUrl: { __args: args },
  }));

  const [, executeCompleteTeamImageUpload] = useTypedMutation((args: CompleteTeamImageUploadArgs) => ({
    completeTeamImageUpload: { __args: args, id: true, imageUrl: true },
  }));

  const [, executeRemoveTeamImage] = useTypedMutation((args: RemoveTeamImageArgs) => ({
    removeTeamImage: { __args: args, id: true, imageUrl: true },
  }));

  const uploadImage = async (id: string, blob: Blob) => {
    setIsUploadImageLoading(true);
    const { data, error } = await executeGenerateTeamUploadUrl({ id });
    if (!data || error) {
      console.log('generating team image upload url error: ', error);
      return;
    }

    await fetch(data.generateTeamImageUploadUrl, { method: 'PUT', body: blob });
    await executeCompleteTeamImageUpload({ id });
    setIsUploadImageLoading(false);
  };

  const removeImage = async (args: UpdateTeamArgs) => {
    setIsUploadImageLoading(true);

    await executeRemoveTeamImage({ id: args.id });
    // const { data, error } = await executeUpdateTeam({ ...args, imageUrl: DEFAULT_TEAM_IMG_URL });
    // if (!data || error) {
    //   console.log('removing team image upload url error: ', error);
    // }
    setIsUploadImageLoading(false);
  };

  const createTeam = async ({ image, ...args }: CreateTeamArgs, callback?: () => void) => {
    setIsCreateTeamLoading(true);

    try {
      const { data } = await executeCreateTeam({ ...args, imageUrl: DEFAULT_TEAM_IMG_URL });
      if (!data?.createTeam) return;

      if (image) await uploadImage(data.createTeam.id, image);

      toast.showSuccess(`The team "${args.name}" has been successfully created`);
      callback?.();
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setIsCreateTeamLoading(false);
    }
  };

  const updateTeam = async (args: UpdateTeamArgs) => {
    const { data } = await executeUpdateTeam(args);
    if (!data?.updateTeam) return;
    toast.showSuccess(`The team "${args.name}" has been successfully updated`);
  };

  const disableAll = async (ids: DisableTeamArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeDisableTeam({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'team', 'been successfully disabled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const enableAll = async (ids: EnableTeamArgs['id'][]) => {
    setLoadingIds(ids);
    try {
      const mutations = ids.map(id => executeEnableTeam({ id }));

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(ids.length, 'team', 'been successfully enabled'));
      }
    } catch {
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  const updateOrgAll = async (teams: Team[], organizationId: UpdateTeamArgs['organizationId']) => {
    setLoadingIds(teams.map(({ id }) => id));
    try {
      const mutations = teams.map(team =>
        executeUpdateTeam({
          ...removeEntityFields(team, [
            'createdAt',
            'updatedAt',
            'organization',
            'members',
            'organizationId',
            'isDisabled',
          ]),
          organizationId,
        }),
      );

      const results = await Promise.all(mutations);
      const failedResults = results.filter(({ error }) => error);
      if (!failedResults.length) {
        toast.showSuccess(getNotificationSuccessMessageInPlural(teams.length, 'team', 'been successfully updated'));
      }
    } catch (e) {
      console.log(e);
      toast.showError('Something went wrong');
    } finally {
      setLoadingIds([]);
    }
  };

  return {
    loadingIds,
    createTeam: { data: createData.data?.createTeam, fetching: isCreateTeamLoading, create: createTeam },
    disableTeam: { data: disableData?.data, fetching: disableData.fetching, disable: executeDisableTeam, disableAll },
    enableTeam: { data: enableData?.data, fetching: enableData.fetching, enable: executeEnableTeam, enableAll },
    updateTeam: { data: updateData?.data, fetching: updateData.fetching, update: updateTeam, updateOrgAll },
    uploadImage: { fetching: isUploadImageLoading, upload: uploadImage },
    removeImage: { fetching: isUploadImageLoading, remove: removeImage },
  };
};
