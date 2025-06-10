import React, { useMemo, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import { Control, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import axios from 'axios';
import { ArrowUp, CloseCircle } from 'iconsax-react-native';
import { User } from '@up-from/graphql/genql';
import { useTypedMutation } from '~urql';
import { Button } from '~Components/Button';
import { Modal } from '../Modals/Modal';
import { AvatarImage } from './AvatarImage';
import { useCurrentUserContext } from '~Hooks/useCurrentUserContext';
import { SmallIconButton } from '~Components/SmallIconButton';
import { Typography } from '~Components/Typography';
import { getInitials } from '~utils/textFormat';
import { colors } from '~Theme/Colors';

type FormValues = Pick<User, 'firstName' | 'lastName'>;

type Props<FormValuesType extends FormValues> = {
  control: Control<FormValuesType>;
};

export const AvatarEditor = <FormValuesType extends FormValues>({ control }: Props<FormValuesType>) => {
  const { firstName, lastName } = useWatch({ control });
  const [modalVisible, setModalVisible] = useState(false);
  const { currentUser } = useCurrentUserContext();
  const [isLoading, setIsLoading] = useState(false);

  const [, generateAvatarUploadUrl] = useTypedMutation(() => ({
    generateAvatarUploadUrl: true,
  }));

  const [, completeAvatarUpload] = useTypedMutation(() => ({
    completeAvatarUpload: { id: true, avatarUrl: true },
  }));

  const [, deleteAvatar] = useTypedMutation(() => ({
    removeAvatar: { id: true, avatarUrl: true },
  }));

  const initials = useMemo(() => {
    if (currentUser?.avatarUrl) return null;
    if (!firstName && !lastName) return null;

    return getInitials([firstName, lastName].join(' '));
  }, [firstName, lastName, currentUser?.avatarUrl]);

  const uploadAvatar = async (path: string) => {
    setIsLoading(true);

    try {
      const { data: imageBody } = await axios(path, { responseType: 'blob' });
      const { data: avatarUrlData, error } = await generateAvatarUploadUrl({});
      if (!avatarUrlData || error) {
        console.log(error);
        return;
      }

      await fetch(avatarUrlData.generateAvatarUploadUrl, { method: 'PUT', body: imageBody });
      await completeAvatarUpload({});
    } catch (e) {
      console.log('error posting:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const removeAvatar = async () => {
    setIsLoading(true);

    try {
      await deleteAvatar({});
    } catch (e) {
      console.log('error removing:', e);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleImageSelect(source: 'openCamera' | 'openPicker') {
    const selectedImage = await ImagePicker[source]({
      mediaType: 'photo',
      cropping: true,
      width: 500,
      height: 500,
      forceJpg: true,
      compressImageQuality: 0.8,
    });

    setModalVisible(false);
    await uploadAvatar(selectedImage.path);
  }

  return (
    <View style={styles.container}>
      <AvatarImage url={currentUser?.avatarUrl} size={68} initials={initials} />

      <Typography variant="body1SemiBold" align="center">
        {isLoading ? 'Loading...' : 'Profile Photo'}
      </Typography>

      {currentUser?.avatarUrl ? (
        <SmallIconButton
          Icon={CloseCircle}
          iconColor={colors.danger}
          iconVariant="Bold"
          text="Remove"
          textVariant="body3Medium"
          textColor={colors.danger}
          onPress={removeAvatar}
        />
      ) : (
        <SmallIconButton
          Icon={ArrowUp}
          iconVariant="Bold"
          text="Upload"
          textVariant="body3Medium"
          textColor={colors.primaryMain}
          onPress={() => setModalVisible(true)}
        />
      )}

      <Modal isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Button
          style={styles.buttonSpacing}
          text="View photo library"
          onPress={() => handleImageSelect('openPicker')}
        />
        <Button style={styles.buttonSpacing} text="Take a photo" onPress={() => handleImageSelect('openCamera')} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: 'center',
  },
  buttonSpacing: {
    marginTop: 5,
  },
});
