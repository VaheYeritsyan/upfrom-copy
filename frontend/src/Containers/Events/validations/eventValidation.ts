import { Event } from '@up-from/graphql/genql';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { GQLLocationType } from '~types/location';
import { getIsDateToday } from '~utils/dateFormat';

export type EventFormValues = Pick<Event, 'title' | 'description' | 'address'> & {
  date: Date;
  startsAt: Date;
  endsAt: Date;
  'location.locationName'?: GQLLocationType['locationName'];
  'location.locationID'?: GQLLocationType['locationID'];
  'location.lat'?: GQLLocationType['lat'];
  'location.lng'?: GQLLocationType['lng'];
};

type EventValidationSchema = {
  [K in keyof EventFormValues]: UseControllerProps<EventFormValues>['rules'];
};

const MIN_EVENT_DURATION = 900000; // 15min;

export const eventFormSchema: EventValidationSchema = {
  title: { required: 'Required', maxLength: { value: 200, message: 'Max length exceeded' } },
  description: { required: 'Required', maxLength: { value: 5000, message: 'Max length exceeded' } },
  date: {
    validate: value => {
      if (!value) return 'Required';
      const date = value instanceof Date ? value : new Date(value);

      return date.getTime() < new Date().setHours(0, 0, 0, 0) ? 'Date is incorrect' : undefined;
    },
  },
  startsAt: {
    validate: (value, formValues) => {
      if (!value) return 'Required';
      const date = value instanceof Date ? value : new Date(value);

      if (formValues.date && getIsDateToday(formValues.date) && date.getTime() < Date.now()) return 'Time is incorrect';
      if (!formValues.endsAt) return undefined;

      if (date.getTime() > formValues.endsAt.getTime()) return 'Time is incorrect';
      if (date.getTime() + MIN_EVENT_DURATION > formValues.endsAt.getTime()) return 'Min duration is 15 min';

      return undefined;
    },
  },
  endsAt: {
    validate: (value, formValues) => {
      if (!value) return 'Required';
      const date = value instanceof Date ? value : new Date(value);

      if (formValues.date && getIsDateToday(formValues.date) && date.getTime() < Date.now()) return 'Time is incorrect';
      if (!formValues.startsAt) return undefined;

      if (date.getTime() < formValues.startsAt.getTime()) return 'Time is incorrect';
      if (date.getTime() - MIN_EVENT_DURATION < formValues.startsAt.getTime()) return 'Min duration is 15 min';

      return undefined;
    },
  },
  'location.locationName': { required: 'Required' },
  address: { required: 'Required', maxLength: { value: 1000, message: 'Max length exceeded' } },
};
