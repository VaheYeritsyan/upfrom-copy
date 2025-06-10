import { Linking } from 'react-native';
import { Platform } from 'react-native';

const webSiteUrl = '';
const termsAndConsUrl = `${webSiteUrl}/terms-and-conditions`;
const privacyPolicyUrl = `${webSiteUrl}/privacy-policy`;
const feedbackUrl = `${webSiteUrl}/contact-us`;
const infoEmail = '';
const appstoreLink = 'https://apps.apple.com/us/app/upfrom-mentoring/id6476616880';
const googlePlayLink = 'https://play.google.com/store/apps/details?id=com.upfrom.upfromapp';

export const openInWeb = async (url: string) => {
  try {
    await Linking.canOpenURL(url);
    await Linking.openURL(url);
  } catch (err) {
    console.log('error opening link in web: ', err);
  }
};

export const openTermsAndConditionsInWeb = async () => {
  await openInWeb(termsAndConsUrl);
};

export const openPrivacyPolicyInWeb = async () => {
  await openInWeb(privacyPolicyUrl);
};

export const openSiteInWeb = async () => {
  await openInWeb(webSiteUrl);
};

export const openFeedbackInWeb = async () => {
  await openInWeb(feedbackUrl);
};

export const openEmailInMail = async (email: string) => {
  await Linking.openURL(`mailto:${email}`);
};

export const openInfoEmailInMail = async () => {
  await openEmailInMail(infoEmail);
};

export const openStorePage = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL(appstoreLink);
  } else {
    await Linking.openURL(googlePlayLink);
  }
};

export const handleDirectionsPress = async (lat: string, lng: string) => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('maps://app?daddr=' + lat + '+' + lng);
  } else {
    await Linking.openURL('google.navigation:q=' + lat + '+' + lng);
  }
};
