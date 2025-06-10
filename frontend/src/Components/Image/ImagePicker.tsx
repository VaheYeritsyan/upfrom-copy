import React, { FC, useState } from 'react';
import { default as ImagePickerBase } from 'react-native-image-crop-picker';
import { StyleSheet, View, ViewProps } from 'react-native';
import axios from 'axios';
import { ArrowCircleUp2, CloseCircle } from 'iconsax-react-native';
import { ImagePickerData } from '~types/imagePicker';
import { Button } from '~Components/Button';
import { Modal } from '../Modals/Modal';
import { SmallIconButton } from '~Components/SmallIconButton';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';

export type Props = ViewProps & {
  title: string;
  isLoading?: boolean;
  isUploaded?: boolean;
  onRemove: () => void;
  onSelect: (imageData: ImagePickerData) => void;
};

export const ImagePicker: FC<Props> = ({
  title,
  isUploaded,
  isLoading,
  onSelect,
  onRemove,
  children,
  style,
  ...props
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleImageSelect = async (source: 'openCamera' | 'openPicker') => {
    const { path, sourceURL } = await ImagePickerBase[source]({
      mediaType: 'photo',
      cropping: true,
      width: 500,
      height: 500,
      forceJpg: true,
      compressImageQuality: 0.8,
    });

    setModalVisible(false);

    const { data: blob } = await axios(path, { responseType: 'blob' });
    onSelect({ path, blob, sourceUrl: sourceURL });
  };

  return (
    <View {...props} style={[styles.container, style]}>
      {children}

      <Typography variant="body1SemiBold" align="center">
        {isLoading ? 'Loading...' : title}
      </Typography>

      {isUploaded ? (
        <SmallIconButton
          Icon={CloseCircle}
          iconColor={colors.danger}
          iconVariant="Bold"
          text="Remove"
          textVariant="body3Medium"
          textColor={colors.danger}
          onPress={onRemove}
        />
      ) : (
        <SmallIconButton
          Icon={ArrowCircleUp2}
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
