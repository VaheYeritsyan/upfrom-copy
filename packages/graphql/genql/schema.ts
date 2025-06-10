// @ts-nocheck
export type Scalars = {
    ID: string,
    String: string,
    Date: any,
    Boolean: boolean,
    PositiveInt: any,
    Int: number,
    Timestamp: any,
}

export interface ChatUserData {
    id: Scalars['ID']
    image?: Scalars['String']
    name: Scalars['String']
    __typename: 'ChatUserData'
}

export interface Event {
    address?: Scalars['String']
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
    __typename: 'Event'
}

export interface EventUser {
    eventId: Scalars['ID']
    isAttending?: Scalars['Boolean']
    user?: User
    userId: Scalars['ID']
    __typename: 'EventUser'
}

export interface LocationType {
    lat: Scalars['String']
    lng: Scalars['String']
    locationID: Scalars['String']
    locationName: Scalars['String']
    __typename: 'LocationType'
}


/** UpFrom app mutations */
export interface Mutation {
    /** Add a device ID to receive push notifications */
    addDeviceId: UserDevice
    /** Cancel an event */
    cancelEvent?: Event
    /** Completes avatar upload process (converts uploaded avatar and moves to public storage) */
    completeAvatarUpload: User
    /** Completes event image upload process (converts uploaded image and moves it to a public storage) */
    completeEventImageUpload: Event
    /** Complete sign up by providing additional profile info */
    completeSignUp: User
    /** Create a new event. */
    createEvent: Event
    /** Generates an avatar upload URL for current user */
    generateAvatarUploadUrl: Scalars['String']
    /** Generates an image upload URL for event */
    generateEventImageUploadUrl: Scalars['String']
    /** Join a public event. */
    joinAllTeamsEvent: Event
    /** Leave a public event. */
    leaveAllTeamsEvent: Event
    /** Removes avatar for current user */
    removeAvatar: User
    /** Remove a device ID to stop receiving push notifications */
    removeDeviceId?: UserDevice
    /** Removes event image */
    removeEventImage: Event
    /** Set list of event guests. */
    setEventGuests: Event
    /** Update own event. */
    updateMyEvent?: Event
    /** Update invitation status for current user. */
    updateMyInvitation: Event
    /** Update notification preferences for current user */
    updateMyNotificationPreferences: User
    /** Update profile of current user */
    updateMyUser?: User
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
    __typename: 'Organization'
}

export interface PageInfo {
    endCursor?: Scalars['ID']
    hasNextPage: Scalars['Boolean']
    hasPreviousPage: Scalars['Boolean']
    startCursor?: Scalars['ID']
    __typename: 'PageInfo'
}


/** UpFrom app queries */
export interface Query {
    /** Retrieve All Team events */
    allTeamEvents: QueryAllTeamEventsConnection
    currentUser?: User
    /** Retrieve events that user has declined (with declined invitation) */
    declinedEvents: QueryDeclinedEventsConnection
    /** Retrieve a single event */
    event?: Event
    /** Retrieve all organizations that are visible to this user */
    myOrganizations?: Organization[]
    myTeams: Team[]
    node?: Node
    nodes: (Node | undefined)[]
    /** Get single organization */
    organization: Organization
    /** Retrieve events with not responded invitations for current user (events with pending invitation) */
    pendingEvents: QueryPendingEventsConnection
    /** Match event titles to search string and return matched events */
    searchEvent: QuerySearchEventConnection
    /** Retrieve a single team */
    team?: Team
    /** Retrieve Team events */
    teamEvents: QueryTeamEventsConnection
    teamTotalAmount: Scalars['Int']
    user?: User
    /** Retrieve all events that user is going to visit */
    yourEvents: QueryYourEventsConnection
    __typename: 'Query'
}

export interface QueryAllTeamEventsConnection {
    edges: (QueryAllTeamEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryAllTeamEventsConnection'
}

export interface QueryAllTeamEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryAllTeamEventsConnectionEdge'
}

export interface QueryDeclinedEventsConnection {
    edges: (QueryDeclinedEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryDeclinedEventsConnection'
}

export interface QueryDeclinedEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryDeclinedEventsConnectionEdge'
}

export interface QueryPendingEventsConnection {
    edges: (QueryPendingEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryPendingEventsConnection'
}

export interface QueryPendingEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryPendingEventsConnectionEdge'
}

export interface QuerySearchEventConnection {
    edges: (QuerySearchEventConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QuerySearchEventConnection'
}

export interface QuerySearchEventConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QuerySearchEventConnectionEdge'
}

export interface QueryTeamEventsConnection {
    edges: (QueryTeamEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryTeamEventsConnection'
}

export interface QueryTeamEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryTeamEventsConnectionEdge'
}

export interface QueryYourEventsConnection {
    edges: (QueryYourEventsConnectionEdge | undefined)[]
    pageInfo: PageInfo
    __typename: 'QueryYourEventsConnection'
}

export interface QueryYourEventsConnectionEdge {
    cursor: Scalars['ID']
    node: Event
    __typename: 'QueryYourEventsConnectionEdge'
}

export interface Team {
    createdAt: Scalars['Timestamp']
    description: Scalars['String']
    id: Scalars['ID']
    imageUrl?: Scalars['String']
    isDisabled: Scalars['Boolean']
    members: TeamUser[]
    myMembership?: TeamUser
    name: Scalars['String']
    organization: Organization
    organizationId: Scalars['ID']
    __typename: 'Team'
}

export interface TeamUser {
    role: Scalars['String']
    teamId: Scalars['ID']
    user?: User
    userId: Scalars['ID']
    __typename: 'TeamUser'
}

export interface User {
    about?: Scalars['String']
    avatarUrl?: Scalars['String']
    chatData: ChatUserData
    createdAt: Scalars['Timestamp']
    firstName?: Scalars['String']
    id: Scalars['ID']
    isDisabled: Scalars['Boolean']
    lastName?: Scalars['String']
    notificationPreferences?: UserNotificationPreferences
    profile?: UserProfile
    teams: Team[]
    __typename: 'User'
}

export interface UserDevice {
    deviceId: Scalars['ID']
    userId: Scalars['ID']
    __typename: 'UserDevice'
}

export interface UserNotificationPreferences {
    emailChatNewMessage: Scalars['Boolean']
    emailEventPendingInvitation: Scalars['Boolean']
    pushChatNewMessage: Scalars['Boolean']
    pushEventCancelled: Scalars['Boolean']
    pushEventNewAllTeam: Scalars['Boolean']
    pushEventNewInvitation: Scalars['Boolean']
    pushEventRemovedIndividual: Scalars['Boolean']
    pushEventUpdatedDateTime: Scalars['Boolean']
    pushEventUpdatedLocation: Scalars['Boolean']
    pushTeamNewMember: Scalars['Boolean']
    userId: Scalars['ID']
    __typename: 'UserNotificationPreferences'
}

export interface UserProfile {
    birthday?: Scalars['Date']
    email: Scalars['String']
    gender?: Scalars['String']
    isSignupCompleted: Scalars['Boolean']
    location?: LocationType
    phone?: Scalars['String']
    __typename: 'UserProfile'
}

export interface ChatUserDataGenqlSelection{
    id?: boolean | number
    image?: boolean | number
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventGenqlSelection{
    address?: boolean | number
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
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface EventUserGenqlSelection{
    eventId?: boolean | number
    isAttending?: boolean | number
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


/** UpFrom app mutations */
export interface MutationGenqlSelection{
    /** Add a device ID to receive push notifications */
    addDeviceId?: (UserDeviceGenqlSelection & { __args: {deviceId: Scalars['String']} })
    /** Cancel an event */
    cancelEvent?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Completes avatar upload process (converts uploaded avatar and moves to public storage) */
    completeAvatarUpload?: UserGenqlSelection
    /** Completes event image upload process (converts uploaded image and moves it to a public storage) */
    completeEventImageUpload?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Complete sign up by providing additional profile info */
    completeSignUp?: (UserGenqlSelection & { __args: {about: Scalars['String'], birthday: Scalars['Date'], firstName: Scalars['String'], gender?: (Scalars['String'] | null), lastName: Scalars['String'], location: LocationInput} })
    /** Create a new event. */
    createEvent?: (EventGenqlSelection & { __args: {address?: (Scalars['String'] | null), description: Scalars['String'], endsAt: Scalars['Timestamp'], imageUrl?: (Scalars['String'] | null), isIndividual: Scalars['Boolean'], 
    /** Adds owner to invited users and accepts invitation */
    isOwnerAttending?: (Scalars['Boolean'] | null), location?: (LocationInput | null), startsAt: Scalars['Timestamp'], teamId?: (Scalars['String'] | null), title: Scalars['String']} })
    /** Generates an avatar upload URL for current user */
    generateAvatarUploadUrl?: boolean | number
    /** Generates an image upload URL for event */
    generateEventImageUploadUrl?: { __args: {id: Scalars['String']} }
    /** Join a public event. */
    joinAllTeamsEvent?: (EventGenqlSelection & { __args: {eventId: Scalars['String']} })
    /** Leave a public event. */
    leaveAllTeamsEvent?: (EventGenqlSelection & { __args: {eventId: Scalars['String']} })
    /** Removes avatar for current user */
    removeAvatar?: UserGenqlSelection
    /** Remove a device ID to stop receiving push notifications */
    removeDeviceId?: (UserDeviceGenqlSelection & { __args: {deviceId: Scalars['String']} })
    /** Removes event image */
    removeEventImage?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Set list of event guests. */
    setEventGuests?: (EventGenqlSelection & { __args: {eventId: Scalars['String'], userIds: Scalars['String'][]} })
    /** Update own event. */
    updateMyEvent?: (EventGenqlSelection & { __args: {address?: (Scalars['String'] | null), description: Scalars['String'], endsAt: Scalars['Timestamp'], id: Scalars['String'], imageUrl?: (Scalars['String'] | null), isIndividual: Scalars['Boolean'], location?: (LocationInput | null), startsAt: Scalars['Timestamp'], teamId?: (Scalars['String'] | null), title: Scalars['String']} })
    /** Update invitation status for current user. */
    updateMyInvitation?: (EventGenqlSelection & { __args: {eventId: Scalars['String'], 
    /** Set "null" to clear status */
    isAttending?: (Scalars['Boolean'] | null)} })
    /** Update notification preferences for current user */
    updateMyNotificationPreferences?: (UserGenqlSelection & { __args: {emailChatNewMessage: Scalars['Boolean'], emailEventPendingInvitation: Scalars['Boolean'], pushChatNewMessage: Scalars['Boolean'], pushEventCancelled: Scalars['Boolean'], pushEventNewAllTeam: Scalars['Boolean'], pushEventNewInvitation: Scalars['Boolean'], pushEventRemovedIndividual: Scalars['Boolean'], pushEventUpdatedDateTime: Scalars['Boolean'], pushEventUpdatedLocation: Scalars['Boolean'], pushTeamNewMember: Scalars['Boolean']} })
    /** Update profile of current user */
    updateMyUser?: (UserGenqlSelection & { __args: {about: Scalars['String'], birthday: Scalars['Date'], firstName: Scalars['String'], gender?: (Scalars['String'] | null), lastName: Scalars['String'], location: LocationInput} })
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


/** UpFrom app queries */
export interface QueryGenqlSelection{
    /** Retrieve All Team events */
    allTeamEvents?: (QueryAllTeamEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, to?: (Scalars['Timestamp'] | null)} })
    currentUser?: UserGenqlSelection
    /** Retrieve events that user has declined (with declined invitation) */
    declinedEvents?: (QueryDeclinedEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, to?: (Scalars['Timestamp'] | null)} })
    /** Retrieve a single event */
    event?: (EventGenqlSelection & { __args: {id: Scalars['String']} })
    /** Retrieve all organizations that are visible to this user */
    myOrganizations?: OrganizationGenqlSelection
    myTeams?: TeamGenqlSelection
    node?: (NodeGenqlSelection & { __args: {id: Scalars['ID']} })
    nodes?: (NodeGenqlSelection & { __args: {ids: Scalars['ID'][]} })
    /** Get single organization */
    organization?: (OrganizationGenqlSelection & { __args: {id: Scalars['String']} })
    /** Retrieve events with not responded invitations for current user (events with pending invitation) */
    pendingEvents?: (QueryPendingEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, to?: (Scalars['Timestamp'] | null)} })
    /** Match event titles to search string and return matched events */
    searchEvent?: (QuerySearchEventConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Should have at least 3 symbols */
    searchString: Scalars['String']} })
    /** Retrieve a single team */
    team?: (TeamGenqlSelection & { __args: {id: Scalars['String']} })
    /** Retrieve Team events */
    teamEvents?: (QueryTeamEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, to?: (Scalars['Timestamp'] | null)} })
    teamTotalAmount?: boolean | number
    user?: (UserGenqlSelection & { __args: {id: Scalars['String']} })
    /** Retrieve all events that user is going to visit */
    yourEvents?: (QueryYourEventsConnectionGenqlSelection & { __args: {after?: (Scalars['ID'] | null), before?: (Scalars['ID'] | null), first?: (Scalars['Int'] | null), from?: (Scalars['Timestamp'] | null), includeOngoing?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Sort order of events by event start date. Could be "asc" or "desc" */
    order: Order, to?: (Scalars['Timestamp'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryAllTeamEventsConnectionGenqlSelection{
    edges?: QueryAllTeamEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryAllTeamEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryDeclinedEventsConnectionGenqlSelection{
    edges?: QueryDeclinedEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryDeclinedEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryPendingEventsConnectionGenqlSelection{
    edges?: QueryPendingEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryPendingEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QuerySearchEventConnectionGenqlSelection{
    edges?: QuerySearchEventConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QuerySearchEventConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryTeamEventsConnectionGenqlSelection{
    edges?: QueryTeamEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryTeamEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryYourEventsConnectionGenqlSelection{
    edges?: QueryYourEventsConnectionEdgeGenqlSelection
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryYourEventsConnectionEdgeGenqlSelection{
    cursor?: boolean | number
    node?: EventGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TeamGenqlSelection{
    createdAt?: boolean | number
    description?: boolean | number
    id?: boolean | number
    imageUrl?: boolean | number
    isDisabled?: boolean | number
    members?: TeamUserGenqlSelection
    myMembership?: TeamUserGenqlSelection
    name?: boolean | number
    organization?: OrganizationGenqlSelection
    organizationId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface TeamUserGenqlSelection{
    role?: boolean | number
    teamId?: boolean | number
    user?: UserGenqlSelection
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    about?: boolean | number
    avatarUrl?: boolean | number
    chatData?: ChatUserDataGenqlSelection
    createdAt?: boolean | number
    firstName?: boolean | number
    id?: boolean | number
    isDisabled?: boolean | number
    lastName?: boolean | number
    notificationPreferences?: UserNotificationPreferencesGenqlSelection
    profile?: UserProfileGenqlSelection
    teams?: TeamGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserDeviceGenqlSelection{
    deviceId?: boolean | number
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserNotificationPreferencesGenqlSelection{
    emailChatNewMessage?: boolean | number
    emailEventPendingInvitation?: boolean | number
    pushChatNewMessage?: boolean | number
    pushEventCancelled?: boolean | number
    pushEventNewAllTeam?: boolean | number
    pushEventNewInvitation?: boolean | number
    pushEventRemovedIndividual?: boolean | number
    pushEventUpdatedDateTime?: boolean | number
    pushEventUpdatedLocation?: boolean | number
    pushTeamNewMember?: boolean | number
    userId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserProfileGenqlSelection{
    birthday?: boolean | number
    email?: boolean | number
    gender?: boolean | number
    isSignupCompleted?: boolean | number
    location?: LocationTypeGenqlSelection
    phone?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const ChatUserData_possibleTypes: string[] = ['ChatUserData']
    export const isChatUserData = (obj?: { __typename?: any } | null): obj is ChatUserData => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChatUserData"')
      return ChatUserData_possibleTypes.includes(obj.__typename)
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
    


    const QueryAllTeamEventsConnection_possibleTypes: string[] = ['QueryAllTeamEventsConnection']
    export const isQueryAllTeamEventsConnection = (obj?: { __typename?: any } | null): obj is QueryAllTeamEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryAllTeamEventsConnection"')
      return QueryAllTeamEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryAllTeamEventsConnectionEdge_possibleTypes: string[] = ['QueryAllTeamEventsConnectionEdge']
    export const isQueryAllTeamEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryAllTeamEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryAllTeamEventsConnectionEdge"')
      return QueryAllTeamEventsConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const QueryDeclinedEventsConnection_possibleTypes: string[] = ['QueryDeclinedEventsConnection']
    export const isQueryDeclinedEventsConnection = (obj?: { __typename?: any } | null): obj is QueryDeclinedEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryDeclinedEventsConnection"')
      return QueryDeclinedEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryDeclinedEventsConnectionEdge_possibleTypes: string[] = ['QueryDeclinedEventsConnectionEdge']
    export const isQueryDeclinedEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryDeclinedEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryDeclinedEventsConnectionEdge"')
      return QueryDeclinedEventsConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const QueryPendingEventsConnection_possibleTypes: string[] = ['QueryPendingEventsConnection']
    export const isQueryPendingEventsConnection = (obj?: { __typename?: any } | null): obj is QueryPendingEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryPendingEventsConnection"')
      return QueryPendingEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryPendingEventsConnectionEdge_possibleTypes: string[] = ['QueryPendingEventsConnectionEdge']
    export const isQueryPendingEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryPendingEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryPendingEventsConnectionEdge"')
      return QueryPendingEventsConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const QuerySearchEventConnection_possibleTypes: string[] = ['QuerySearchEventConnection']
    export const isQuerySearchEventConnection = (obj?: { __typename?: any } | null): obj is QuerySearchEventConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuerySearchEventConnection"')
      return QuerySearchEventConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QuerySearchEventConnectionEdge_possibleTypes: string[] = ['QuerySearchEventConnectionEdge']
    export const isQuerySearchEventConnectionEdge = (obj?: { __typename?: any } | null): obj is QuerySearchEventConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuerySearchEventConnectionEdge"')
      return QuerySearchEventConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const QueryTeamEventsConnection_possibleTypes: string[] = ['QueryTeamEventsConnection']
    export const isQueryTeamEventsConnection = (obj?: { __typename?: any } | null): obj is QueryTeamEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryTeamEventsConnection"')
      return QueryTeamEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryTeamEventsConnectionEdge_possibleTypes: string[] = ['QueryTeamEventsConnectionEdge']
    export const isQueryTeamEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryTeamEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryTeamEventsConnectionEdge"')
      return QueryTeamEventsConnectionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const QueryYourEventsConnection_possibleTypes: string[] = ['QueryYourEventsConnection']
    export const isQueryYourEventsConnection = (obj?: { __typename?: any } | null): obj is QueryYourEventsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryYourEventsConnection"')
      return QueryYourEventsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const QueryYourEventsConnectionEdge_possibleTypes: string[] = ['QueryYourEventsConnectionEdge']
    export const isQueryYourEventsConnectionEdge = (obj?: { __typename?: any } | null): obj is QueryYourEventsConnectionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQueryYourEventsConnectionEdge"')
      return QueryYourEventsConnectionEdge_possibleTypes.includes(obj.__typename)
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
    


    const UserDevice_possibleTypes: string[] = ['UserDevice']
    export const isUserDevice = (obj?: { __typename?: any } | null): obj is UserDevice => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserDevice"')
      return UserDevice_possibleTypes.includes(obj.__typename)
    }
    


    const UserNotificationPreferences_possibleTypes: string[] = ['UserNotificationPreferences']
    export const isUserNotificationPreferences = (obj?: { __typename?: any } | null): obj is UserNotificationPreferences => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserNotificationPreferences"')
      return UserNotificationPreferences_possibleTypes.includes(obj.__typename)
    }
    


    const UserProfile_possibleTypes: string[] = ['UserProfile']
    export const isUserProfile = (obj?: { __typename?: any } | null): obj is UserProfile => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUserProfile"')
      return UserProfile_possibleTypes.includes(obj.__typename)
    }
    

export const enumOrder = {
   asc: 'asc' as const,
   desc: 'desc' as const
}
