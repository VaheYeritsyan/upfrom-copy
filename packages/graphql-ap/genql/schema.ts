// @ts-nocheck
export type Scalars = {
    String: string,
    ID: string,
    Boolean: boolean,
    Date: any,
    Int: number,
    Float: number,
    PositiveInt: any,
    Timestamp: any,
}

export interface Admin {
    createdAt: Scalars['Timestamp']
    email: Scalars['String']
    id: Scalars['ID']
    isDisabled: Scalars['Boolean']
    name?: Scalars['String']
    updatedAt: Scalars['Timestamp']
    __typename: 'Admin'
}

export interface Event {
    address?: Scalars['String']
    createdAt: Scalars['Timestamp']
    description: Scalars['String']
    endsAt: Scalars['Timestamp']
    globalId: Scalars['ID']
    guests: EventUser[]
    id: Scalars['ID']
    imageUrl?: Scalars['String']
    isCancelled: Scalars['Boolean']
    isIndividual: Scalars['Boolean']
    location?: LocationType
    owner?: User
    ownerId: Scalars['ID']
    startsAt: Scalars['Timestamp']
    team?: Team
    teamId?: Scalars['ID']
    title: Scalars['String']
    updatedAt: Scalars['Timestamp']
    __typename: 'Event'
}

export interface EventUser {
    createdAt: Scalars['Timestamp']
    eventId: Scalars['ID']
    isAttending?: Scalars['Boolean']
    updatedAt: Scalars['Timestamp']
    user?: User
    userId: Scalars['ID']
    __typename: 'EventUser'
}

export interface EventUserAttendance {
    accepted: Scalars['Int']
    declined: Scalars['Int']
    pending: Scalars['Int']
    total: Scalars['Int']
    user?: User
    userId: Scalars['ID']
    __typename: 'EventUserAttendance'
}

export interface LocationType {
    lat: Scalars['String']
    lng: Scalars['String']
    locationID: Scalars['String']
    locationName: Scalars['String']
    __typename: 'LocationType'
}


/** UpFrom Admin mutations */
export interface Mutation {
    /** Adds a new team member */
    addTeamMember?: Team
    /** Cancel an event */
    cancelEvent: Event
    /** Completes avatar upload process (converts uploaded avatar and moves to public storage) */
    completeAvatarUpload: User
    /** Completes event image upload process (converts uploaded image and moves it to a public storage) */
    completeEventImageUpload: Event
    /** Completes organization image upload process (converts uploaded image and moves it to a public storage) */
    completeOrganizationImageUpload: Organization
    /** Completes team image upload process (converts uploaded image and moves it to a public storage) */
    completeTeamImageUpload: Team
    /** Create new admin account */
    createAdmin: Admin
    /** Create a new event */
    createEvent: Event
    /** Add an event user (guest) to the list of event guests/invitations */
    createEventUser: Event
    /** Create a new organization */
    createOrganization: Organization
    createTeam: Team
    /** Create a new user and add them to a team */
    createTeamUser: User
    /** Create a new user */
    createUser: User
    /** Disable admin account */
    disableAdmin: Admin
    /** Disable a team and its enabled members. Users that were disabled before disabling the team are not included and won't be restored by enabling the team. */
    disableTeam: Team
    /** Disable user account */
    disableUser: User
    /** Enable admin account */
    enableAdmin: Admin
    /** Enable a team and its members that were disabled by team disabling. Members that were disabled before team disabling won't be restored. */
    enableTeam: Team
    /** Enable user account */
    enableUser: User
    /** Generates an avatar upload URL for a user */
    generateAvatarUploadUrl: Scalars['String']
    /** Generates an image upload URL for event */
    generateEventImageUploadUrl: Scalars['String']
    /** Generates an image upload URL for organization */
    generateOrganizationImageUploadUrl: Scalars['String']
    /** Generates an image upload URL for team */
    generateTeamImageUploadUrl: Scalars['String']
    /** Removes avatar for a user */
    removeAvatar: User
    /** Removes event image */
    removeEventImage: Event
    /** Remove an event user (guest) from the list of event guests/invitations */
    removeEventUser: Event
    /** Remove an organization */
    removeOrganization: Organization
    /** Removes organization image */
    removeOrganizationImage: Organization
    /** Removes team image */
    removeTeamImage: Team
    /** Removes a team member */
    removeTeamMember?: Team
    /** Restore a cancelled event */
    restoreEvent: Event
    /** Sends an invitation email with registration instructions */
    sendInvitationEmail: User
    /** Set list of event guests. */
    setEventGuests: Event
    /** Update event info */
    updateEvent: Event
    /** Update Event User entry (Event invitation) */
    updateEventUser: Event
    /** Update an organization */
    updateOrganization: Organization
    /** Update team info */
    updateTeam: Team
    /** Update team member role */
    updateTeamMemberRole?: Team
    /** Update user profile */
    updateUser: User
    __typename: 'Mutation'
}

export type Node = (Event) & { __isUnion?: true }

export type Order = 'asc' | 'desc'

export interface Organization {
    createdAt: Scalars['Timestamp']
    details: Scalars['String']
    id: Scalars['ID']
    imageUrl?: Scalars['String']
    name: Scalars['String']
    teams: Team[]
    updatedAt: Scalars['Timestamp']
    __typename: 'Organization'
}

export interface PageInfo {
    endCursor?: Scalars['ID']
    hasNextPage: Scalars['Boolean']
    hasPreviousPage: Scalars['Boolean']
    startCursor?: Scalars['ID']
    __typename: 'PageInfo'
}


/** UpFrom Admin queries */
export interface Query {
    /** Retrieve all admins */
    allAdmins?: Admin[]
    /** Retrieve all counters */
    allCounters: SummaryCountersType
    /** Retrieve all events */
    allEvents: QueryAllEventsConnection
    /** Retrieve all organization counters */
    allOrganizationCounters: SummaryCountersType
    /** Retrieve all organization events */
    allOrganizationEvents: QueryAllOrganizationEventsConnection
    /** Retrieve all organization teams */
    allOrganizationTeams?: Team[]
    /** Retrieve all organization users */
    allOrganizationUsers?: User[]
    /** Retrieve all organizations */
    allOrganizations?: Organization[]
    /** Retrieve all teams */
    allTeams?: Team[]
    /** Retrieve all users */
    allUsers?: User[]
    event?: Event
    /** Retrieve event attendance for all members of all organization teams */
    getOrganizationAttendance: EventUserAttendance[]
    /** Retrieve event attendance for all team members */
    getTeamAttendance: EventUserAttendance[]
    /** Retrieve event attendance of all users in the app */
    getUserAttendance: EventUserAttendance[]
    node?: Node
    nodes: (Node | undefined)[]
    organization: Organization
    /** Get total amount of organizations */
    organizationTotalAmount: Scalars['Int']
    /** Find organizations by name pattern */
    searchOrganizations: Organization[]
    team?: Team
    user?: User
    __typename: 'Query'
}

export interface QueryAllEventsConnection {
    edges: (QueryAllEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryAllEventsConnection'
}

export interface QueryAllEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryAllEventsConnectionEdge'
}

export interface QueryAllOrganizationEventsConnection {
    edges: (QueryAllOrganizationEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryAllOrganizationEventsConnection'
}

export interface QueryAllOrganizationEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryAllOrganizationEventsConnectionEdge'
}

export interface SummaryCountersType {
    admins: Scalars['Int']
    events: Scalars['Int']
    invitedUsers: Scalars['Int']
    ongoingEvents: Scalars['Int']
    organizations: Scalars['Int']
    pastEvents: Scalars['Int']
    signupCompletedUsers: Scalars['Int']
    teams: Scalars['Int']
    upcomingEvents: Scalars['Int']
    users: Scalars['Int']
    __typename: 'SummaryCountersType'
}

export interface Team {
    createdAt: Scalars['Timestamp']
    description: Scalars['String']
    events: Event[]
    id: Scalars['ID']
    imageUrl?: Scalars['String']
    isDisabled: Scalars['Boolean']
    members: TeamUser[]
    name: Scalars['String']
    organization: Organization
    organizationId: Scalars['ID']
    updatedAt: Scalars['Timestamp']
    __typename: 'Team'
}

export interface TeamUser {
    createdAt: Scalars['Timestamp']
    role: Scalars['String']
    teamId: Scalars['ID']
    updatedAt: Scalars['Timestamp']
    user?: User
    userId: Scalars['ID']
    __typename: 'TeamUser'
}

export type TeamUserRoles = 'member' | 'mentor'

export interface User {
    about?: Scalars['String']
    avatarUrl?: Scalars['String']
    birthday?: Scalars['Date']
    createdAt: Scalars['Timestamp']
    email: Scalars['String']
    events: Event[]
    firstName?: Scalars['String']
    gender?: Scalars['String']
    id: Scalars['ID']
    isDisabled: Scalars['Boolean']
    isSignupCompleted: Scalars['Boolean']
    lastName?: Scalars['String']
    location?: LocationType
    phone?: Scalars['String']
    teams: Team[]
    updatedAt: Scalars['Timestamp']
    __typename: 'User'
}

export interface AdminGenqlSelection{
    createdAt?: boolean | number
    email?: boolean | number
    id?: boolean | number
    isDisabled?: boolean | number
    name?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventGenqlSelection{
    address?: boolean | number
    createdAt?: boolean | number
    description?: boolean | number
    endsAt?: boolean | number
    globalId?: boolean | number
    guests?: EventUserGenqlSelection
    id?: boolean | number
    imageUrl?: boolean | number
    isCancelled?: boolean | number
    isIndividual?: boolean | number
    location?: LocationTypeGenqlSelection
    owner?: UserGenqlSelection
    ownerId?: boolean | number
    startsAt?: boolean | number
    team?: TeamGenqlSelection
    teamId?: boolean | number
    title?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventUserGenqlSelection{
    createdAt?: boolean | number
    eventId?: boolean | number
    isAttending?: boolean | number
    updatedAt?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventUserAttendanceGenqlSelection{
    accepted?: boolean | number
    declined?: boolean | number
    pending?: boolean | number
    total?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface LocationInput {lat: Scalars['String'],lng: Scalars['String'],locationID: Scalars['String'],locationName: Scalars['String']}

export interface LocationTypeGenqlSelection{
    lat?: boolean | number
    lng?: boolean | number
    locationID?: boolean | number
    locationName?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MinMaxInput {max?: (Scalars['Float'] | null),min?: (Scalars['Float'] | null)}


/** UpFrom Admin mutations */
export interface MutationGenqlSelection{
    /** Adds a new team member */
    addTeamMember?: (TeamGenqlSelection & { __args: {role: TeamUserRoles, teamId: Scalars['String'], userId: Scalars['String']} })
    /** Cancel an event */
    cancelEvent?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Completes avatar upload process (converts uploaded avatar and moves to public storage) */
    completeAvatarUpload?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    /** Completes event image upload process (converts uploaded image and moves it to a public storage) */
    completeEventImageUpload?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Completes organization image upload process (converts uploaded image and moves it to a public storage) */
    completeOrganizationImageUpload?: (OrganizationGenqlSelection & { __args: {id: Scalars['String']} })
    /** Completes team image upload process (converts uploaded image and moves it to a public storage) */
    completeTeamImageUpload?: (TeamGenqlSelection & { __args: {id: Scalars['String']} })
    /** Create new admin account */
    createAdmin?: (AdminGenqlSelection & { __args: {email: Scalars['String'], name?: (Scalars['String'] | null)} })
    /** Create a new event */
    createEvent?: (EventGenqlSelection & { __args: {address?: (Scalars['String'] | null), description: Scalars['String'], endsAt: Scalars['Timestamp'], imageUrl?: (Scalars['String'] | null), isIndividual: Scalars['Boolean'], 
    /** Adds owner to invited users and accepts invitation */
    isOwnerAttending?: (Scalars['Boolean'] | null), location?: (LocationInput | null), ownerId: Scalars['String'], startsAt: Scalars['Timestamp'], teamId?: (Scalars['String'] | null), title: Scalars['String']} })
    /** Add an event user (guest) to the list of event guests/invitations */
    createEventUser?: (EventGenqlSelection & { __args: {eventId: Scalars['String'], 
    /** Set "null" to clear status */
    isAttending?: (Scalars['Boolean'] | null), userId: Scalars['String']} })
    /** Create a new organization */
    createOrganization?: (OrganizationGenqlSelection & { __args: {details: Scalars['String'], name: Scalars['String']} })
    createTeam?: (TeamGenqlSelection & { __args: {description: Scalars['String'], imageUrl: Scalars['String'], name: Scalars['String'], organizationId: Scalars['String']} })
    /** Create a new user and add them to a team */
    createTeamUser?: (UserGenqlSelection & { __args: {about?: (Scalars['String'] | null), avatarUrl?: (Scalars['String'] | null), birthday?: (Scalars['Date'] | null), email: Scalars['String'], firstName?: (Scalars['String'] | null), gender?: (Scalars['String'] | null), lastName?: (Scalars['String'] | null), location?: (LocationInput | null), phone?: (Scalars['String'] | null), teamId: Scalars['String']} })
    /** Create a new user */
    createUser?: (UserGenqlSelection & { __args: {about?: (Scalars['String'] | null), avatarUrl?: (Scalars['String'] | null), birthday?: (Scalars['Date'] | null), email: Scalars['String'], firstName?: (Scalars['String'] | null), gender?: (Scalars['String'] | null), isSignupCompleted: Scalars['Boolean'], lastName?: (Scalars['String'] | null), location?: (LocationInput | null), phone?: (Scalars['String'] | null)} })
    /** Disable admin account */
    disableAdmin?: (AdminGenqlSelection & { __args: {id: Scalars['String']} })
    /** Disable a team and its enabled members. Users that were disabled before disabling the team are not included and won't be restored by enabling the team. */
    disableTeam?: (TeamGenqlSelection & { __args: {id: Scalars['String']} })
    /** Disable user account */
    disableUser?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    /** Enable admin account */
    enableAdmin?: (AdminGenqlSelection & { __args: {id: Scalars['String']} })
    /** Enable a team and its members that were disabled by team disabling. Members that were disabled before team disabling won't be restored. */
    enableTeam?: (TeamGenqlSelection & { __args: {id: Scalars['String']} })
    /** Enable user account */
    enableUser?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    /** Generates an avatar upload URL for a user */
    generateAvatarUploadUrl?: { __args: {id: Scalars['String']} }
    /** Generates an image upload URL for event */
    generateEventImageUploadUrl?: { __args: {id: Scalars['String']} }
    /** Generates an image upload URL for organization */
    generateOrganizationImageUploadUrl?: { __args: {id: Scalars['String']} }
    /** Generates an image upload URL for team */
    generateTeamImageUploadUrl?: { __args: {id: Scalars['String']} }
    /** Removes avatar for a user */
    removeAvatar?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    /** Removes event image */
    removeEventImage?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Remove an event user (guest) from the list of event guests/invitations */
    removeEventUser?: (EventGenqlSelection & { __args: {eventId: Scalars['String'], userId: Scalars['String']} })
    /** Remove an organization */
    removeOrganization?: (OrganizationGenqlSelection & { __args: {id: Scalars['String']} })
    /** Removes organization image */
    removeOrganizationImage?: (OrganizationGenqlSelection & { __args: {id: Scalars['String']} })
    /** Removes team image */
    removeTeamImage?: (TeamGenqlSelection & { __args: {id: Scalars['String']} })
    /** Removes a team member */
    removeTeamMember?: (TeamGenqlSelection & { __args: {teamId: Scalars['String'], userId: Scalars['String']} })
    /** Restore a cancelled event */
    restoreEvent?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Sends an invitation email with registration instructions */
    sendInvitationEmail?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    /** Set list of event guests. */
    setEventGuests?: (EventGenqlSelection & { __args: {eventId: Scalars['String'], userIds: Scalars['String'][]} })
    /** Update event info */
    updateEvent?: (EventGenqlSelection & { __args: {address?: (Scalars['String'] | null), description: Scalars['String'], endsAt: Scalars['Timestamp'], id: Scalars['String'], imageUrl?: (Scalars['String'] | null), isCancelled: Scalars['Boolean'], isIndividual: Scalars['Boolean'], location?: (LocationInput | null), ownerId: Scalars['String'], startsAt: Scalars['Timestamp'], teamId?: (Scalars['String'] | null), title: Scalars['String']} })
    /** Update Event User entry (Event invitation) */
    updateEventUser?: (EventGenqlSelection & { __args: {eventId: Scalars['String'], 
    /** Set "null" to clear status */
    isAttending?: (Scalars['Boolean'] | null), userId: Scalars['String']} })
    /** Update an organization */
    updateOrganization?: (OrganizationGenqlSelection & { __args: {details: Scalars['String'], id: Scalars['String'], name: Scalars['String']} })
    /** Update team info */
    updateTeam?: (TeamGenqlSelection & { __args: {description: Scalars['String'], id: Scalars['String'], imageUrl: Scalars['String'], name: Scalars['String'], organizationId: Scalars['String']} })
    /** Update team member role */
    updateTeamMemberRole?: (TeamGenqlSelection & { __args: {role: TeamUserRoles, teamId: Scalars['String'], userId: Scalars['String']} })
    /** Update user profile */
    updateUser?: (UserGenqlSelection & { __args: {about: Scalars['String'], avatarUrl?: (Scalars['String'] | null), birthday: Scalars['Date'], email: Scalars['String'], firstName: Scalars['String'], gender: Scalars['String'], id: Scalars['String'], lastName: Scalars['String'], location: LocationInput, phone: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface NodeGenqlSelection{
    globalId?: boolean | number
    on_Event?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface OrganizationGenqlSelection{
    createdAt?: boolean | number
    details?: boolean | number
    id?: boolean | number
    imageUrl?: boolean | number
    name?: boolean | number
    teams?: TeamGenqlSelection
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PageInfoGenqlSelection{
    endCursor?: boolean | number
    hasNextPage?: boolean | number
    hasPreviousPage?: boolean | number
    startCursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** UpFrom Admin queries */
export interface QueryGenqlSelection{
    /** Retrieve all admins */
    allAdmins?: AdminGenqlSelection
    /** Retrieve all counters */
    allCounters?: SummaryCountersTypeGenqlSelection
    /** Retrieve all events */
    allEvents?: (QueryAllEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, to?: (Scalars['Timestamp'] | null)} })
    /** Retrieve all organization counters */
    allOrganizationCounters?: (SummaryCountersTypeGenqlSelection & { __args: {organizationId: Scalars['String']} })
    /** Retrieve all organization events */
    allOrganizationEvents?: (QueryAllOrganizationEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, organizationId: Scalars['String'], to?: (Scalars['Timestamp'] | null)} })
    /** Retrieve all organization teams */
    allOrganizationTeams?: (TeamGenqlSelection & { __args: {organizationId: Scalars['String']} })
    /** Retrieve all organization users */
    allOrganizationUsers?: (UserGenqlSelection & { __args: {organizationId: Scalars['String']} })
    /** Retrieve all organizations */
    allOrganizations?: OrganizationGenqlSelection
    /** Retrieve all teams */
    allTeams?: TeamGenqlSelection
    /** Retrieve all users */
    allUsers?: UserGenqlSelection
    event?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Retrieve event attendance for all members of all organization teams */
    getOrganizationAttendance?: (EventUserAttendanceGenqlSelection & { __args: {from?: (Scalars['Timestamp'] | null), organizationId: Scalars['String'], to?: (Scalars['Timestamp'] | null)} })
    /** Retrieve event attendance for all team members */
    getTeamAttendance?: (EventUserAttendanceGenqlSelection & { __args: {from?: (Scalars['Timestamp'] | null), teamId: Scalars['String'], to?: (Scalars['Timestamp'] | null)} })
    /** Retrieve event attendance of all users in the app */
    getUserAttendance?: (EventUserAttendanceGenqlSelection & { __args?: {from?: (Scalars['Timestamp'] | null), teamId?: (Scalars['String'] | null), to?: (Scalars['Timestamp'] | null)} })
    node?: (NodeGenqlSelection & { __args: {id: Scalars['ID']} })
    nodes?: (NodeGenqlSelection & { __args: {ids: Scalars['ID'][]} })
    organization?: (OrganizationGenqlSelection & { __args: {id: Scalars['String']} })
    /** Get total amount of organizations */
    organizationTotalAmount?: boolean | number
    /** Find organizations by name pattern */
    searchOrganizations?: (OrganizationGenqlSelection & { __args: {namePattern?: (Scalars['String'] | null), 
    /** Sort order of organizations. Could be "asc" or "desc" */
    order: Order} })
    team?: (TeamGenqlSelection & { __args: {id: Scalars['String']} })
    user?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryAllEventsConnectionGenqlSelection{
    edges?: QueryAllEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryAllEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryAllOrganizationEventsConnectionGenqlSelection{
    edges?: QueryAllOrganizationEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryAllOrganizationEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface StateInput {abbreviation: Scalars['String'],name?: (Scalars['String'] | null)}

export interface SummaryCountersTypeGenqlSelection{
    admins?: boolean | number
    events?: boolean | number
    invitedUsers?: boolean | number
    ongoingEvents?: boolean | number
    organizations?: boolean | number
    pastEvents?: boolean | number
    signupCompletedUsers?: boolean | number
    teams?: boolean | number
    upcomingEvents?: boolean | number
    users?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TeamGenqlSelection{
    createdAt?: boolean | number
    description?: boolean | number
    events?: EventGenqlSelection
    id?: boolean | number
    imageUrl?: boolean | number
    isDisabled?: boolean | number
    members?: TeamUserGenqlSelection
    name?: boolean | number
    organization?: OrganizationGenqlSelection
    organizationId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TeamUserGenqlSelection{
    createdAt?: boolean | number
    role?: boolean | number
    teamId?: boolean | number
    updatedAt?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    about?: boolean | number
    avatarUrl?: boolean | number
    birthday?: boolean | number
    createdAt?: boolean | number
    email?: boolean | number
    events?: EventGenqlSelection
    firstName?: boolean | number
    gender?: boolean | number
    id?: boolean | number
    isDisabled?: boolean | number
    isSignupCompleted?: boolean | number
    lastName?: boolean | number
    location?: LocationTypeGenqlSelection
    phone?: boolean | number
    teams?: TeamGenqlSelection
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Admin_possibleTypes: string[] = ['Admin']
    export const isAdmin = (obj?: { __typename?: any } | null): obj is Admin => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAdmin"')
      return Admin_possibleTypes.includes(obj.__typename)
    }
    


    const Event_possibleTypes: string[] = ['Event']
    export const isEvent = (obj?: { __typename?: any } | null): obj is Event => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEvent"')
      return Event_possibleTypes.includes(obj.__typename)
    }
    


    const EventUser_possibleTypes: string[] = ['EventUser']
    export const isEventUser = (obj?: { __typename?: any } | null): obj is EventUser => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventUser"')
      return EventUser_possibleTypes.includes(obj.__typename)
    }
    


    const EventUserAttendance_possibleTypes: string[] = ['EventUserAttendance']
    export const isEventUserAttendance = (obj?: { __typename?: any } | null): obj is EventUserAttendance => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isEventUserAttendance"')
      return EventUserAttendance_possibleTypes.includes(obj.__typename)
    }
    


    const LocationType_possibleTypes: string[] = ['LocationType']
    export const isLocationType = (obj?: { __typename?: any } | null): obj is LocationType => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLocationType"')
      return LocationType_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const Node_possibleTypes: string[] = ['Event']
    export const isNode = (obj?: { __typename?: any } | null): obj is Node => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNode"')
      return Node_possibleTypes.includes(obj.__typename)
    }
    


    const Organization_possibleTypes: string[] = ['Organization']
    export const isOrganization = (obj?: { __typename?: any } | null): obj is Organization => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOrganization"')
      return Organization_possibleTypes.includes(obj.__typename)
    }
    


    const PageInfo_possibleTypes: string[] = ['PageInfo']
    export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
      return PageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const QueryAllEventsConnection_possibleTypes: string[] = ['QueryAllEventsConnection']
    export const isQueryAllEventsConnection = (obj?: { __typename?: any } | null): obj is QueryAllEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryAllEventsConnection"')
      return QueryAllEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryAllEventsConnectionEdge_possibleTypes: string[] = ['QueryAllEventsConnectionEdge']
    export const isQueryAllEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryAllEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryAllEventsConnectionEdge"')
      return QueryAllEventsConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const QueryAllOrganizationEventsConnection_possibleTypes: string[] = ['QueryAllOrganizationEventsConnection']
    export const isQueryAllOrganizationEventsConnection = (obj?: { __typename?: any } | null): obj is QueryAllOrganizationEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryAllOrganizationEventsConnection"')
      return QueryAllOrganizationEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryAllOrganizationEventsConnectionEdge_possibleTypes: string[] = ['QueryAllOrganizationEventsConnectionEdge']
    export const isQueryAllOrganizationEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryAllOrganizationEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryAllOrganizationEventsConnectionEdge"')
      return QueryAllOrganizationEventsConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const SummaryCountersType_possibleTypes: string[] = ['SummaryCountersType']
    export const isSummaryCountersType = (obj?: { __typename?: any } | null): obj is SummaryCountersType => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSummaryCountersType"')
      return SummaryCountersType_possibleTypes.includes(obj.__typename)
    }
    


    const Team_possibleTypes: string[] = ['Team']
    export const isTeam = (obj?: { __typename?: any } | null): obj is Team => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTeam"')
      return Team_possibleTypes.includes(obj.__typename)
    }
    


    const TeamUser_possibleTypes: string[] = ['TeamUser']
    export const isTeamUser = (obj?: { __typename?: any } | null): obj is TeamUser => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTeamUser"')
      return TeamUser_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    

export const enumOrder = {
   asc: 'asc' as const,
   desc: 'desc' as const
}

export const enumTeamUserRoles = {
   member: 'member' as const,
   mentor: 'mentor' as const
}
