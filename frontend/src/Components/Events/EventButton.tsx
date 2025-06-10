import React, { FC, useMemo } from 'react';
import { ArrowDown2, TickCircle } from 'iconsax-react-native';
import { ContainedButton } from '~Components/ContainedButton';
import { Button, ButtonProps } from '~Components/Button';
import { colors } from '~Theme/Colors';

type Props = {
  style?: ButtonProps['style'];
  isContained?: boolean;
  isCurrentUserAttending: boolean | null;
  isAttendingLoading: boolean;
  isNotAttendingLoading: boolean;
  isAllTeamsEvent: boolean;
  onAttendingPress: () => void;
  onNotAttendingPress: () => void;
  onJoinAllTeamsPress: () => void;
  onRespondPress: () => void;
};

export const EventButton: FC<Props> = ({
  style,
  isContained,
  isCurrentUserAttending,
  onAttendingPress,
  isAttendingLoading,
  isNotAttendingLoading,
  onRespondPress,
  onJoinAllTeamsPress,
  onNotAttendingPress,
  isAllTeamsEvent,
}) => {
  const props: ButtonProps = useMemo(() => {
    if (isCurrentUserAttending) {
      return {
        startAdornment: (
          <TickCircle
            color={isAllTeamsEvent ? colors.purpleGradientStart : colors.primaryMain}
            size={20}
            variant="Bold"
          />
        ),
        endAdornment: <ArrowDown2 color={colors.grey400} size={18} variant="Bold" />,
        text: 'You are attending',
        activeOpacity: 0.8,
        color: 'white',
        onPress: onAttendingPress,
      };
    } else {
      if (isAllTeamsEvent)
        return {
          text: 'Join Event',
          activeOpacity: 0.8,
          color: 'purpleGradient',
          disabled: isNotAttendingLoading,
          onPress: onJoinAllTeamsPress,
        };

      if (typeof isCurrentUserAttending === 'boolean')
        return {
          endAdornment: <ArrowDown2 color={colors.grey400} size={18} variant="Bold" />,
          text: 'Invitation Declined',
          activeOpacity: 0.8,
          color: 'black',
          disabled: isAttendingLoading,
          onPress: onNotAttendingPress,
        };

      return {
        endAdornment: <ArrowDown2 color={colors.white} size={18} variant="Bold" />,
        text: 'Respond to Invitation',
        activeOpacity: 0.8,
        color: 'blueGradient',
        disabled: isNotAttendingLoading,
        onPress: onRespondPress,
      };
    }
  }, [
    isCurrentUserAttending,
    onAttendingPress,
    isAttendingLoading,
    onRespondPress,
    onJoinAllTeamsPress,
    isAllTeamsEvent,
  ]);

  return isContained ? (
    <ContainedButton {...props} style={style} />
  ) : (
    <Button {...props} style={style} fullWidth size="large" shape="rectangle" />
  );
};
