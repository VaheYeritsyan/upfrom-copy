import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Admin {
  id: string;
  email: string;
  name: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  isDisabled: Generated<boolean>;
}

export interface AuthCode {
  code: string;
  phone: string | null;
  email: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  type: Generated<string>;
}

export interface Event {
  id: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  startsAt: Timestamp;
  endsAt: Timestamp;
  ownerId: string;
  title: string;
  description: string;
  isIndividual: Generated<boolean>;
  imageUrl: string | null;
  teamId: string | null;
  address: string | null;
  isCancelled: Generated<boolean>;
  location: string | null;
}

export interface EventUser {
  eventId: string;
  userId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  isAttending: boolean | null;
}

export interface Organization {
  id: string;
  name: string;
  details: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  imageUrl: string | null;
}

export interface Team {
  id: string;
  createdAt: Generated<Timestamp>;
  name: string;
  updatedAt: Generated<Timestamp>;
  description: string;
  imageUrl: string;
  isDisabled: Generated<boolean>;
  organizationId: string;
}

export interface TeamUser {
  teamId: string;
  userId: string;
  role: Generated<string>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  birthday: Timestamp | null;
  gender: string | null;
  createdAt: Generated<Timestamp>;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  updatedAt: Generated<Timestamp>;
  about: string | null;
  isDisabled: Generated<boolean>;
  isSignupCompleted: Generated<boolean>;
  location: string | null;
}

export interface UserDevice {
  userId: string;
  deviceId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
}

export interface UserNotificationPreferences {
  userId: string;
  pushChatNewMessage: Generated<boolean>;
  pushEventNewInvitation: Generated<boolean>;
  pushEventNewAllTeam: Generated<boolean>;
  pushEventUpdatedDateTime: Generated<boolean>;
  pushEventUpdatedLocation: Generated<boolean>;
  pushEventCancelled: Generated<boolean>;
  pushEventRemovedIndividual: Generated<boolean>;
  pushTeamNewMember: Generated<boolean>;
  emailChatNewMessage: Generated<boolean>;
  emailEventPendingInvitation: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
}

export interface Database {
  admin: Admin;
  auth_code: AuthCode;
  event: Event;
  event_user: EventUser;
  organization: Organization;
  team: Team;
  team_user: TeamUser;
  user: User;
  user_device: UserDevice;
  user_notification_preferences: UserNotificationPreferences;
}
