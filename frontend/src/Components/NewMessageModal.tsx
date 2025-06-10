import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';
import { colors } from '~Theme/Colors';
import { FullScreenModal } from '~Components/Modals/FullScreenModal';
import { Channel, ChannelMemberResponse, DefaultGenerics } from 'stream-chat';
import { Team } from '@up-from/graphql/genql';
import { typography } from '~Theme/Typography';
import { useChatContext } from '~Context/ChatContext';
import { useChatClient } from './ChatClient/hooks/useChatClient';
import { Selector } from './Selector';
import { ContainedButton } from './ContainedButton';
import { LargeTitleHeader } from '~Components/ScreenHeader/LargeTitleHeader';
import { EntityCard } from '~Components/EntityCard';
import { showAlert } from '~utils/toasts';
import { MainLayout } from '~Components/MainLayout';
import { TextField } from '~Components/Field/TextField';
import { Divider } from '~Components/Divider';
import { Typography } from '~Components/Typography';
import { useForm } from 'react-hook-form';
import { KeyboardView } from '~Components/KeyboardView';
import { PreviewMessengerCard } from '~Components/ChatClient/PreviewMessengerCard';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { getPlural } from '~utils/textFormat';
import { HeaderBackButton, headerBackButtonContainerStyles } from '~Components/ScreenHeader/HeaderBackButton';
import { TeamSelector } from '~Components/TeamSelector';

const selectorOptions = ['Direct', 'Group'];

type NewMessageModalProps = {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  users: ChannelMemberResponse<DefaultGenerics>[];
  teams: Team[];
  redirectToDirectChannel: (channel?: Channel) => void;
};

type FormData = {
  name: string;
};

enum GroupStep {
  MEMBERS,
  NAME,
}

export function NewMessageModal({
  modalVisible,
  setModalVisible,
  users,
  teams,
  redirectToDirectChannel,
}: NewMessageModalProps) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedOption, setSelectedOption] = useState<string>(selectorOptions[0]);
  const [groupStep, setGroupStep] = useState(GroupStep.MEMBERS);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };
  const { control, setError, handleSubmit, reset } = useForm<FormData>();
  const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
  const [existingChannels, setExistingChannels] = useState<Channel[]>([]);
  const [isExistingChannelsLoading, setIsExistingChannelsLoading] = useState(false);
  const { chatClient } = useChatContext();
  const { currentUser } = useCurrentUserContext();
  const { createDirectMessageChannel } = useChatClient();

  useEffect(() => {
    if (selectedUserIDs.length >= 2 && currentUser?.teams && groupStep === GroupStep.NAME) {
      setIsExistingChannelsLoading(true);
      chatClient
        ?.queryChannels({
          members: { $eq: [...selectedUserIDs, currentUser.id] },
          id: { $nin: currentUser?.teams.map(({ id }) => id) },
          teamId: { $eq: selectedTeam.id },
        })
        .then(setExistingChannels)
        .catch(() => {
          setExistingChannels([]);
        })
        .finally(() => {
          setIsExistingChannelsLoading(false);
        });
    } else {
      setExistingChannels([]);
    }
  }, [groupStep]);

  const resetData = () => {
    setSelectedUserIDs([]);
    setSelectedOption(selectorOptions[0]);
    reset({ name: '' });
    setGroupStep(GroupStep.MEMBERS);
  };

  useEffect(() => {
    if (modalVisible) return;

    resetData();
  }, [modalVisible]);

  const createDirectChat = async (userIDs: string[]) => {
    const newChannel = await createDirectMessageChannel(userIDs);
    if (newChannel) {
      redirectToDirectChannel(newChannel);
      resetData();
    } else {
      showAlert('Failed to create channel, try again');
    }
  };

  const createGroupChat = async (state: FormData) => {
    const existingChannel =
      existingChannels.find(channel => {
        return channel.data?.name === state.name && channel.data?.teamId === selectedTeam.id;
      }) || null;
    if (existingChannel) {
      setError('name', { message: 'Channel already exists', type: 'pattern' });
      return;
    }

    const newChannel = await createDirectMessageChannel(selectedUserIDs, state.name, selectedTeam.id);
    if (newChannel) {
      redirectToDirectChannel(newChannel);
      resetData();
    } else {
      showAlert('Failed to create group channel, try again');
    }
  };

  const handleContinuePress = () => {
    setGroupStep(GroupStep.NAME);
  };

  const handleTeamChange = (team: Team) => {
    setSelectedTeam(team);
  };

  const isGroupChatSelected = selectedOption === 'Group';
  const isGroupStepMembers = groupStep === GroupStep.MEMBERS;

  function handleSelect(userId: string) {
    const alreadySelected = selectedUserIDs.includes(userId);
    const newSelected = alreadySelected ? selectedUserIDs.filter(id => id !== userId) : [...selectedUserIDs, userId];
    setSelectedUserIDs(newSelected);
  }

  const notDisabledAndTeamMembers = useMemo(() => {
    if (isGroupChatSelected) {
      return users.filter(user => {
        return (
          !user.user?.deactivated_at && selectedTeam?.members.map(member => member.user?.id).includes(user?.user?.id)
        );
      });
    }

    return users.filter(user => !user.user?.deactivated_at);
  }, [users, selectedTeam?.id, isGroupChatSelected]);

  const handleBackPress = () => {
    if (isGroupStepMembers) {
      setModalVisible(false);
      resetData();
    } else {
      setGroupStep(GroupStep.MEMBERS);
    }
  };

  return (
    <FullScreenModal isVisible={modalVisible} setIsVisible={setModalVisible}>
      <KeyboardView>
        <MainLayout
          style={styles.modalContainer}
          headerContainerStyle={headerBackButtonContainerStyles}
          stickyBottomContainerStyle={styles.buttonContainer}
          header={<HeaderBackButton text={isGroupStepMembers ? 'Cancel' : undefined} onPress={handleBackPress} />}
          stickyBottomContent={
            isGroupChatSelected ? (
              <ContainedButton
                color="blueGradient"
                onPress={isGroupStepMembers ? handleContinuePress : handleSubmit(createGroupChat)}
                text={isGroupStepMembers ? 'Continue' : 'Create Group'}
                disabled={(isGroupStepMembers && selectedUserIDs.length <= 1) || isExistingChannelsLoading}
              />
            ) : null
          }>
          <LargeTitleHeader style={styles.modalHeader} title="New Message" />

          {isGroupStepMembers ? (
            <View>
              <Selector
                style={styles.selectorWrapper}
                options={selectorOptions}
                selectedOption={selectedOption}
                onOptionSelected={handleOptionSelect}
              />

              {isGroupChatSelected ? (
                <TeamSelector
                  style={styles.teamSelector}
                  value={selectedTeam}
                  teams={teams}
                  handleChange={handleTeamChange}
                />
              ) : null}

              <Divider />
              <Typography variant="h4">Your Contacts</Typography>
              <Text style={styles.usersListSubHeader}>
                {notDisabledAndTeamMembers.length > 0
                  ? `Select the member${selectedOption === 'Direct' ? '' : 's'} you want to message.`
                  : 'You are only one member in your team.'}
              </Text>
              {notDisabledAndTeamMembers.map((userData, index) => {
                const user = userData.user!;
                const commonProps = {
                  name: user.name!,
                  avatarUrl: user.image as string,
                  key: index,
                };

                if (isGroupChatSelected) {
                  return (
                    <EntityCard
                      {...commonProps}
                      isChecked={selectedUserIDs.includes(user.id)}
                      onPress={() => handleSelect(user.id)}
                      style={styles.userContainer}
                    />
                  );
                } else {
                  return (
                    <EntityCard
                      {...commonProps}
                      onPress={() => createDirectChat([user.id])}
                      style={styles.userContainer}
                      isArrowVisible
                    />
                  );
                }
              })}
            </View>
          ) : (
            <>
              {isGroupChatSelected ? (
                <View style={styles.selectorWrapper}>
                  <View style={styles.groupNameSection}>
                    <Typography variant="h4">Add a Group Name</Typography>
                    <TextField
                      control={control}
                      name="name"
                      radius="all"
                      label="Group Name"
                      rules={{ required: 'Required', maxLength: { value: 100, message: 'Max length exceeded' } }}
                    />
                  </View>

                  {existingChannels.length ? (
                    <>
                      <Divider />
                      <Typography variant="h4">Existing Groups</Typography>
                      <Text style={styles.usersListSubHeader}>
                        We found {existingChannels.length} existing {getPlural('group', existingChannels.length)} with
                        the selected contacts. If you select one of them, creating a new group message will be
                        discarded.
                      </Text>
                      {existingChannels.map(channel => (
                        <PreviewMessengerCard
                          key={(channel?.data?.id as string) || ''}
                          onPress={() => redirectToDirectChannel(channel)}
                          // There is an error in data types in stream-chat library, will update it after they will fix an issue
                          // @ts-ignore
                          channel={channel}
                          // There is an error in data types in stream-chat library, will update it after they will fix an issue
                          // @ts-ignore
                          latestMessagePreview={{ messageObject: channel.lastMessage() }}
                        />
                      ))}
                    </>
                  ) : null}
                </View>
              ) : null}
            </>
          )}
        </MainLayout>
      </KeyboardView>
    </FullScreenModal>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  selectorWrapper: {
    width: screenWidth - 24 - 24,
  },
  teamSelector: {
    marginTop: 32,
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    paddingTop: 100,
  },
  doneLabel: {
    color: colors.dangerLight,
  },
  modalHeader: {
    marginBottom: 20,
  },
  inputHeader: {
    marginTop: 32,
    color: colors.black,
    ...typography.h4,
  },
  groupNameSection: {
    gap: 18,
  },
  usersListSubHeader: {
    marginTop: 4,
    marginBottom: 18,
    color: colors.grey500,
    ...typography.body1Medium,
  },
  userContainer: {
    marginBottom: 8,
  },
  input: {
    marginTop: 18,
    height: 56,
    borderColor: colors.grey200,
    borderWidth: 1,
    borderRadius: 6,
    padding: 16,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
