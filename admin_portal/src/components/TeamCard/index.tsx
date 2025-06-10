import React, { useState, MouseEvent, useEffect, useMemo } from 'react';
import { Avatar, Card, CardContent, Grid, Typography, CircularProgress, Box, Button } from '@mui/material';
import { CopyAll, EventOutlined, Restore, Delete, Save, Edit } from '@mui/icons-material';
import Link from 'next/link';
import { Team } from '@up-from/graphql-ap/genql';
import { Pages } from '~/constants/pages';
import { getFullDateAndTime } from '~/util/date';
import { getBooleanValue } from '~/util/text';
import { useClipboard } from '~/hooks/useClipboard';
import { APP_API_URL, DEFAULT_TEAM_IMG_URL } from '~/constants/config';
import { useTeamMutations } from '~/api/useTeamMutations';
import { useForm } from 'react-hook-form';
import { EditTeamForm, EditTeamArgs } from '../EditTeamForm';
import { ConfirmationModalComponent } from '../Modal/ConfirmationModalComponent';
import { ImageEditorComponent } from '../Image/ImageEditorComponent';
import { ImageCropperShape } from '~/types/image';
import { useEntityCardConfirmationActions } from '~/hooks/useEntityCardConfirmationActions';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';
import styles from './teamCard.module.scss';
import { filerTeamMembers } from '~/util/table';
import { useAllOrganizationsQuery } from '~/api/useAllOrganizationsQuery';

export type Props = {
  team: Team;
  onTeamClick?: () => void;
  isEditable: boolean;
};

export const TeamCard = ({ team, onTeamClick, isEditable }: Props) => {
  const [, setValueToClipboard] = useClipboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationModalOpened, setIsConfirmationModalOpened] = useState(false);
  const { disableTeam, enableTeam, updateTeam, uploadImage, removeImage } = useTeamMutations();
  const confirmationActions = useEntityCardConfirmationActions(
    () => disableTeam.disable({ id: team.id }),
    () => enableTeam.enable({ id: team.id }),
  );

  const organizationsData = useAllOrganizationsQuery();

  const members = useMemo(() => {
    if (!team?.members?.length) return null;

    return filerTeamMembers(team.members);
  }, [team?.members]);

  const updateTeamForm = useForm<EditTeamArgs>();

  const values = updateTeamForm.watch();
  useEffect(() => {
    updateTeamForm.trigger();
  }, [values]);

  const handleCopyInvitationLinkClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const invitationLink = `${APP_API_URL}/invite/${team.id}`;
    await setValueToClipboard(invitationLink, 'The invitation link has been copied to clipboard');
  };

  const onImageChange = (blob: Blob) => {
    uploadImage.upload(team.id, blob);
  };

  const onImageRemove = () => {
    removeImage.remove({ name: team.name, description: team.description, id: team.id });
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(true);
    updateTeamForm.reset({ name: team.name, description: team.description, organization: team.organization });
  };

  const handleConfirmClick = () => {
    // Save the edited user data
    // You can perform the API/database update here
    const { name, description, organization } = updateTeamForm.getValues();
    updateTeam.update({ name, description, id: team.id, imageUrl: team.imageUrl, organizationId: organization?.id });

    // Switch back to non-edit mode
    setIsEditing(false);
    setIsConfirmationModalOpened(false);
  };

  const handleCloseModal = () => {
    setIsConfirmationModalOpened(false);
  };

  const handleSaveClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const isValid = await updateTeamForm.trigger();
    if (!isValid) return;

    setIsConfirmationModalOpened(true);
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(false);
  };

  const handleCalendarClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    window.open(Pages.getTeamCalendarPageLink(team.id), '_blank');
  };

  useEffect(() => {
    updateTeamForm.reset({ name: team.name, description: team.description });
  }, [team, updateTeamForm]);

  if ((!team || updateTeam.fetching) && !isEditing) {
    return <CircularProgress />;
  }

  return (
    <>
      <ConfirmationModalComponent
        isOpen={isConfirmationModalOpened}
        actionText="Confirm"
        buttonColor="primary"
        isLoading={updateTeam.fetching}
        onActionClick={handleConfirmClick}
        onClose={handleCloseModal}>
        <Typography variant="body1">Are you sure you want to save edited information?</Typography>
        <Typography variant="subtitle2">
          Edited information will be displayed in the admin panel and in the application
        </Typography>
      </ConfirmationModalComponent>
      <Card className={styles.teamCard}>
        <CardContent onClick={onTeamClick}>
          {isEditable && (
            <Box className={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <Button
                    disabled={uploadImage.fetching || removeImage.fetching}
                    variant="contained"
                    endIcon={<Restore />}
                    onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  <Button
                    disabled={uploadImage.fetching || removeImage.fetching}
                    variant="contained"
                    endIcon={<Save />}
                    onClick={handleSaveClick}>
                    Save
                  </Button>
                  {uploadImage.fetching || removeImage.fetching ? <CircularProgress /> : <></>}
                </>
              ) : (
                <>
                  <Button variant="contained" endIcon={<EventOutlined />} onClick={handleCalendarClick}>
                    Calendar
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<CopyAll />}
                    disabled={team.isDisabled}
                    onClick={handleCopyInvitationLinkClick}>
                    Get invitation link
                  </Button>
                  <ContainedButtonComponent size="medium" endIcon={<Edit />} onClick={handleEditClick}>
                    Edit
                  </ContainedButtonComponent>
                  {team.isDisabled ? (
                    <ContainedButtonComponent
                      size="medium"
                      color="success"
                      isLoading={enableTeam.fetching}
                      startIcon={<Restore />}
                      onClick={confirmationActions.restore.handleClick}>
                      Enable
                    </ContainedButtonComponent>
                  ) : (
                    <ContainedButtonComponent
                      size="medium"
                      color="error"
                      isLoading={disableTeam.fetching}
                      startIcon={<Delete />}
                      onClick={confirmationActions.remove.handleClick}>
                      Disable
                    </ContainedButtonComponent>
                  )}
                </>
              )}
            </Box>
          )}
          <Grid container alignItems="center" gap={2}>
            <Grid>
              {isEditing ? (
                <div className={styles.text}>
                  <ImageEditorComponent
                    shape={ImageCropperShape.SQUARE}
                    src={team.imageUrl}
                    defaultSrc={DEFAULT_TEAM_IMG_URL}
                    className={styles.avatar}
                    onSave={onImageChange}
                    onRemove={onImageRemove}
                  />
                </div>
              ) : (
                <Link href={Pages.getTeamPageLink(team.id) || ''} className={styles.text}>
                  <Avatar
                    variant="rounded"
                    src={team.imageUrl || DEFAULT_TEAM_IMG_URL}
                    alt="Team Avatar"
                    className={styles.teamAvatar}
                  />
                </Link>
              )}
            </Grid>
            <Grid className={styles.inputBlock}>
              {isEditing ? (
                <EditTeamForm
                  control={updateTeamForm.control}
                  organizations={organizationsData.organizations}
                  isOrganizationsLoading={organizationsData.fetching}
                />
              ) : (
                <div className={styles.text}>
                  <Typography variant="h5" color="black" gutterBottom>
                    <Link className={styles.LinkText} href={Pages.getTeamPageLink(team.id) || ''}>
                      {team.name}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">Team ID: {team.id}</Typography>
                  <Typography color="textSecondary">Description: {team.description}</Typography>
                  {members ? <Typography color="textSecondary">Members: {members.length}</Typography> : null}
                  <br />
                  <Typography color="textSecondary" sx={team.isDisabled ? { color: 'error.main' } : {}}>
                    Is Disabled: {getBooleanValue(team.isDisabled)}
                  </Typography>
                  <br />
                  <Typography color="textSecondary">Updated At: {getFullDateAndTime(team.updatedAt)}</Typography>
                  <Typography color="textSecondary">Created At: {getFullDateAndTime(team.createdAt)}</Typography>
                </div>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ConfirmationModalComponent
        isOpen={confirmationActions.remove.isModalVisible}
        actionText="Disable"
        isLoading={disableTeam.fetching}
        onActionClick={confirmationActions.remove.handleConfirmClick}
        onClose={confirmationActions.remove.handleModalClose}>
        <Typography variant="body1">Are you sure you want to disable the team?</Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={confirmationActions.restore.isModalVisible}
        actionText="Enable"
        buttonColor="success"
        isLoading={enableTeam.fetching}
        onActionClick={confirmationActions.restore.handleConfirmClick}
        onClose={confirmationActions.restore.handleModalClose}>
        <Typography variant="body1">Are you sure you want to enable the team?</Typography>
      </ConfirmationModalComponent>
    </>
  );
};
