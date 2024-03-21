switch (true) {
    case 'ActivityFeedResubscriptionAlert':
        /* Example ActivityFeedResubscriptionAlert queue message:    " Resubscribed for 1 month at Tier 1. They've been subscribed for 2 months! "
        {
            "type": "activity_feed_alerts_update",
            "data": {
                "__typename": "ActivityFeedResubscriptionAlert",
                "id": "RESUBSCRIPTION:a2033e08-5277-4410-ba32-82381c5acdbc",
                "status": "QUEUED",
                "createdAt": "2024-02-28T22:22:19.040751952Z",
                "updatedAt": "2024-03-04T07:01:24.511402649Z",
                "totalDuration": 2,
                "streakDuration": 0,
                "multiMonthDuration": 1,
                "messageContent": {
                    "__typename": "ActivityFeedAlertMessageContent",
                    "fragments": [
                        {
                            "__typename": "ActivityFeedAlertMessageTextFragment",
                            "text": "oh em gee"
                        }
                    ]
                },
                "tier": "T_1000",
                "subscriber": {
                    "__typename": "User",
                    "id": "125318454",
                    "displayName": "ThisIsMakena",
                    "login": "thisismakena"
                },
                "viewerCustomizationSelection": null
            }
        }
        */
        break;

    case 'ActivityFeedPrimeSubscriptionAlert':
        /* Example ActivityFeedPrimeSubscriptionAlert queue message:
            {
                "type": "activity_feed_alerts_update",
                "data": {
                    "__typename": "ActivityFeedPrimeSubscriptionAlert",
                    "id": "PRIME_SUBSCRIPTION:ec25c7c6-606c-43bd-97c5-c63361724509",
                    "status": "PLAYING",
                    "createdAt": "2024-02-26T01:18:54.782006173Z",
                    "updatedAt": "2024-03-05T06:46:42.232939539Z",
                    "subscriber": {
                        "__typename": "User",
                        "id": "182656748",
                        "displayName": "Reaper_link",
                        "login": "reaper_link"
                    }
                }
            }
        */
        break;

    case 'ActivityFeedCommunityGiftSubscriptionAlert':
        /* Example ActivityFeedCommunityGiftSubscriptionAlert queue message:
        {
            "type": "activity_feed_alerts_update",
            "data": {
                "__typename": "ActivityFeedCommunityGiftSubscriptionAlert",
                "id": "COMMUNITY_GIFT_SUBSCRIPTION:a0ffd5eb-56e6-449d-8d9c-ac45eaee6253",
                "status": "PLAYING",
                "createdAt": "2024-02-20T01:54:42.133808336Z",
                "updatedAt": "2024-03-05T06:48:50.463177531Z",
                "quantity": 1,
                "multiMonthDuration": 1,
                "tier": "T_1000",
                "gifter": {
                    "__typename": "User",
                    "id": "48363948",
                    "displayName": "macrossfiru",
                    "login": "macrossfiru"
                },
                "isAnonymous": false,
                "totalGiftCount": 3
            }
        }
        */
        break;

    case 'ActivityFeedIndividualGiftSubscriptionAlert':
        /* Example ActivityFeedIndividualGiftSubscriptionAlert queue message: ThisIsMakena • Gifted a 1 Month Tier 1 sub to HaIey8
        {
            "type": "activity_feed_alerts_update",
            "data": {
                "__typename": "ActivityFeedIndividualGiftSubscriptionAlert",
                "id": "INDIVIDUAL_GIFT_SUBSCRIPTION:34af0507-848e-40db-be79-54fe6c0a738a",
                "status": "QUEUED",
                "createdAt": "2024-03-15T03:02:58.98407632Z",
                "updatedAt": "2024-03-19T10:52:41.689925301Z",
                "multiMonthDuration": 1,
                "tier": "T_1000",
                "gifter": {
                    "__typename": "User",
                    "id": "125318454",
                    "displayName": "ThisIsMakena",
                    "login": "thisismakena"
                },
                "recipient": {
                    "__typename": "User",
                    "id": "261454369",
                    "displayName": "HaIey8",
                    "login": "haiey8"
                },
                "isAnonymous": false,
                "totalGiftCount": 1
            }
        }
        */
        break;

    case 'ActivityFeedSubscriptionAlert':
        /* Example ActivityFeedSubscriptionAlert message:  "streamindazztester • Subscribed for 1 month at Tier 1"
        {
            "type": "activity_feed_alerts_create",
            "data": {
                "__typename": "ActivityFeedSubscriptionAlert",
                "id": "SUBSCRIPTION:790ffd74-41b3-42a8-9486-3a51b1b9aabc",
                "status": "OFFLINE",
                "createdAt": "2024-03-14T23:53:01.127274435Z",
                "updatedAt": null,
                "subscriber": {
                    "__typename": "User",
                    "id": "1047343066",
                    "displayName": "streamindazztester",
                    "login": "streamindazztester"
                },
                "multiMonthDuration": 1,
                "tier": "T_1000"
            }
        }
    */
}
