import { User, Event, Team, Organization } from '@up-from/graphql-ap/genql';
import { UseControllerProps } from 'react-hook-form';
import { isDayMonthAndYearEqual } from '~/util/date';

export type OrganizationFormValues = Pick<Organization, 'name' | 'details'>;
type OrganizationValuesRules = {
  [K in keyof OrganizationFormValues]?: UseControllerProps<OrganizationFormValues, K>['rules'];
};

export type TeamFormValues = Pick<Team, 'name' | 'description'> & {
  startsAt: Date | null;
  endsAt: Date | null;
};
type TeamValuesRules = { [K in keyof TeamFormValues]?: UseControllerProps<TeamFormValues, K>['rules'] };

export type EventFormValues = Pick<Event, 'title' | 'description' | 'location' | 'address'> & {
  startsAt: Date | null;
  endsAt: Date | null;
};
type EventValuesRules = { [K in keyof EventFormValues]?: UseControllerProps<EventFormValues, K>['rules'] };

export type UserFormValues = Pick<User, 'firstName' | 'lastName' | 'about' | 'location' | 'email' | 'phone'> & {
  gender: { label: string; value: string } | null;
  role: { label: string; value: string } | null;
  birthday: Date | null;
};
type UserValuesRules = { [K in keyof UserFormValues]?: UseControllerProps<UserFormValues, K>['rules'] };

export const emailRegExp = new RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/);

export const MIN_EVENT_DURATION = 900000; // 15min

export const organizationValuesRules: OrganizationValuesRules = {
  name: { required: 'Required', maxLength: { value: 200, message: 'Max length exceeded' } },
  details: { required: 'Required', maxLength: { value: 5000, message: 'Max length exceeded' } },
};

export const teamValuesRules: TeamValuesRules = {
  name: { required: 'Required', maxLength: { value: 200, message: 'Max length exceeded' } },
  description: { required: 'Required', maxLength: { value: 5000, message: 'Max length exceeded' } },
};

export const eventValuesRules: EventValuesRules = {
  title: { required: 'Required', maxLength: { value: 200, message: 'Max length exceeded' } },
  description: { required: 'Required', maxLength: { value: 5000, message: 'Max length exceeded' } },
  startsAt: {
    validate: (date, formValues) => {
      if (!date) return 'Required';
      const dateTime = date.getTime();

      if (dateTime < Date.now()) return 'Date is incorrect';
      if (!formValues.endsAt) return undefined;

      if (dateTime + MIN_EVENT_DURATION > formValues.endsAt.getTime()) return 'Min duration is 15 min';
      if (!isDayMonthAndYearEqual(date, formValues.endsAt)) return 'Max event duration exceeded';

      return undefined;
    },
  },
  endsAt: {
    validate: (date, formValues) => {
      if (!date) return 'Required';
      const dateTime = date.getTime();

      if (dateTime < Date.now()) return 'Date is incorrect';
      if (!formValues.startsAt) return undefined;

      if (dateTime - MIN_EVENT_DURATION < formValues.startsAt.getTime()) return 'Min duration is 15 min';
      if (!isDayMonthAndYearEqual(date, formValues.startsAt)) return 'Max event duration exceeded';

      return undefined;
    },
  },
  location: { required: 'Required', maxLength: { value: 3000, message: 'Max length exceeded' } },
  address: { required: 'Required', maxLength: { value: 1000, message: 'Max length exceeded' } },
};

export const editEventValuesRules: EventValuesRules = {
  ...eventValuesRules,
  startsAt: {
    validate: (date, formValues) => {
      if (!date) return 'Required';
      const dateTime = date.getTime();
      if (!formValues.endsAt) return undefined;

      if (dateTime + MIN_EVENT_DURATION > formValues.endsAt.getTime()) return 'Min duration is 15 min';
      if (!isDayMonthAndYearEqual(date, formValues.endsAt)) return 'Max event duration exceeded';

      return undefined;
    },
  },
  endsAt: {
    validate: (date, formValues) => {
      if (!date) return 'Required';
      const dateTime = date.getTime();
      if (!formValues.startsAt) return undefined;

      if (dateTime - MIN_EVENT_DURATION < formValues.startsAt.getTime()) return 'Min duration is 15 min';
      if (!isDayMonthAndYearEqual(date, formValues.startsAt)) return 'Max event duration exceeded';

      return undefined;
    },
  },
};

export const userValuesRules: UserValuesRules = {
  firstName: { maxLength: { value: 50, message: 'Max length exceeded' } },
  lastName: { maxLength: { value: 50, message: 'Max length exceeded' } },
  about: { maxLength: { value: 5000, message: 'Max length exceeded' } },
  phone: { required: 'Required' },
  role: { required: 'Required' },
  birthday: {
    validate: value => {
      if (!value) return undefined;
      const date = value instanceof Date ? value : new Date(value);

      return date.getTime() >= new Date().setHours(0, 0, 0, 0) ? 'Date is incorrect' : undefined;
    },
  },
  email: {
    validate: value => {
      if (!value) return undefined;
      if (value.length > 200) return 'Max length exceeded';
      if (!emailRegExp.test(value)) return 'Invalid email';

      return undefined;
    },
  },
};

export const editUserValuesRules: UserValuesRules = {
  ...userValuesRules,
  firstName: { required: 'Required', maxLength: { value: 50, message: 'Max length exceeded' } },
  lastName: { required: 'Required', maxLength: { value: 50, message: 'Max length exceeded' } },
  about: { required: 'Required', maxLength: { value: 5000, message: 'Max length exceeded' } },
  gender: { required: 'Required' },
  birthday: {
    validate: value => {
      if (!value) return 'Required';
      const date = value instanceof Date ? value : new Date(value);

      return date.getTime() >= new Date().setHours(0, 0, 0, 0) ? 'Date is incorrect' : undefined;
    },
  },
  email: {
    validate: value => {
      if (!value) return 'Required';
      if (value.length > 200) return 'Max length exceeded';
      if (!emailRegExp.test(value)) return 'Invalid email';

      return undefined;
    },
  },
};
