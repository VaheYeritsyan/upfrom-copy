import React, { FC, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomScreenModal, Props as BottomScreenModalProps } from '~Components/Modals/BottomScreenModal';
import { Typography } from '~Components/Typography';
import { Button } from '~Components/Button';
import { colors } from '~Theme/Colors';

export type Props = Omit<BottomScreenModalProps, 'style'> & {
  headerStartAdornment?: ReactNode;
  title?: string;
  isTitleLeftAligned?: boolean;
  subtitle?: string;
  isCustom?: boolean;
};

export const ActionModal: FC<Props> = ({
  children,
  title,
  isTitleLeftAligned,
  isCustom,
  subtitle,
  headerStartAdornment,
  ...props
}) => (
  <BottomScreenModal {...props}>
    {isCustom ? null : (
      <View style={[styles.header, (!!subtitle || isTitleLeftAligned) && styles.headerWithSubtitle]}>
        {headerStartAdornment}
        <Typography variant="h4">{title}</Typography>
        {subtitle ? (
          <Typography style={styles.subtitle} variant="body1Medium">
            {subtitle}
          </Typography>
        ) : null}
      </View>
    )}

    <View style={[styles.content, isCustom && { marginTop: 0 }]}>{children}</View>

    <Button
      style={styles.closeButton}
      text="Close"
      color="grey"
      fullWidth
      size="large"
      shape="rectangle"
      onPress={props.onClose}
    />
  </BottomScreenModal>
);

const styles = StyleSheet.create({
  modal: {},
  header: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerWithSubtitle: {
    gap: 4,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  subtitle: {
    color: colors.grey500,
  },
  content: {
    marginTop: 24,
    gap: 8,
  },
  closeButton: {
    marginTop: 12,
  },
});
