import React, { MouseEvent, useEffect, useState } from 'react';
import { Button, Box, Avatar, Card, CardContent, Grid, Typography, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { People } from '@mui/icons-material';
import Link from 'next/link';
import { Event } from '@up-from/graphql-ap/genql';
import { Pages } from '~/constants/pages';
import { getFullDateAndTime } from '~/util/date';
import { useEventMutations } from '~/api/useEventsMutations';
import { useForm } from 'react-hook-form';
import { EditEventForm, EditEventArgs } from '../EditEventForm/index';
import { ConfirmationModalComponent } from '../Modal/ConfirmationModalComponent';
import { ImageEditorComponent } from '../Image/ImageEditorComponent';
import { ImageCropperShape } from '~/types/image';

import styles from './eventCard.module.scss';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';
import { getBooleanValue } from '~/util/text';
import { useEntityCardConfirmationActions } from '~/hooks/useEntityCardConfirmationActions';
import { EditGuestsModalComponent } from './EditGuestsModalComponent';
import { GQLLocationType } from '~/types/googlePlaces';

export type Props = {
  event: Event;
  isEditable: boolean;
};

export const EventCard = ({ event, isEditable }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationModalOpened, setIsConfirmationModalOpened] = useState(false);
  const [isEditGuestModalOpened, setIsEditGuestModalOpened] = useState(false);
  const { updateEvent, uploadImage, removeImage, cancelEvent, restoreEvent } = useEventMutations();

  const confirmationActions = useEntityCardConfirmationActions(
    () => cancelEvent.cancel({ id: event.id }),
    () => restoreEvent.restore({ id: event.id }),
  );

  const updateEventForm = useForm<EditEventArgs>();

  const values = updateEventForm.watch();
  useEffect(() => {
    updateEventForm.trigger();
  }, [values]);

  const handleEditClick = (mouseEvent: MouseEvent<HTMLButtonElement>) => {
    mouseEvent.stopPropagation();
    setIsEditing(true);

    updateEventForm.reset({
      title: event.title,
      description: event.description,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      location: event.location,
      address: event.address,
      imageUrl: event.imageUrl,
      id: event.id,
      isCancelled: event.isCancelled,
      isIndividual: event.isIndividual,
      ownerId: event.owner?.id,
      teamId: event.teamId,
    });
  };

  const onImageChange = (blob: Blob) => {
    uploadImage.upload(event.id, blob);
  };

  const onImageRemove = () => {
    removeImage.remove(event.id);
  };

  const handleConfirmClick = () => {
    const {
      address,
      description,
      endsAt,
      id,
      imageUrl,
      isCancelled,
      isIndividual,
      location,
      ownerId,
      startsAt,
      teamId,
      title,
    } = updateEventForm.getValues();

    updateEvent.update({
      address,
      description,
      endsAt,
      id,
      imageUrl,
      isCancelled,
      isIndividual,
      location,
      ownerId,
      startsAt,
      teamId,
      title,
    });

    // Switch back to non-edit mode
    setIsEditing(false);
    setIsConfirmationModalOpened(false);
  };

  const handleCloseModal = () => {
    setIsConfirmationModalOpened(false);
  };

  const handleCloseEditGuestModal = () => {
    setIsEditGuestModalOpened(false);
  };

  const handleEditGuestClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditGuestModalOpened(true);
  };

  const handleSaveClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const isValid = await updateEventForm.trigger();
    if (!isValid) return;

    setIsConfirmationModalOpened(true);
  };

  const handleSelectLocation = (location: GQLLocationType) => {
    updateEventForm.setValue('location', location as never);
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(false);
  };

  useEffect(() => {
    updateEventForm.reset({
      title: event.title,
      description: event.description,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      location: event.location,
      address: event.address,
      imageUrl: event.imageUrl,
      id: event.id,
      isCancelled: event.isCancelled,
      isIndividual: event.isIndividual,
      ownerId: event.owner?.id,
      teamId: event.teamId,
    });
  }, [event, updateEventForm]);

  if (!event || updateEvent.fetching) {
    return <CircularProgress />;
  }

  return (
    <>
      <ConfirmationModalComponent
        isOpen={isConfirmationModalOpened}
        actionText="Confirm"
        buttonColor="primary"
        isLoading={updateEvent.fetching}
        onActionClick={handleConfirmClick}
        onClose={handleCloseModal}>
        <Typography variant="body1">Are you sure you want to save edited information?</Typography>
        <Typography variant="subtitle2">
          Edited information will be displayed in the admin panel and in the application
        </Typography>
      </ConfirmationModalComponent>
      <EditGuestsModalComponent isOpen={isEditGuestModalOpened} onClose={handleCloseEditGuestModal} event={event} />
      <Card className={styles.eventCard}>
        <CardContent>
          {isEditable && (
            <Box className={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <Button
                    disabled={uploadImage.fetching || removeImage.fetching}
                    variant="contained"
                    endIcon={<RestoreIcon />}
                    onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  {event.team && !event.isIndividual && (
                    <Button
                      disabled={uploadImage.fetching || removeImage.fetching}
                      variant="contained"
                      endIcon={<People />}
                      onClick={handleEditGuestClick}>
                      Edit guests list
                    </Button>
                  )}

                  <Button
                    disabled={uploadImage.fetching || removeImage.fetching}
                    variant="contained"
                    endIcon={<SaveIcon />}
                    onClick={handleSaveClick}>
                    Save
                  </Button>
                  {uploadImage.fetching || removeImage.fetching ? <CircularProgress /> : <></>}
                </>
              ) : (
                <>
                  <Button variant="contained" endIcon={<EditIcon />} onClick={handleEditClick}>
                    Edit
                  </Button>
                  {event.isCancelled ? (
                    <ContainedButtonComponent
                      variant="contained"
                      startIcon={<RestoreIcon />}
                      isLoading={restoreEvent.fetching}
                      size="medium"
                      color="success"
                      onClick={confirmationActions.restore.handleClick}>
                      Restore Event
                    </ContainedButtonComponent>
                  ) : (
                    <ContainedButtonComponent
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      size="medium"
                      isLoading={cancelEvent.fetching}
                      color="error"
                      onClick={confirmationActions.remove.handleClick}>
                      Cancel Event
                    </ContainedButtonComponent>
                  )}
                </>
              )}
            </Box>
          )}

          <Grid container spacing={2} alignItems="center">
            <Grid className={styles.inputBlock}>
              {isEditing ? (
                <div className={styles.text}>
                  <ImageEditorComponent
                    shape={ImageCropperShape.RECTANGLE}
                    src={event.imageUrl}
                    className={styles.avatar}
                    onSave={onImageChange}
                    onRemove={onImageRemove}
                  />
                </div>
              ) : (
                <Link href={Pages.getEventPageLink(event.id) || ''} className={styles.text}>
                  <Avatar
                    variant="square"
                    src={event.imageUrl || undefined}
                    alt="Event image"
                    className={styles.avatar}
                  />
                </Link>
              )}
              {isEditing ? (
                <>
                  <EditEventForm control={updateEventForm.control} onSelectLocation={handleSelectLocation} />
                </>
              ) : (
                <div className={styles.text}>
                  <Typography variant="h5" gutterBottom color="black">
                    <Link className={styles.LinkText} href={Pages.getEventPageLink(event.id) || ''}>
                      {event.title}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">Id: {event.id}</Typography>
                  <Typography color="textSecondary">Description: {event.description}</Typography>
                  <br />
                  <Typography color="textSecondary">Starts at: {getFullDateAndTime(event.startsAt)}</Typography>
                  <Typography color="textSecondary">Ends at: {getFullDateAndTime(event.endsAt)}</Typography>
                  <br />
                  <Typography color="textSecondary">
                    Location:{' '}
                    <Link
                      target="_blank"
                      href={`https://maps.google.com/?q=${event.location?.lat},${event.location?.lng}`}>
                      {event.location?.locationName}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">Address: {event.address}</Typography>
                  <br />
                  <Typography color="textSecondary" sx={event.isCancelled ? { color: 'error.main' } : {}}>
                    Is Cancelled: {getBooleanValue(event.isCancelled)}
                  </Typography>
                  <br />
                  <Typography color="textSecondary">Created at: {getFullDateAndTime(event.createdAt)}</Typography>
                  <Typography color="textSecondary">Updated at: {getFullDateAndTime(event.updatedAt)}</Typography>
                </div>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ConfirmationModalComponent
        isOpen={confirmationActions.remove.isModalVisible}
        actionText="Cancel"
        isLoading={cancelEvent.fetching}
        onActionClick={confirmationActions.remove.handleConfirmClick}
        onClose={confirmationActions.remove.handleModalClose}>
        <Typography variant="body1">Are you sure you want to cancel the event?</Typography>
      </ConfirmationModalComponent>

      <ConfirmationModalComponent
        isOpen={confirmationActions.restore.isModalVisible}
        actionText="Restore"
        buttonColor="success"
        isLoading={restoreEvent.fetching}
        onActionClick={confirmationActions.restore.handleConfirmClick}
        onClose={confirmationActions.restore.handleModalClose}>
        <Typography variant="body1">Are you sure you want to restore the event?</Typography>
      </ConfirmationModalComponent>
    </>
  );
};
