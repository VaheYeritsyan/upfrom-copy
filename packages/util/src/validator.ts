import { VisibleError } from '@up-from/util/error';

const phoneRegex = /^\+?(\d{1,3})[\s.(-]{0,2}(\d{2,3})[\s.)-]{0,2}(\d{2,3})[\s.-]?(\d{2,3})[\s.-]?(\d{2,3})$/;
const emailRegex = /^[\w\d.]+@\S+\.\S{2,}$/;

/**
 * Validate phone number and exclude all non-number characters except leading '+' sign
 * e.g.: receives: "+1333-444-5555" or "1 (333) 444-55-55" returns: "+13334445555"
 * @param phone - phone number
 * @returns formatted phone number or throw an error
 */
export function getUnifiedPhoneFormat(phone: string) {
  const validPhone = phone.match(phoneRegex)?.slice(1).join('');
  if (!validPhone) {
    throw new VisibleError('Invalid phone number!', { isExposable: true, extraInput: { phone } });
  }

  const validFormattedPhoneNumber = `+${validPhone}`;
  return validFormattedPhoneNumber;
}

export function isEmailValid(email: string) {
  return emailRegex.test(email);
}

/**
 * Same as isEmailValid() but throws an error
 * @param email - email address
 * @returns email address or throw an error
 */
export function validateEmail(email: string) {
  if (!isEmailValid(email)) {
    throw new VisibleError('Invalid email address!', { isExposable: true, extraInput: { email } });
  }
  return email;
}

export * as Validator from './validator.js';
