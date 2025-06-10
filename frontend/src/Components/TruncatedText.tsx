import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, ViewProps, View, NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { Variant } from '~Theme/Typography';
import { Typography } from '~Components/Typography';
import { Button } from '~Components/Button';
import { colors } from '~Theme/Colors';

type Props = ViewProps & {
  variant: Variant;
  text: string;
};

const MIN_NUMBER_OF_LINES = 3;

export const TruncatedText: FC<Props> = ({ style, text, variant, ...props }) => {
  const [maxNumberOfLines, setMaxNumberOfLines] = useState(0);
  const [isOpen, setIsOpen] = useState<boolean>();

  const numberOfLines = useMemo(() => {
    if (!maxNumberOfLines) return 0;

    return isOpen ? maxNumberOfLines : MIN_NUMBER_OF_LINES;
  }, [isOpen, maxNumberOfLines]);

  const handleTextLayout = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (maxNumberOfLines) return;

      setMaxNumberOfLines(nativeEvent.lines.length);
    },
    [maxNumberOfLines],
  );

  useEffect(() => {
    setMaxNumberOfLines(0);
  }, [text.length]);

  const handleBtnPress = useCallback(() => {
    setIsOpen(prevState => !prevState);
  }, []);

  return (
    <View {...props} style={[styles.container, style]} key={text.length}>
      <Typography style={styles.text} variant={variant} numberOfLines={numberOfLines} onTextLayout={handleTextLayout}>
        {text}
      </Typography>

      {maxNumberOfLines > MIN_NUMBER_OF_LINES ? (
        <Button
          text={`See ${isOpen ? 'less' : 'more'}`}
          shape="rectangle"
          size="large"
          color="white"
          fullWidth
          activeOpacity={0.6}
          onPress={handleBtnPress}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  text: {
    color: colors.grey600,
    flex: 1,
  },
});
