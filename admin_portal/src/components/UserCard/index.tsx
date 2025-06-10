import React, { MouseEvent, useEffect, useMemo, useState } from 'react';
import { Button, Box, Avatar, Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import Link from 'next/link';
import { User } from '@up-from/graphql-ap/genql';
import { Pages } from '~/constants/pages';
import { getBooleanValue } from '~/util/text';
import { getFullDate, getFullDateAndTime } from '~/util/date';
import { useUserMutations } from '~/api/useUsersMutations';
import { useForm } from 'react-hook-form';
import { EditUserForm, EditUserArgs } from '../EditUserForm';
import { ConfirmationModalComponent } from '../Modal/ConfirmationModalComponent';
import { ImageEditorComponent } from '../Image/ImageEditorComponent';
import { ImageCropperShape } from '~/types/image';

import styles from './userCard.module.scss';
import { useEntityCardConfirmationActions } from '~/hooks/useEntityCardConfirmationActions';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';
import { GQLLocationType } from '~/types/googlePlaces';

export type Props = {
  user: User;
  isEditable: boolean;
};

export const UserCard = ({ user, isEditable }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationModalOpened, setIsConfirmationModalOpened] = useState(false);
  const { updateUser, disableUser, enableUser, uploadAvatar, removeAvatar } = useUserMutations();
  const confirmationActions = useEntityCardConfirmationActions(
    () => disableUser.disable({ id: user.id }),
    () => enableUser.enable({ id: user.id }),
  );

  const updateUserForm = useForm<EditUserArgs>();

  const values = updateUserForm.watch();
  useEffect(() => {
    updateUserForm.trigger();
  }, [values]);

  const onImageChange = (blob: Blob) => {
    uploadAvatar.upload(user.id, blob);
  };

  const onImageRemove = () => {
    removeAvatar.remove(user.id);
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(true);

    updateUserForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      id: user.id,
      about: user.about,
      location: user.location,
    });
  };

  const handleConfirmClick = () => {
    const { firstName, lastName, birthday, gender, email, location, phone, avatarUrl, id, about } =
      updateUserForm.getValues();

    updateUser.updateUser({
      firstName,
      lastName,
      birthday: typeof birthday === 'string' ? birthday : birthday.toISOString().split('T')[0],
      gender: gender.value ?? user.gender,
      email,
      phone,
      avatarUrl: avatarUrl,
      location,
      id,
      about,
    });

    // Switch back to non-edit mode
    setIsEditing(false);
    setIsConfirmationModalOpened(false);
  };

  const handleCloseModal = () => {
    setIsConfirmationModalOpened(false);
  };

  const handleSaveClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const isValid = await updateUserForm.trigger();
    if (!isValid) return;

    setIsConfirmationModalOpened(true);
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(false);
  };

  const handleLocationSelect = (location: GQLLocationType) => {
    updateUserForm.setValue('location', location as never);
  };

  useEffect(() => {
    updateUserForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      id: user.id,
      about: user.about,
    });
  }, [updateUserForm, user]);

  const age = useMemo(() => {
    return new Date().getFullYear() - new Date(user.birthday).getFullYear();
  }, [user.birthday]);

  if (!user || updateUser.fetching) {
    return <CircularProgress />;
  }

  return (
    <>
      <ConfirmationModalComponent
        isOpen={isConfirmationModalOpened}
        actionText="Confirm"
        buttonColor="primary"
        isLoading={updateUser.fetching}
        onActionClick={handleConfirmClick}
        onClose={handleCloseModal}>
        <Typography variant="body1">Are you sure you want to save edited information?</Typography>
        <Typography variant="subtitle2">
          Edited information will be displayed in the admin panel and in the application
        </Typography>
      </ConfirmationModalComponent>
      <Card className={styles.userCard}>
        <CardContent>
          {isEditable && (
            <Box className={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <Button
                    disabled={uploadAvatar.fetching || removeAvatar.fetching}
                    variant="contained"
                    endIcon={<RestoreIcon />}
                    onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  <Button
                    disabled={uploadAvatar.fetching || removeAvatar.fetching}
                    variant="contained"
                    endIcon={<SaveIcon />}
                    onClick={handleSaveClick}>
                    Save
                  </Button>
                  {uploadAvatar.fetching || removeAvatar.fetching ? <CircularProgress /> : <></>}
                </>
              ) : (
                <>
                  <Button variant="contained" endIcon={<EditIcon />} onClick={handleEditClick}>
                    Edit
                  </Button>
                  {user.isDisabled ? (
                    <ContainedButtonComponent
                      size="medium"
                      color="success"
                      isLoading={enableUser.fetching}
                      startIcon={<RestoreIcon />}
                      onClick={confirmationActions.restore.handleClick}>
                      Enable
                    </ContainedButtonComponent>
                  ) : (
                    <ContainedButtonComponent
                      size="medium"
                      color="error"
                      isLoading={disableUser.fetching}
                      startIcon={<DeleteIcon />}
                      onClick={confirmationActions.remove.handleClick}>
                      Disable
                    </ContainedButtonComponent>
                  )}
                </>
              )}
            </Box>
          )}

          <Grid container gap={2} alignItems="center">
            <Grid>
              {isEditing ? (
                <div className={styles.text}>
                  <ImageEditorComponent
                    shape={ImageCropperShape.CIRCLE}
                    src={user.avatarUrl}
                    className={styles.avatar}
                    onSave={onImageChange}
                    onRemove={onImageRemove}
                  />
                </div>
              ) : (
                <Link href={Pages.getUserPageLink(user.id) || ''} className={styles.text}>
                  <Avatar src={user.avatarUrl || ''} alt="User Avatar" className={styles.avatar} />
                </Link>
              )}
            </Grid>
            <Grid className={styles.inputBlock}>
              {isEditing ? (
                <>
                  <EditUserForm control={updateUserForm.control} onSelectLocation={handleLocationSelect} />
                </>
              ) : (
                <div className={styles.text}>
                  <Typography variant="h5" gutterBottom color="black">
                    <Link className={styles.LinkText} href={Pages.getUserPageLink(user.id) || ''}>
                      {user.firstName} {user.lastName}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">Id: {user.id}</Typography>
                  <br />
                  <Typography color="textSecondary">About Me: {user.about}</Typography>
                  <br />
                  <Typography color="textSecondary">Gender: {user.gender}</Typography>
                  <Typography color="textSecondary">Birthday: {getFullDate(user.birthday)}</Typography>
                  <Typography color="textSecondary">Age: {age}</Typography>
                  <Typography color="textSecondary">
                    Location:{' '}
                    <Link
                      target="_blank"
                      href={`https://maps.google.com/?q=${user.location?.lat},${user.location?.lng}`}>
                      {user.location?.locationName}
                    </Link>
                  </Typography>
                  <br />
                  <Typography color="textSecondary">
                    Email: <a href={`mailto:${user.email}`}>{user.email}</a>
                  </Typography>
                  <Typography color="textSecondary">
                    Phone: <a href={`tel:${user.phone}`}>{user.phone}</a>
                  </Typography>
                  {user.teams ? (
                    <>
                      <br />
                      <Typography color="textSecondary">Teams: {user.teams?.length}</Typography>
                    </>
                  ) : null}
                  <br />
                  <Typography color="textSecondary" sx={user.isDisabled ? { color: 'error.main' } : {}}>
                    Is Disabled: {getBooleanValue(user.isDisabled)}
                  </Typography>
                  <Typography color="textSecondary" sx={!user.isSignupCompleted ? { color: 'error.main' } : {}}>
                    Is Signup Completed: {getBooleanValue(user.isSignupCompleted)}
                  </Typography>
                  <br />
                  <Typography color="textSecondary">Updated At: {getFullDateAndTime(user.updatedAt)}</Typography>
                  <Typography color="textSecondary">Created At: {getFullDateAndTime(user.createdAt)}</Typography>
                </div>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ConfirmationModalComponent
        isOpen={confirmationActions.remove.isModalVisible}
        actionText="Disable"
        isLoading={disableUser.fetching}
        onActionClick={confirmationActions.remove.handleConfirmClick}
        onClose={confirmationActions.remove.handleModalClose}>
        <Typography variant="body1">Are you sure you want to disable the user?</Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={confirmationActions.restore.isModalVisible}
        actionText="Enable"
        buttonColor="success"
        isLoading={enableUser.fetching}
        onActionClick={confirmationActions.restore.handleConfirmClick}
        onClose={confirmationActions.restore.handleModalClose}>
        <Typography variant="body1">Are you sure you want to enable the user?</Typography>
      </ConfirmationModalComponent>
    </>
  );
};
