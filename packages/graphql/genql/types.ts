export default {
    "scalars": [
        1,
        2,
        3,
        5,
        11,
        14,
        16,
        31
    ],
    "types": {
        "ChatUserData": {
            "id": [
                1
            ],
            "image": [
                2
            ],
            "name": [
                2
            ],
            "__typename": [
                2
            ]
        },
        "ID": {},
        "String": {},
        "Date": {},
        "Event": {
            "address": [
                2
            ],
            "description": [
                2
            ],
            "endsAt": [
                31
            ],
            "globalId": [
                1
            ],
            "guests": [
                6
            ],
            "id": [
                1
            ],
            "imageUrl": [
                2
            ],
            "isCancelled": [
                5
            ],
            "isIndividual": [
                5
            ],
            "location": [
                8
            ],
            "owner": [
                32
            ],
            "ownerId": [
                1
            ],
            "startsAt": [
                31
            ],
            "team": [
                29
            ],
            "teamId": [
                1
            ],
            "title": [
                2
            ],
            "__typename": [
                2
            ]
        },
        "Boolean": {},
        "EventUser": {
            "eventId": [
                1
            ],
            "isAttending": [
                5
            ],
            "user": [
                32
            ],
            "userId": [
                1
            ],
            "__typename": [
                2
            ]
        },
        "LocationInput": {
            "lat": [
                2
            ],
            "lng": [
                2
            ],
            "locationID": [
                2
            ],
            "locationName": [
                2
            ],
            "__typename": [
                2
            ]
        },
        "LocationType": {
            "lat": [
                2
            ],
            "lng": [
                2
            ],
            "locationID": [
                2
            ],
            "locationName": [
                2
            ],
            "__typename": [
                2
            ]
        },
        "Mutation": {
            "addDeviceId": [
                33,
                {
                    "deviceId": [
                        2,
                        "String!"
                    ]
                }
            ],
            "cancelEvent": [
                4,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "completeAvatarUpload": [
                32
            ],
            "completeEventImageUpload": [
                4,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "completeSignUp": [
                32,
                {
                    "about": [
                        2,
                        "String!"
                    ],
                    "birthday": [
                        3,
                        "Date!"
                    ],
                    "firstName": [
                        2,
                        "String!"
                    ],
                    "gender": [
                        2
                    ],
                    "lastName": [
                        2,
                        "String!"
                    ],
                    "location": [
                        7,
                        "LocationInput!"
                    ]
                }
            ],
            "createEvent": [
                4,
                {
                    "address": [
                        2
                    ],
                    "description": [
                        2,
                        "String!"
                    ],
                    "endsAt": [
                        31,
                        "Timestamp!"
                    ],
                    "imageUrl": [
                        2
                    ],
                    "isIndividual": [
                        5,
                        "Boolean!"
                    ],
                    "isOwnerAttending": [
                        5
                    ],
                    "location": [
                        7
                    ],
                    "startsAt": [
                        31,
                        "Timestamp!"
                    ],
                    "teamId": [
                        2
                    ],
                    "title": [
                        2,
                        "String!"
                    ]
                }
            ],
            "generateAvatarUploadUrl": [
                2
            ],
            "generateEventImageUploadUrl": [
                2,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "joinAllTeamsEvent": [
                4,
                {
                    "eventId": [
                        2,
                        "String!"
                    ]
                }
            ],
            "leaveAllTeamsEvent": [
                4,
                {
                    "eventId": [
                        2,
                        "String!"
                    ]
                }
            ],
            "removeAvatar": [
                32
            ],
            "removeDeviceId": [
                33,
                {
                    "deviceId": [
                        2,
                        "String!"
                    ]
                }
            ],
            "removeEventImage": [
                4,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "setEventGuests": [
                4,
                {
                    "eventId": [
                        2,
                        "String!"
                    ],
                    "userIds": [
                        2,
                        "[String!]!"
                    ]
                }
            ],
            "updateMyEvent": [
                4,
                {
                    "address": [
                        2
                    ],
                    "description": [
                        2,
                        "String!"
                    ],
                    "endsAt": [
                        31,
                        "Timestamp!"
                    ],
                    "id": [
                        2,
                        "String!"
                    ],
                    "imageUrl": [
                        2
                    ],
                    "isIndividual": [
                        5,
                        "Boolean!"
                    ],
                    "location": [
                        7
                    ],
                    "startsAt": [
                        31,
                        "Timestamp!"
                    ],
                    "teamId": [
                        2
                    ],
                    "title": [
                        2,
                        "String!"
                    ]
                }
            ],
            "updateMyInvitation": [
                4,
                {
                    "eventId": [
                        2,
                        "String!"
                    ],
                    "isAttending": [
                        5
                    ]
                }
            ],
            "updateMyNotificationPreferences": [
                32,
                {
                    "emailChatNewMessage": [
                        5,
                        "Boolean!"
                    ],
                    "emailEventPendingInvitation": [
                        5,
                        "Boolean!"
                    ],
                    "pushChatNewMessage": [
                        5,
                        "Boolean!"
                    ],
                    "pushEventCancelled": [
                        5,
                        "Boolean!"
                    ],
                    "pushEventNewAllTeam": [
                        5,
                        "Boolean!"
                    ],
                    "pushEventNewInvitation": [
                        5,
                        "Boolean!"
                    ],
                    "pushEventRemovedIndividual": [
                        5,
                        "Boolean!"
                    ],
                    "pushEventUpdatedDateTime": [
                        5,
                        "Boolean!"
                    ],
                    "pushEventUpdatedLocation": [
                        5,
                        "Boolean!"
                    ],
                    "pushTeamNewMember": [
                        5,
                        "Boolean!"
                    ]
                }
            ],
            "updateMyUser": [
                32,
                {
                    "about": [
                        2,
                        "String!"
                    ],
                    "birthday": [
                        3,
                        "Date!"
                    ],
                    "firstName": [
                        2,
                        "String!"
                    ],
                    "gender": [
                        2
                    ],
                    "lastName": [
                        2,
                        "String!"
                    ],
                    "location": [
                        7,
                        "LocationInput!"
                    ]
                }
            ],
            "__typename": [
                2
            ]
        },
        "Node": {
            "globalId": [
                1
            ],
            "on_Event": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "Order": {},
        "Organization": {
            "createdAt": [
                31
            ],
            "details": [
                2
            ],
            "id": [
                1
            ],
            "imageUrl": [
                2
            ],
            "name": [
                2
            ],
            "teams": [
                29
            ],
            "__typename": [
                2
            ]
        },
        "PageInfo": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                5
            ],
            "hasPreviousPage": [
                5
            ],
            "startCursor": [
                1
            ],
            "__typename": [
                2
            ]
        },
        "PositiveInt": {},
        "Query": {
            "allTeamEvents": [
                17,
                {
                    "after": [
                        1
                    ],
                    "before": [
                        1
                    ],
                    "first": [
                        16
                    ],
                    "from": [
                        31
                    ],
                    "includeOngoing": [
                        5
                    ],
                    "last": [
                        16
                    ],
                    "order": [
                        11,
                        "Order!"
                    ],
                    "to": [
                        31
                    ]
                }
            ],
            "currentUser": [
                32
            ],
            "declinedEvents": [
                19,
                {
                    "after": [
                        1
                    ],
                    "before": [
                        1
                    ],
                    "first": [
                        16
                    ],
                    "from": [
                        31
                    ],
                    "includeOngoing": [
                        5
                    ],
                    "last": [
                        16
                    ],
                    "order": [
                        11,
                        "Order!"
                    ],
                    "to": [
                        31
                    ]
                }
            ],
            "event": [
                4,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "myOrganizations": [
                12
            ],
            "myTeams": [
                29
            ],
            "node": [
                10,
                {
                    "id": [
                        1,
                        "ID!"
                    ]
                }
            ],
            "nodes": [
                10,
                {
                    "ids": [
                        1,
                        "[ID!]!"
                    ]
                }
            ],
            "organization": [
                12,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "pendingEvents": [
                21,
                {
                    "after": [
                        1
                    ],
                    "before": [
                        1
                    ],
                    "first": [
                        16
                    ],
                    "from": [
                        31
                    ],
                    "includeOngoing": [
                        5
                    ],
                    "last": [
                        16
                    ],
                    "order": [
                        11,
                        "Order!"
                    ],
                    "to": [
                        31
                    ]
                }
            ],
            "searchEvent": [
                23,
                {
                    "after": [
                        1
                    ],
                    "before": [
                        1
                    ],
                    "first": [
                        16
                    ],
                    "last": [
                        16
                    ],
                    "searchString": [
                        2,
                        "String!"
                    ]
                }
            ],
            "team": [
                29,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "teamEvents": [
                25,
                {
                    "after": [
                        1
                    ],
                    "before": [
                        1
                    ],
                    "first": [
                        16
                    ],
                    "from": [
                        31
                    ],
                    "includeOngoing": [
                        5
                    ],
                    "last": [
                        16
                    ],
                    "order": [
                        11,
                        "Order!"
                    ],
                    "to": [
                        31
                    ]
                }
            ],
            "teamTotalAmount": [
                16
            ],
            "user": [
                32,
                {
                    "id": [
                        2,
                        "String!"
                    ]
                }
            ],
            "yourEvents": [
                27,
                {
                    "after": [
                        1
                    ],
                    "before": [
                        1
                    ],
                    "first": [
                        16
                    ],
                    "from": [
                        31
                    ],
                    "includeOngoing": [
                        5
                    ],
                    "last": [
                        16
                    ],
                    "order": [
                        11,
                        "Order!"
                    ],
                    "to": [
                        31
                    ]
                }
            ],
            "__typename": [
                2
            ]
        },
        "Int": {},
        "QueryAllTeamEventsConnection": {
            "edges": [
                18
            ],
            "pageInfo": [
                13
            ],
            "__typename": [
                2
            ]
        },
        "QueryAllTeamEventsConnectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "QueryDeclinedEventsConnection": {
            "edges": [
                20
            ],
            "pageInfo": [
                13
            ],
            "__typename": [
                2
            ]
        },
        "QueryDeclinedEventsConnectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "QueryPendingEventsConnection": {
            "edges": [
                22
            ],
            "pageInfo": [
                13
            ],
            "__typename": [
                2
            ]
        },
        "QueryPendingEventsConnectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "QuerySearchEventConnection": {
            "edges": [
                24
            ],
            "pageInfo": [
                13
            ],
            "__typename": [
                2
            ]
        },
        "QuerySearchEventConnectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "QueryTeamEventsConnection": {
            "edges": [
                26
            ],
            "pageInfo": [
                13
            ],
            "__typename": [
                2
            ]
        },
        "QueryTeamEventsConnectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "QueryYourEventsConnection": {
            "edges": [
                28
            ],
            "pageInfo": [
                13
            ],
            "__typename": [
                2
            ]
        },
        "QueryYourEventsConnectionEdge": {
            "cursor": [
                1
            ],
            "node": [
                4
            ],
            "__typename": [
                2
            ]
        },
        "Team": {
            "createdAt": [
                31
            ],
            "description": [
                2
            ],
            "id": [
                1
            ],
            "imageUrl": [
                2
            ],
            "isDisabled": [
                5
            ],
            "members": [
                30
            ],
            "myMembership": [
                30
            ],
            "name": [
                2
            ],
            "organization": [
                12
            ],
            "organizationId": [
                1
            ],
            "__typename": [
                2
            ]
        },
        "TeamUser": {
            "role": [
                2
            ],
            "teamId": [
                1
            ],
            "user": [
                32
            ],
            "userId": [
                1
            ],
            "__typename": [
                2
            ]
        },
        "Timestamp": {},
        "User": {
            "about": [
                2
            ],
            "avatarUrl": [
                2
            ],
            "chatData": [
                0
            ],
            "createdAt": [
                31
            ],
            "firstName": [
                2
            ],
            "id": [
                1
            ],
            "isDisabled": [
                5
            ],
            "lastName": [
                2
            ],
            "notificationPreferences": [
                34
            ],
            "profile": [
                35
            ],
            "teams": [
                29
            ],
            "__typename": [
                2
            ]
        },
        "UserDevice": {
            "deviceId": [
                1
            ],
            "userId": [
                1
            ],
            "__typename": [
                2
            ]
        },
        "UserNotificationPreferences": {
            "emailChatNewMessage": [
                5
            ],
            "emailEventPendingInvitation": [
                5
            ],
            "pushChatNewMessage": [
                5
            ],
            "pushEventCancelled": [
                5
            ],
            "pushEventNewAllTeam": [
                5
            ],
            "pushEventNewInvitation": [
                5
            ],
            "pushEventRemovedIndividual": [
                5
            ],
            "pushEventUpdatedDateTime": [
                5
            ],
            "pushEventUpdatedLocation": [
                5
            ],
            "pushTeamNewMember": [
                5
            ],
            "userId": [
                1
            ],
            "__typename": [
                2
            ]
        },
        "UserProfile": {
            "birthday": [
                3
            ],
            "email": [
                2
            ],
            "gender": [
                2
            ],
            "isSignupCompleted": [
                5
            ],
            "location": [
                8
            ],
            "phone": [
                2
            ],
            "__typename": [
                2
            ]
        }
    }
}