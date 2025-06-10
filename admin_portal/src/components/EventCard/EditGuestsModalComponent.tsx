import React, { FC, useState } from 'react';
import { Event, User } from '@up-from/graphql-ap/genql';
import { ActionModalComponent } from '~/components/Modal/ActionModalComponent';
import { CreateEventAttendeesFormSelectorComponent } from '~/components/CreateEvent/CreateEventAttendeesFormSelectorComponent';
import { useEventMutations } from '~/api/useEventsMutations';

import styles from './edit-guests-modal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
};

export const EditGuestsModalComponent: FC<Props> = ({ isOpen, onClose, event }) => {
  const guests = event.guests.map(guest => guest.user!);

  const [selectedMembers, setSelectedMembers] = useState<User[]>(guests);
  const { setEventGuests } = useEventMutations();

  const onSubmit = async () => {
    const result = selectedMembers.map(user => user.id);
    await setEventGuests.setGuests({ eventId: event.id, userIds: result }, onClose);
  };

  return (
    <ActionModalComponent
      className={styles.createEventModal}
      bodyClassName={styles.createEventModalBody}
      title="Edit event guests"
      isOpen={isOpen}
      actionText="Save"
      isLoading={setEventGuests.fetching}
      onActionClick={onSubmit}
      onClose={onClose}>
      <CreateEventAttendeesFormSelectorComponent
        selectedMembers={selectedMembers || []}
        members={event.team?.members.filter(({ user }) => !!user).map(({ user }) => user!) || []}
        onChange={setSelectedMembers}
        ownerId={event.owner?.id}
      />
    </ActionModalComponent>
  );
};
