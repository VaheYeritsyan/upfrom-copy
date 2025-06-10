import React, { ChangeEvent, FC } from 'react';
import { Typography, Checkbox, Box, InputLabel, MenuItem, Tooltip } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { User } from '@up-from/graphql-ap/genql';
import { getPlural } from 'frontend/src/utils/textFormat';
import { ImageComponent } from '~/components/Image/ImageComponent';
import styles from './create-event-attendees-selector.module.scss';

type Props = {
  selectedMembers: User[];
  members: User[];
  onChange: (members: User[]) => void;
  ownerId?: string;
};

export const CreateEventAttendeesFormSelectorComponent: FC<Props> = ({
  selectedMembers,
  members,
  ownerId,
  onChange,
}) => {
  const selectedMembersIds = selectedMembers.map(({ id }) => id);
  const isAllSelected = members.length
    ? members.every(({ id }) => (ownerId === id ? true : selectedMembersIds.includes(id)))
    : false;
  const isAllIndeterminate = !isAllSelected && selectedMembers.some(({ id }) => selectedMembersIds.includes(id));

  const handleSelectAllChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    onChange(currentTarget.checked ? members.filter(({ id }) => id !== ownerId) : []);
  };

  const handleChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = currentTarget;

    if (checked) {
      const member = members.find(({ id }) => id === name) || null;
      if (!member) return;
      onChange([...selectedMembers, member]);
    } else {
      onChange(selectedMembers.filter(({ id }) => id !== name));
    }
  };

  return (
    <Box>
      <InputLabel htmlFor="select-all-members">
        <MenuItem className={styles.createEventTeamMembersHeader}>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isAllIndeterminate}
            onChange={handleSelectAllChange}
            size="small"
            id="select-all-members"
          />
          <Typography variant="body1">
            {members.length} {getPlural('Team member', members.length)}
          </Typography>
        </MenuItem>
      </InputLabel>

      {members.map(member => {
        const memberId = member.id;
        const isOwner = ownerId === memberId;

        return (
          <InputLabel htmlFor={memberId} key={memberId}>
            <Tooltip title={isOwner ? "The event owner can't be invited" : ''}>
              <MenuItem className={styles.createEventTeamMembersItem}>
                <Checkbox
                  name={memberId}
                  id={memberId}
                  disabled={isOwner}
                  indeterminate={isOwner}
                  indeterminateIcon={<CheckCircle />}
                  checked={selectedMembersIds.includes(memberId)}
                  onChange={handleChange}
                  size="small"
                />

                <Box className={styles.createEventTeamMembersItemMain}>
                  <ImageComponent
                    className={styles.createEventTeamMembersItemImg}
                    src={member.avatarUrl || undefined}
                  />
                  <Typography variant="body2">{[member.firstName, member.lastName].join(' ')}</Typography>
                </Box>
              </MenuItem>
            </Tooltip>
          </InputLabel>
        );
      })}
    </Box>
  );
};
