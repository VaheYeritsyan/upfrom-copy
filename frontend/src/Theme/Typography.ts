import { StyleSheet } from 'react-native';

const body1Shared = { fontSize: 14, lineHeight: 16 };
const body2Shared = { fontSize: 13, lineHeight: 16, letterSpacing: -0.2 };
const body3Shared = { fontSize: 12, lineHeight: 14, letterSpacing: -0.2 };

const label1Shared = { fontSize: 10, lineHeight: 12 };
const label2Shared = { fontSize: 9, lineHeight: 10 };

export type Variant = keyof typeof typography;

export const typography = StyleSheet.create({
  h1: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    lineHeight: 52,
    letterSpacing: -4,
  },
  h2: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    lineHeight: 32,
    letterSpacing: -1.6,
  },
  h3: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    lineHeight: 28,
    letterSpacing: -1.2,
  },
  h4: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  h5: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 18,
    letterSpacing: -0.4,
  },
  h6: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 18,
    letterSpacing: -0.4,
  },
  paragraph1: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  paragraph2: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  paragraph3: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  body1Medium: {
    ...body1Shared,
    fontFamily: 'Inter-Medium',
    letterSpacing: -0.2,
  },
  body1SemiBold: {
    ...body1Shared,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.4,
  },
  body1Bold: {
    ...body1Shared,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.4,
  },
  body2Medium: {
    ...body2Shared,
    fontFamily: 'Inter-Medium',
  },
  body2SemiBold: {
    ...body2Shared,
    fontFamily: 'Inter-SemiBold',
  },
  body2Bold: {
    ...body2Shared,
    fontFamily: 'Inter-Bold',
  },
  body3Medium: {
    ...body3Shared,
    fontFamily: 'Inter-Medium',
  },
  body3SemiBold: {
    ...body3Shared,
    fontFamily: 'Inter-SemiBold',
  },
  body3Bold: {
    ...body3Shared,
    fontFamily: 'Inter-Bold',
  },
  label1Medium: {
    ...label1Shared,
    fontFamily: 'Inter-Medium',
  },
  label1SemiBold: {
    ...label1Shared,
    fontFamily: 'Inter-SemiBold',
  },
  label1Bold: {
    ...label1Shared,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.4,
  },
  label2Medium: {
    ...label2Shared,
    fontFamily: 'Inter-Medium',
  },
  label2SemiBold: {
    ...label2Shared,
    fontFamily: 'Inter-SemiBold',
  },
  label2Bold: {
    ...label2Shared,
    fontFamily: 'Inter-Bold',
  },
});
