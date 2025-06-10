import { User, EventUser, EventUserAttendance } from '@up-from/graphql-ap/genql';

export type UserWithAttending = User & Partial<Pick<EventUser, 'isAttending'>>;
export type UserWithAttendance = UserWithAttending &
  Partial<Pick<EventUserAttendance, 'total' | 'pending' | 'accepted' | 'declined'>>;
