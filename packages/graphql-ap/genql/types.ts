export default {
    "scalars": [
        1,
        2,
        3,
        4,
        8,
        12,
        15,
        18,
        28,
        29
    ],
    "types": {
        "Admin": {
            "createdAt": [
                29
            ],
            "email": [
                1
            ],
            "id": [
                2
            ],
            "isDisabled": [
                3
            ],
            "name": [
                1
            ],
            "updatedAt": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "ID": {},
        "Boolean": {},
        "Date": {},
        "Event": {
            "address": [
                1
            ],
            "createdAt": [
                29
            ],
            "description": [
                1
            ],
            "endsAt": [
                29
            ],
            "globalId": [
                2
            ],
            "guests": [
                6
            ],
            "id": [
                2
            ],
            "imageUrl": [
                1
            ],
            "isCancelled": [
                3
            ],
            "isIndividual": [
                3
            ],
            "location": [
                10
            ],
            "owner": [
                30
            ],
            "ownerId": [
                2
            ],
            "startsAt": [
                29
            ],
            "team": [
                26
            ],
            "teamId": [
                2
            ],
            "title": [
                1
            ],
            "updatedAt": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "EventUser": {
            "createdAt": [
                29
            ],
            "eventId": [
                2
            ],
            "isAttending": [
                3
            ],
            "updatedAt": [
                29
            ],
            "user": [
                30
            ],
            "userId": [
                2
            ],
            "__typename": [
                1
            ]
        },
        "EventUserAttendance": {
            "accepted": [
                8
            ],
            "declined": [
                8
            ],
            "pending": [
                8
            ],
            "total": [
                8
            ],
            "user": [
                30
            ],
            "userId": [
                2
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "LocationInput": {
            "lat": [
                1
            ],
            "lng": [
                1
            ],
            "locationID": [
                1
            ],
            "locationName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "LocationType": {
            "lat": [
                1
            ],
            "lng": [
                1
            ],
            "locationID": [
                1
            ],
            "locationName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MinMaxInput": {
            "max": [
                12
            ],
            "min": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "Mutation": {
            "addTeamMember": [
                26,
                {
                    "role": [
                        28,
                        "TeamUserRoles!"
                    ],
                    "teamId": [
                        1,
                        "String!"
                    ],
                    "userId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "cancelEvent": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAvatarUpload": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeEventImageUpload": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeOrganizationImageUpload": [
                16,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeTeamImageUpload": [
                26,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createAdmin": [
                0,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1
                    ]
                }
            ],
            "createEvent": [
                5,
                {
                    "address": [
                        1
                    ],
                    "description": [
                        1,
                        "String!"
                    ],
                    "endsAt": [
                        29,
                        "Timestamp!"
                    ],
                    "imageUrl": [
                        1
                    ],
                    "isIndividual": [
                        3,
                        "Boolean!"
                    ],
                    "isOwnerAttending": [
                        3
                    ],
                    "location": [
                        9
                    ],
                    "ownerId": [
                        1,
                        "String!"
                    ],
                    "startsAt": [
                        29,
                        "Timestamp!"
                    ],
                    "teamId": [
                        1
                    ],
                    "title": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createEventUser": [
                5,
                {
                    "eventId": [
                        1,
                        "String!"
                    ],
                    "isAttending": [
                        3
                    ],
                    "userId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOrganization": [
                16,
                {
                    "details": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createTeam": [
                26,
                {
                    "description": [
                        1,
                        "String!"
                    ],
                    "imageUrl": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1,
                        "String!"
                    ],
                    "organizationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createTeamUser": [
                30,
                {
                    "about": [
                        1
                    ],
                    "avatarUrl": [
                        1
                    ],
                    "birthday": [
                        4
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "firstName": [
                        1
                    ],
                    "gender": [
                        1
                    ],
                    "lastName": [
                        1
                    ],
                    "location": [
                        9
                    ],
                    "phone": [
                        1
                    ],
                    "teamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUser": [
                30,
                {
                    "about": [
                        1
                    ],
                    "avatarUrl": [
                        1
                    ],
                    "birthday": [
                        4
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "firstName": [
                        1
                    ],
                    "gender": [
                        1
                    ],
                    "isSignupCompleted": [
                        3,
                        "Boolean!"
                    ],
                    "lastName": [
                        1
                    ],
                    "location": [
                        9
                    ],
                    "phone": [
                        1
                    ]
                }
            ],
            "disableAdmin": [
                0,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "disableTeam": [
                26,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "disableUser": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "enableAdmin": [
                0,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "enableTeam": [
                26,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "enableUser": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateAvatarUploadUrl": [
                1,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateEventImageUploadUrl": [
                1,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateOrganizationImageUploadUrl": [
                1,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateTeamImageUploadUrl": [
                1,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeAvatar": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeEventImage": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeEventUser": [
                5,
                {
                    "eventId": [
                        1,
                        "String!"
                    ],
                    "userId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeOrganization": [
                16,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeOrganizationImage": [
                16,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeTeamImage": [
                26,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "removeTeamMember": [
                26,
                {
                    "teamId": [
                        1,
                        "String!"
                    ],
                    "userId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "restoreEvent": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitationEmail": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEventGuests": [
                5,
                {
                    "eventId": [
                        1,
                        "String!"
                    ],
                    "userIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "updateEvent": [
                5,
                {
                    "address": [
                        1
                    ],
                    "description": [
                        1,
                        "String!"
                    ],
                    "endsAt": [
                        29,
                        "Timestamp!"
                    ],
                    "id": [
                        1,
                        "String!"
                    ],
                    "imageUrl": [
                        1
                    ],
                    "isCancelled": [
                        3,
                        "Boolean!"
                    ],
                    "isIndividual": [
                        3,
                        "Boolean!"
                    ],
                    "location": [
                        9
                    ],
                    "ownerId": [
                        1,
                        "String!"
                    ],
                    "startsAt": [
                        29,
                        "Timestamp!"
                    ],
                    "teamId": [
                        1
                    ],
                    "title": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateEventUser": [
                5,
                {
                    "eventId": [
                        1,
                        "String!"
                    ],
                    "isAttending": [
                        3
                    ],
                    "userId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateOrganization": [
                16,
                {
                    "details": [
                        1,
                        "String!"
                    ],
                    "id": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateTeam": [
                26,
                {
                    "description": [
                        1,
                        "String!"
                    ],
                    "id": [
                        1,
                        "String!"
                    ],
                    "imageUrl": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1,
                        "String!"
                    ],
                    "organizationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateTeamMemberRole": [
                26,
                {
                    "role": [
                        28,
                        "TeamUserRoles!"
                    ],
                    "teamId": [
                        1,
                        "String!"
                    ],
                    "userId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateUser": [
                30,
                {
                    "about": [
                        1,
                        "String!"
                    ],
                    "avatarUrl": [
                        1
                    ],
                    "birthday": [
                        4,
                        "Date!"
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "firstName": [
                        1,
                        "String!"
                    ],
                    "gender": [
                        1,
                        "String!"
                    ],
                    "id": [
                        1,
                        "String!"
                    ],
                    "lastName": [
                        1,
                        "String!"
                    ],
                    "location": [
                        9,
                        "LocationInput!"
                    ],
                    "phone": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "Node": {
            "globalId": [
                2
            ],
            "on_Event": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "Order": {},
        "Organization": {
            "createdAt": [
                29
            ],
            "details": [
                1
            ],
            "id": [
                2
            ],
            "imageUrl": [
                1
            ],
            "name": [
                1
            ],
            "teams": [
                26
            ],
            "updatedAt": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "PageInfo": {
            "endCursor": [
                2
            ],
            "hasNextPage": [
                3
            ],
            "hasPreviousPage": [
                3
            ],
            "startCursor": [
                2
            ],
            "__typename": [
                1
            ]
        },
        "PositiveInt": {},
        "Query": {
            "allAdmins": [
                0
            ],
            "allCounters": [
                25
            ],
            "allEvents": [
                20,
                {
                    "after": [
                        2
                    ],
                    "before": [
                        2
                    ],
                    "first": [
                        8
                    ],
                    "from": [
                        29
                    ],
                    "includeOngoing": [
                        3
                    ],
                    "last": [
                        8
                    ],
                    "order": [
                        15,
                        "Order!"
                    ],
                    "to": [
                        29
                    ]
                }
            ],
            "allOrganizationCounters": [
                25,
                {
                    "organizationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "allOrganizationEvents": [
                22,
                {
                    "after": [
                        2
                    ],
                    "before": [
                        2
                    ],
                    "first": [
                        8
                    ],
                    "from": [
                        29
                    ],
                    "includeOngoing": [
                        3
                    ],
                    "last": [
                        8
                    ],
                    "order": [
                        15,
                        "Order!"
                    ],
                    "organizationId": [
                        1,
                        "String!"
                    ],
                    "to": [
                        29
                    ]
                }
            ],
            "allOrganizationTeams": [
                26,
                {
                    "organizationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "allOrganizationUsers": [
                30,
                {
                    "organizationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "allOrganizations": [
                16
            ],
            "allTeams": [
                26
            ],
            "allUsers": [
                30
            ],
            "event": [
                5,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getOrganizationAttendance": [
                7,
                {
                    "from": [
                        29
                    ],
                    "organizationId": [
                        1,
                        "String!"
                    ],
                    "to": [
                        29
                    ]
                }
            ],
            "getTeamAttendance": [
                7,
                {
                    "from": [
                        29
                    ],
                    "teamId": [
                        1,
                        "String!"
                    ],
                    "to": [
                        29
                    ]
                }
            ],
            "getUserAttendance": [
                7,
                {
                    "from": [
                        29
                    ],
                    "teamId": [
                        1
                    ],
                    "to": [
                        29
                    ]
                }
            ],
            "node": [
                14,
                {
                    "id": [
                        2,
                        "ID!"
                    ]
                }
            ],
            "nodes": [
                14,
                {
                    "ids": [
                        2,
                        "[ID!]!"
                    ]
                }
            ],
            "organization": [
                16,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "organizationTotalAmount": [
                8
            ],
            "searchOrganizations": [
                16,
                {
                    "namePattern": [
                        1
                    ],
                    "order": [
                        15,
                        "Order!"
                    ]
                }
            ],
            "team": [
                26,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "user": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "QueryAllEventsConnection": {
            "edges": [
                21
            ],
            "pageInfo": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "QueryAllEventsConnectionEdge": {
            "cursor": [
                2
            ],
            "node": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "QueryAllOrganizationEventsConnection": {
            "edges": [
                23
            ],
            "pageInfo": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "QueryAllOrganizationEventsConnectionEdge": {
            "cursor": [
                2
            ],
            "node": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "StateInput": {
            "abbreviation": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SummaryCountersType": {
            "admins": [
                8
            ],
            "events": [
                8
            ],
            "invitedUsers": [
                8
            ],
            "ongoingEvents": [
                8
            ],
            "organizations": [
                8
            ],
            "pastEvents": [
                8
            ],
            "signupCompletedUsers": [
                8
            ],
            "teams": [
                8
            ],
            "upcomingEvents": [
                8
            ],
            "users": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "Team": {
            "createdAt": [
                29
            ],
            "description": [
                1
            ],
            "events": [
                5
            ],
            "id": [
                2
            ],
            "imageUrl": [
                1
            ],
            "isDisabled": [
                3
            ],
            "members": [
                27
            ],
            "name": [
                1
            ],
            "organization": [
                16
            ],
            "organizationId": [
                2
            ],
            "updatedAt": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "TeamUser": {
            "createdAt": [
                29
            ],
            "role": [
                1
            ],
            "teamId": [
                2
            ],
            "updatedAt": [
                29
            ],
            "user": [
                30
            ],
            "userId": [
                2
            ],
            "__typename": [
                1
            ]
        },
        "TeamUserRoles": {},
        "Timestamp": {},
        "User": {
            "about": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "birthday": [
                4
            ],
            "createdAt": [
                29
            ],
            "email": [
                1
            ],
            "events": [
                5
            ],
            "firstName": [
                1
            ],
            "gender": [
                1
            ],
            "id": [
                2
            ],
            "isDisabled": [
                3
            ],
            "isSignupCompleted": [
                3
            ],
            "lastName": [
                1
            ],
            "location": [
                10
            ],
            "phone": [
                1
            ],
            "teams": [
                26
            ],
            "updatedAt": [
                29
            ],
            "__typename": [
                1
            ]
        }
    }
}