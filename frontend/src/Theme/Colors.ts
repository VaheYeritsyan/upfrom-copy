// TODO: make color a utility prop. should be unnested?

export const colors = {
  primaryMain: 'hsla(209, 100%, 56%, 1)',
  primaryMainGradientStart: 'hsla(209, 100%, 56%, 1)',
  primaryMainGradientEnd: 'hsla(209, 86%, 68%, 1)',
  primaryLight: 'hsla(209, 87%, 68%, 1)',
  primaryLightOpacity: 'hsla(208, 100.0%, 56.3%, 0.2)',
  grey800: 'hsla(228, 6%, 15%, 1)',
  grey700: 'hsla(224, 11%, 20%, 1)',
  grey600: 'hsla(224, 7%, 32%, 1)',
  grey500: 'hsla(215, 8%, 56%, 1)',
  grey400: 'hsla(220, 10%, 70%, 1)',
  grey300: 'hsla(224, 15%, 85%, 1)',
  grey200: 'hsla(228, 10%, 90%, 1)',
  grey100: 'hsla(206, 20%, 95%, 1)',
  success: 'hsla(83, 91%, 38%, 1)',
  danger: 'hsla(10, 100%, 56%, 1)',
  yellow: 'hsla(43, 100%, 49%, 1)',
  orange: 'hsla(19, 100%, 59%, 1)',
  black: 'hsla(200, 6%, 9%, 1)',
  blackTransparent20: 'hsla(200, 6%, 9%, 0.2)',
  dangerMain: 'hsla(0, 100%, 56%, 1)',
  dangerLight: 'hsla(10, 100%, 68%, 1)',
  purpleGradientStart: 'hsla(251, 89%, 62%, 1)',
  purpleGradientEnd: 'hsla(270, 82%, 70%, 1)',
  alertIconBackground: 'hsla(0, 0%, 100%, 0.1)',
  white: 'hsla(0, 0%, 100%, 1)',
} as const;

export type Color = keyof typeof colors;
