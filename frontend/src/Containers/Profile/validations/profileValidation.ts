import { User, UserProfile } from '@up-from/graphql/genql';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';

import { GQLLocationType } from '~types/location';

export type ProfileFormValues = Pick<User, 'firstName' | 'lastName' | 'about'> &
  Pick<UserProfile, 'birthday' | 'gender' | 'email' | 'phone'> & { location?: GQLLocationType };

export type ProfileValidationSchema = {
  [K in keyof ProfileFormValues]: UseControllerProps<ProfileFormValues>['rules'];
};

export const profileFormSchema: ProfileValidationSchema = {
  firstName: { required: 'Required', maxLength: { value: 50, message: 'Max length exceeded' } },
  lastName: { required: 'Required', maxLength: { value: 50, message: 'Max length exceeded' } },
  birthday: {
    validate: value => {
      if (!value) return 'Required';
      const date = value instanceof Date ? value : new Date(value);

      return date.getTime() >= new Date().setHours(0, 0, 0, 0) ? 'Date is incorrect' : undefined;
    },
  },
  gender: { required: 'Required' },
  about: { required: 'Required', maxLength: { value: 5000, message: 'Max length exceeded' } },
  email: { required: 'Required', maxLength: { value: 200, message: 'Max length exceeded' } },
  phone: { required: 'Required' },
  location: { required: 'Required', maxLength: { value: 3000, message: 'Max length exceeded' } },
};
