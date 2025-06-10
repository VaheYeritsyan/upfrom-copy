import React, { FC, useMemo } from 'react';
import { colors } from '~Theme/Colors';
import { Hexagon, Props as HexagonProps } from '~Components/Hexagon/Hexagon';

type Props = HexagonProps & {
  borderColor?: string;
  borderWidth: number;
};

export const HexagonBordered: FC<Props> = ({
  style,
  size = 20,
  borderWidth = 3,
  borderColor = colors.white,
  color,
  withShadow,
  children,
}) => {
  const sizeWithBorders = useMemo(() => {
    return size + borderWidth * 2;
  }, [size, borderWidth]);

  return (
    <Hexagon style={style} size={sizeWithBorders} color={borderColor} withShadow={withShadow}>
      <Hexagon size={size} color={color}>
        {children}
      </Hexagon>
    </Hexagon>
  );
};
