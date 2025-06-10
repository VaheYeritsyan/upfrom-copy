import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { MessageQuestion } from 'iconsax-react-native';
import { ActionModal, Props as ActionModalProps } from '~Components/Modals/ActionModal';
import { Button } from '~Components/Button';
import { colors } from '~Theme/Colors';
import { Typography } from '~Components/Typography';

type Props = Pick<ActionModalProps, 'isVisible' | 'onClose'> & {
  onSubmitFeedbackPress: () => void;
};

export const SubmitFeedbackModal: FC<Props> = ({ onSubmitFeedbackPress, ...props }) => {
  return (
    <ActionModal isCustom {...props}>
      <View style={styles.content}>
        <MessageQuestion color={colors.purpleGradientStart} size={62} variant="Bold" />
        <Typography variant="h3" align="center">
          We value your feedback!
        </Typography>
        <Typography style={styles.text} variant="h6" align="center">
          Please take a moment to share your thoughts, report any bugs, or suggest improvements. Your feedback helps us
          make this app even better for you.
        </Typography>
        <Typography style={styles.text} variant="h6" align="center">
          Thank you for helping us enhance your experience!
        </Typography>
      </View>

      <Button
        text="Submit Feedback or Bug Report"
        color="purpleGradient"
        size="large"
        shape="rectangle"
        fullWidth
        onPress={onSubmitFeedbackPress}
      />
    </ActionModal>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    minHeight: 280,
    marginBottom: 24,
  },
  text: {
    color: colors.grey500,
    maxWidth: 270,
    width: '100%',
  },
});
