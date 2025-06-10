import React, { useState, MouseEvent, useEffect } from 'react';
import { Card, CardContent, Grid, Typography, CircularProgress, Box, Button } from '@mui/material';
import { EventOutlined, Restore, Delete, Save, Edit } from '@mui/icons-material';
import Link from 'next/link';
import { Organization } from '@up-from/graphql-ap/genql';
import { Pages } from '~/constants/pages';
import { getFullDateAndTime } from '~/util/date';
import { useForm } from 'react-hook-form';
import { EditOrganizationArgs, EditOrganizationForm } from '../EditOrganizationForm';
import { ConfirmationModalComponent } from '../Modal/ConfirmationModalComponent';
import { useEntityCardConfirmationActions } from '~/hooks/useEntityCardConfirmationActions';
import { ContainedButtonComponent } from '~/components/Button/ContainedButtonComponent';
import { useOrganizationMutations } from '~/api/useOrganizationMutations';
import styles from './organizationCard.module.scss';

export type Props = {
  organization: Organization;
  onOrganizationClick?: () => void;
  isEditable: boolean;
};

export const OrganizationCard = ({ organization, onOrganizationClick, isEditable }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmationModalOpened, setIsConfirmationModalOpened] = useState(false);
  const { removeOrganization, updateOrganization } = useOrganizationMutations();
  const confirmationActions = useEntityCardConfirmationActions(() => removeOrganization.remove(organization.id));

  const updateOrganizationForm = useForm<EditOrganizationArgs>();

  const values = updateOrganizationForm.watch();
  useEffect(() => {
    updateOrganizationForm.trigger();
  }, [values]);
  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(true);
    updateOrganizationForm.reset({ name: organization.name, details: organization.details });
  };
  const handleConfirmClick = () => {
    // Save the edited user data
    // You can perform the API/database update here
    const { name, details } = updateOrganizationForm.getValues();
    updateOrganization.update({ name, details, id: organization.id });

    // Switch back to non-edit mode
    setIsEditing(false);
    setIsConfirmationModalOpened(false);
  };

  const handleCloseModal = () => {
    setIsConfirmationModalOpened(false);
  };

  const handleSaveClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const isValid = await updateOrganizationForm.trigger();
    if (!isValid) return;

    setIsConfirmationModalOpened(true);
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsEditing(false);
  };

  const handleCalendarClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    window.open(Pages.getOrganizationCalendarPageLink(organization.id), '_blank');
  };

  useEffect(() => {
    updateOrganizationForm.reset({ name: organization.name, details: organization.details });
  }, [organization, updateOrganizationForm]);

  if ((!organization || updateOrganization.fetching) && !isEditing) {
    return <CircularProgress />;
  }

  return (
    <>
      <ConfirmationModalComponent
        isOpen={isConfirmationModalOpened}
        actionText="Confirm"
        buttonColor="primary"
        isLoading={updateOrganization.fetching}
        onActionClick={handleConfirmClick}
        onClose={handleCloseModal}>
        <Typography variant="body1">Are you sure you want to save edited information?</Typography>
        <Typography variant="subtitle2">
          Edited information will be displayed in the admin panel and in the application
        </Typography>
      </ConfirmationModalComponent>
      <Card className={styles.organizationCard}>
        <CardContent onClick={onOrganizationClick}>
          {isEditable && (
            <Box className={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <Button
                    disabled={updateOrganization.fetching}
                    variant="contained"
                    endIcon={<Restore />}
                    onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  <Button
                    disabled={updateOrganization.fetching}
                    variant="contained"
                    endIcon={<Save />}
                    onClick={handleSaveClick}>
                    Save
                  </Button>
                  {updateOrganization.fetching ? <CircularProgress /> : <></>}
                </>
              ) : (
                <>
                  <Button variant="contained" endIcon={<EventOutlined />} onClick={handleCalendarClick}>
                    Calendar
                  </Button>
                  <ContainedButtonComponent size="medium" endIcon={<Edit />} onClick={handleEditClick}>
                    Edit
                  </ContainedButtonComponent>
                  <ContainedButtonComponent
                    size="medium"
                    color="error"
                    isLoading={removeOrganization.fetching}
                    startIcon={<Delete />}
                    onClick={confirmationActions.remove.handleClick}>
                    Remove
                  </ContainedButtonComponent>
                </>
              )}
            </Box>
          )}
          <Grid container alignItems="center" gap={2}>
            <Grid className={styles.inputBlock}>
              {isEditing ? (
                <EditOrganizationForm control={updateOrganizationForm.control} />
              ) : (
                <div className={styles.text}>
                  <Typography variant="h5" color="black" gutterBottom>
                    <Link className={styles.LinkText} href={Pages.getOrganizationPageLink(organization.id) || ''}>
                      {organization.name}
                    </Link>
                  </Typography>
                  <Typography color="textSecondary">Organization ID: {organization.id}</Typography>
                  <Typography color="textSecondary">Details: {organization.details}</Typography>
                  {organization.teams ? (
                    <Typography color="textSecondary">Teams: {organization.teams.length}</Typography>
                  ) : null}
                  <br />
                  <Typography color="textSecondary">
                    Updated At: {getFullDateAndTime(organization.updatedAt)}
                  </Typography>
                  <Typography color="textSecondary">
                    Created At: {getFullDateAndTime(organization.createdAt)}
                  </Typography>
                </div>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ConfirmationModalComponent
        isOpen={confirmationActions.remove.isModalVisible}
        actionText="Remove"
        isLoading={removeOrganization.fetching}
        onActionClick={confirmationActions.remove.handleConfirmClick}
        onClose={confirmationActions.remove.handleModalClose}>
        <Typography variant="body1">Are you sure you want to remove the organization?</Typography>
      </ConfirmationModalComponent>
    </>
  );
};
