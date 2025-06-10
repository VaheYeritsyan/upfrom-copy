import React, { FC, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Appearance, View, TouchableOpacity, ViewStyle, StyleProp, InteractionManager } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AddCircle, ArrowRight2, CloseCircle, Clock } from 'iconsax-react-native';
import { getFullTextDate, getIsDateToday } from '~utils/dateFormat';
import { Button } from '~Components/Button';
import { Typography } from '~Components/Typography';
import { colors } from '~Theme/Colors';
import { effects } from '~Theme/Effects';
import { Variant } from '~Theme/Typography';

type Props = {
  style?: StyleProp<ViewStyle>;
  maximumDate?: Date;
  minimumDate?: Date;
  isDisabled?: boolean;
  onChange?: (start: number, end: number) => void;
  start?: number;
  end?: number;
  withoutOpenButton?: boolean;
  size?: 'small' | 'medium';
  label?: string;
  onClearPress?: () => void;
};

const isDarkMode = Appearance.getColorScheme() === 'dark';

const typographyVariants: { [K in Required<Props>['size']]: Variant } = {
  small: 'body3Medium',
  medium: 'body1SemiBold',
};

const IosHeaderStartDate = () => (
  <Typography style={[styles.iosHeaderText, isDarkMode && styles.iosHeaderDarkMode]} variant="h5">
    Start Date
  </Typography>
);

const IosHeaderEndDate = () => (
  <Typography style={[styles.iosHeaderText, isDarkMode && styles.iosHeaderDarkMode]} variant="h5">
    End Date
  </Typography>
);

export const DateRangePicker: FC<Props> = ({
  style,
  isDisabled,
  withoutOpenButton,
  start,
  end,
  maximumDate,
  minimumDate,
  label = 'Timeline',
  onChange,
  size = 'small',
  onClearPress,
}) => {
  const [isStartVisible, setIsStartVisible] = useState(!!withoutOpenButton);
  const [isEndVisible, setIsEndVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const sDate = start ? new Date(start) : null;
    const eDate = end ? new Date(end) : null;
    if (sDate === startDate && eDate === endDate) return;

    setStartDate(sDate);
    setEndDate(eDate);
  }, [start, end]);

  useEffect(() => {
    if (!startDate || !endDate || !onChange) return;

    onChange?.(startDate.getTime(), endDate.getTime());
  }, [onChange, startDate, endDate]);

  const startDateText = useMemo(() => (startDate ? getFullTextDate(startDate, ', ') : null), [startDate]);
  const endDateText = useMemo(() => (endDate ? getFullTextDate(endDate, ', ') : null), [endDate]);
  const endDateMaxDate = useMemo(() => {
    return maximumDate ? new Date(new Date(maximumDate).setHours(23, 59, 59, 999)) : undefined;
  }, [maximumDate]);

  const isSelected = !!startDate && !!endDate;

  const handleSelectDateRangePress = () => {
    setIsStartVisible(true);
  };

  const handleStartDateConfirmPress = (date: Date) => {
    const isCurrentDate = getIsDateToday(date);
    setStartDate(isCurrentDate ? new Date() : new Date(date.setHours(0, 0, 0, 0)));
    setIsStartVisible(false);

    InteractionManager.runAfterInteractions(() => {
      setIsEndVisible(true);
    });
  };

  const handleEndDateConfirmPress = (date: Date) => {
    // when pressing on date which is minimumDate (come from props) the picker
    // triggers a handler with the past data instead of the date we pressed on.
    const validEndDate = startDate ? new Date(date.getTime() < startDate.getTime() ? startDate : date) : date;

    setEndDate(new Date(validEndDate.setHours(23, 59, 59, 999)));
    setIsEndVisible(false);
  };

  const handleClearPress = () => {
    setStartDate(null);
    setEndDate(null);

    if (onClearPress) {
      onClearPress();
    } else {
      onChange?.(0, 0);
    }
  };

  const handleCancelPress = () => {
    setIsStartVisible(false);
    setIsEndVisible(false);

    if (!endDate) handleClearPress();
  };

  const typographyVariant = typographyVariants[size];
  return (
    <>
      <View style={[styles.container, style, isSelected && styles.containerWithValue]}>
        <TouchableOpacity
          style={[styles.timeline, styles[`${size}Timeline`], styles.button]}
          disabled={withoutOpenButton ? isDisabled : !isSelected || isDisabled}
          activeOpacity={1}
          onPress={handleSelectDateRangePress}>
          {isSelected ? (
            <>
              <Typography style={styles.timelineText} variant={typographyVariant}>
                {startDateText}
              </Typography>
              <ArrowRight2 size={12} color={colors.white} opacity={0.6} variant="Bold" />
              <Typography style={styles.timelineText} variant={typographyVariant}>
                {endDateText}
              </Typography>
            </>
          ) : (
            <>
              <Clock size={16} color={colors.white} variant="Bold" />
              <Typography style={styles.timelineText} variant={typographyVariant}>
                {label}
              </Typography>
            </>
          )}
        </TouchableOpacity>

        {withoutOpenButton ? (
          <Button
            style={styles.button}
            text="Clear"
            size={size}
            shape="pill"
            color="grey"
            disabled={isDisabled}
            startAdornment={<CloseCircle size={16} variant="Bold" color={colors.grey600} />}
            onPress={handleClearPress}
          />
        ) : (
          <>
            {isSelected ? (
              <Button
                style={styles.button}
                text="Clear"
                size={size}
                shape="pill"
                color="grey"
                disabled={isDisabled}
                startAdornment={<CloseCircle size={16} variant="Bold" color={colors.grey600} />}
                onPress={handleClearPress}
              />
            ) : (
              <Button
                style={styles.button}
                text="Select Date Range"
                size={size}
                shape="pill"
                color="white"
                disabled={isDisabled}
                startAdornment={<AddCircle size={16} variant="Bold" color={colors.primaryMain} />}
                onPress={handleSelectDateRangePress}
              />
            )}
          </>
        )}
      </View>

      <DateTimePickerModal
        isVisible={isStartVisible}
        mode="date"
        customHeaderIOS={IosHeaderStartDate}
        maximumDate={endDate ? new Date(endDate) : maximumDate}
        minimumDate={minimumDate}
        date={startDate || undefined}
        display="inline"
        locale="en-us"
        is24Hour={false}
        onConfirm={handleStartDateConfirmPress}
        onCancel={handleCancelPress}
      />

      <DateTimePickerModal
        isVisible={isEndVisible}
        mode="date"
        customHeaderIOS={IosHeaderEndDate}
        maximumDate={endDateMaxDate}
        minimumDate={startDate ? new Date(startDate) : minimumDate}
        date={endDate || undefined}
        display="inline"
        locale="en-us"
        is24Hour={false}
        onConfirm={handleEndDateConfirmPress}
        onCancel={handleCancelPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  containerWithValue: {
    justifyContent: 'space-between',
  },

  button: {
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iosHeaderText: { paddingLeft: 20, paddingTop: 24 },
  iosHeaderDarkMode: { color: colors.white },

  timeline: {
    ...effects.shadow1,
    backgroundColor: colors.primaryMain,
  },
  smallTimeline: {
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mediumTimeline: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  timelineText: {
    color: colors.white,
  },
});
