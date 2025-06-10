import {
  AdminGenqlSelection,
  EventGenqlSelection,
  UserGenqlSelection,
  EventUserGenqlSelection,
  TeamUserGenqlSelection,
  TeamGenqlSelection,
  EventUserAttendanceGenqlSelection,
  OrganizationGenqlSelection,
} from '@up-from/graphql-ap/genql';

const commonFields = {
  createdAt: true,
  updatedAt: true,
};

const commonFieldsWithId = {
  ...commonFields,
  id: true,
};

export const adminFields: AdminGenqlSelection = {
  ...commonFieldsWithId,
  email: true,
  name: true,
  isDisabled: true,
};

export const userFields: UserGenqlSelection = {
  ...commonFieldsWithId,
  email: true,
  phone: true,
  avatarUrl: true,
  firstName: true,
  lastName: true,
  about: true,
  birthday: true,
  isDisabled: true,
  gender: true,
  isSignupCompleted: true,
  location: {
    locationID: true,
    locationName: true,
    lat: true,
    lng: true,
  },
};

export const teamUserFields: TeamUserGenqlSelection = {
  ...commonFields,
  teamId: true,
  userId: true,
  role: true,
};

export const teamUserFieldsWithRelations: EventUserGenqlSelection = {
  ...teamUserFields,
  user: userFields,
};

export const teamFields: TeamGenqlSelection = {
  ...commonFieldsWithId,
  imageUrl: true,
  name: true,
  isDisabled: true,
  description: true,
};

export const organizationsFields: OrganizationGenqlSelection = {
  ...commonFields,
  id: true,
  name: true,
  details: true,
};

export const teamFieldsWithRelations: TeamGenqlSelection = {
  ...teamFields,
  members: teamUserFields,
  organization: organizationsFields,
};

export const userFieldsWithRelations: UserGenqlSelection = {
  ...userFields,
  teams: teamFields,
};

export const eventUserFields: EventUserGenqlSelection = {
  ...commonFields,
  eventId: true,
  userId: true,
  isAttending: true,
};

export const eventUserFieldsWithRelations: EventUserGenqlSelection = {
  ...commonFields,
  eventId: true,
  userId: true,
  isAttending: true,
  user: userFields,
};

export const eventFields: EventGenqlSelection = {
  ...commonFieldsWithId,
  title: true,
  description: true,
  endsAt: true,
  startsAt: true,
  imageUrl: true,
  address: true,
  isCancelled: true,
  location: {
    locationID: true,
    locationName: true,
    lat: true,
    lng: true,
  },
  isIndividual: true,
  teamId: true,
};

export const eventFieldsWithRelations: EventGenqlSelection = {
  ...eventFields,
  owner: userFields,
  team: teamFields,
  guests: eventUserFieldsWithRelations,
};

export const eventFieldsWithTeamRelations: EventGenqlSelection = {
  ...eventFields,
  owner: userFields,
  team: teamFieldsWithRelations,
  guests: eventUserFieldsWithRelations,
};

export const userAttendanceFields: EventUserAttendanceGenqlSelection = {
  pending: true,
  accepted: true,
  declined: true,
  userId: true,
  total: true,
};

export const userAttendanceFieldsWithRelations: EventUserAttendanceGenqlSelection = {
  ...userAttendanceFields,
  user: userFieldsWithRelations,
};

export const organizationsFieldsWithRelations: OrganizationGenqlSelection = {
  ...organizationsFields,
  teams: teamFields,
};
