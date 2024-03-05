import getAuthenticationSingleton from './authentication';
import {twitchAlertsStore} from './alerts-store';
import config from '../../config';

export default class PubSubService {
    queue = [];
    processing = false;
    ws = null;
    twitchConfig = null;
    subscriptionsMade = false;

    intervalTimerId = null;

    constructor({twitchConfig}) {
        this.queue = [];
        this.processing = false;
        this.twitchConfig = twitchConfig;
        this.authentication = getAuthenticationSingleton(this.twitchConfig);

        if (config.useDeveloperScale) {
            window.test = {
                follower: (name = 'ThisIsMakena') => {
                    console.log('Test Follow', name);

                    twitchAlertsStore.addEvent({
                        type: 'new-follower',
                        data: {
                            __typename: 'ActivityFeedFollowAlert',
                            id: 'FOLLOW:63c9f63e-14ca-4f2f-b281-2ef6a99c4612',
                            status: 'QUEUED',
                            createdAt: '2024-02-29T00:39:03.582913311Z',
                            updatedAt: '2024-03-03T13:35:28.89972706Z',
                            follower: {
                                __typename: 'User',
                                id: '1010958187',
                                displayName: name,
                                login: name.toLowerCase(),
                            },
                        },
                    });

                    return true;
                },

                raid: (name = 'ThisIsMakena', partySize = 22) => {
                    console.log('Test Raid', name);

                    twitchAlertsStore.addEvent({
                        type: 'raid',
                        data: {
                            __typename: 'ActivityFeedRaidAlert',
                            id: 'RAID:c5ad1ff7-ae05-426a-9704-a35af9d26838',
                            status: 'QUEUED',
                            createdAt: '2024-02-12T04:02:35.078603796Z',
                            updatedAt: '2024-03-05T06:57:08.974414177Z',
                            raider: {
                                __typename: 'User',
                                id: '67279243',
                                displayName: name,
                                login: name.toLowerCase(),
                            },
                            partySize: partySize,
                        },
                    });

                    return true;
                },
            };
        }
    }

    async connect() {
        const accessToken = await this.authentication.getAccessToken();

        this.userId = this.authentication.userId;
        this.login = this.authentication.login;

        if (accessToken) {
            this.ws = new WebSocket(`wss://pubsub-edge.twitch.tv/v1`);

            this.ws.addEventListener('open', async () => {
                this.sendPing();
                this.ws.send(JSON.stringify({
                    type: 'LISTEN',
                    data: {
                        topics: ['activity-feed-alerts-v2.' + this.userId],
                        auth_token: await this.authentication.getAccessToken(),
                    },
                }));

                this.intervalTimerId = setInterval(() => {
                    this.sendPing();
                }, 1 * 60 * 1000); // @TODO Make this 4 minutes later
            });

            this.ws.addEventListener('message', (event) => {
                this.handleMessage(event);
            });

            this.ws.addEventListener('close', () => {
                clearInterval(this.intervalTimerId);
            });

            this.ws.addEventListener('error', (event) => {
                console.error('WebSocket error:', event);
            });
        } else {
            return false;
        }
    }

    sendPing() {
        // Respond to a ping message with a pong message to keep the connection alive
        const message = {
            type: 'PING',
        };

        this.ws.send(JSON.stringify(message));
    }

    handleMessage(event) {
        const message = JSON.parse(event.data);

        if (message.type === 'PONG') {
            return;
        }

        if (message.type === 'RESPONSE') {
            if (message.error) {
                console.error('PubSub error:', message.error);
            }

            return;
        }

        const topic = message?.data?.topic; // activity-feed-alerts-v2.${userId}
        const typeName = message?.data?.message?.data?.__typename;
        const data = message?.data?.message && JSON.parse(message?.data?.message);

        if (topic != `activity-feed-alerts-v2.${this.userId}`) {
            console.error('Unhandled topic:', topic, message);

            return;
        }

        if (data.status !== 'QUEUED') {
            console.warn('Ignored message', message);

            return;
        }

        console.info('PubSub message:', message);

        switch (typeName) {
            case 'ActivityFeedFollowAlert':
                /* Example queue message:
                {
                    "type": "activity_feed_alerts_update",
                    "data": {
                        "__typename": "ActivityFeedFollowAlert",
                        "id": "FOLLOW:63c9f63e-14ca-4f2f-b281-2ef6a99c4612",
                        "status": "QUEUED",
                        "createdAt": "2024-02-29T00:39:03.582913311Z",
                        "updatedAt": "2024-03-03T13:35:28.89972706Z",
                        "follower": {
                            "__typename": "User",
                            "id": "1010958187",
                            "displayName": "frey_wenye34",
                            "login": "frey_wenye34"
                        }
                    }
                }
                */
                twitchAlertsStore.addEvent({type: 'new-follower', data: data.follower});
                break;

            case 'ActivityFeedResubscriptionAlert':
                /* Example queue message:
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
                twitchAlertsStore.addEvent({type: 'new-subscriber', data: data.subscriber});
                break;

            case 'ActivityFeedPrimeSubscriptionAlert':
                /* Example queue message:
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

                console.error('not implemented yet');
                break;

            case 'ActivityFeedCommunityGiftSubscriptionAlert':
                /* Example queue message:
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
                console.error('not implemented yet');
                break;

            case 'ActivityFeedCheerAlert':
                /* Example queue message:
                {
                    "type": "activity_feed_alerts_update",
                    "data": {
                        "__typename": "ActivityFeedCheerAlert",
                        "id": "BITS_USAGE:ae0b695f-d69c-49d0-8ecb-5ef273bbb997",
                        "status": "QUEUED",
                        "createdAt": "2024-02-20T01:54:10.196792921Z",
                        "updatedAt": "2024-03-05T06:50:35.258926142Z",
                        "cheerer": {
                            "__typename": "User",
                            "id": "48363948",
                            "displayName": "macrossfiru",
                            "login": "macrossfiru"
                        },
                        "amount": 69,
                        "messageContent": {
                            "__typename": "ActivityFeedAlertMessageContent",
                            "fragments": [
                                {
                                    "__typename": "ActivityFeedAlertMessageCheermoteFragment",
                                    "cheermote": {
                                        "__typename": "ActivityFeedCheermote",
                                        "bitsAmount": 69,
                                        "prefix": "cheer",
                                        "tier": 1
                                    }
                                },
                                {
                                    "__typename": "ActivityFeedAlertMessageTextFragment",
                                    "text": " You wouldn't steal a car, but if you did, windy castle has a tower."
                                }
                            ]
                        },
                        "isAnonymous": false,
                        "isFirstTimeCheer": false
                    }
                }
                */
                console.error('not implemented yet');
                break;

            case 'ActivityFeedChannelPointsRedemptionAlert':
                /* Example queue message:
                {
                    "type": "activity_feed_alerts_update",
                    "data": {
                        "__typename": "ActivityFeedChannelPointsRedemptionAlert",
                        "id": "CHANNEL_POINTS_REWARD_REDEMPTION:9328dca8-35c6-43d6-b55f-c54c1b74b3a4",
                        "status": "QUEUED",
                        "createdAt": "2024-02-20T00:21:54.968988616Z",
                        "updatedAt": "2024-03-05T06:54:09.746098824Z",
                        "pointsSpent": 100,
                        "messageContent": {
                            "__typename": "ActivityFeedAlertMessageContent",
                            "fragments": []
                        },
                        "redeemer": {
                            "__typename": "User",
                            "id": "25563883",
                            "displayName": "PirateEggs",
                            "login": "pirateeggs"
                        },
                        "reward": {
                            "__typename": "AlertCommunityPointsCustomReward",
                            "id": "64738087-6473-448f-9257-19785cc0371e",
                            "title": "Hydrate!"
                        }
                    }
                }
                */
                console.error('not implemented yet');
                break;

            case 'ActivityFeedCreatorGoalAlert':
                /* Example queue STARTED message:
                {
                    "type": "activity_feed_alerts_update",
                    "data": {
                        "__typename": "ActivityFeedCreatorGoalAlert",
                        "id": "CREATOR_GOAL:2081b5c0-fccd-40f3-a055-4d1738bc5686",
                        "status": "QUEUED",
                        "createdAt": "2024-02-15T01:46:44.188835977Z",
                        "updatedAt": "2024-03-05T06:55:09.134073787Z",
                        "goalState": "STARTED",
                        "goalType": "FOLLOWERS",
                        "contributions": {
                            "__typename": "ChannelGoalIntegerContributions",
                            "currentIntegerContributions": 75,
                            "targetIntegerContributions": 100
                        },
                        "description": "3 digits!"
                    }
                }
                */

                /* Example queue REACHED message:
                {
                   "type": "activity_feed_alerts_update",
                   "data": {
                       "__typename": "ActivityFeedCreatorGoalAlert",
                       "id": "CREATOR_GOAL:24c433c7-20a9-44f2-8d40-f026a83b2cd2",
                       "status": "PLAYING",
                       "createdAt": "2024-02-14T05:44:46.060205535Z",
                       "updatedAt": "2024-03-05T06:56:11.106746179Z",
                       "goalState": "REACHED",
                       "goalType": "FOLLOWERS",
                       "contributions": {
                           "__typename": "ChannelGoalIntegerContributions",
                           "currentIntegerContributions": 75,
                           "targetIntegerContributions": 75
                       },
                       "description": ""
                   }
               }
               */
                console.error('not implemented yet');
                break;

            case 'ActivityFeedRaidAlert':
                /* Example queue message:
                {
                    "type": "activity_feed_alerts_update",
                    "data": {
                        "__typename": "ActivityFeedRaidAlert",
                        "id": "RAID:c5ad1ff7-ae05-426a-9704-a35af9d26838",
                        "status": "QUEUED",
                        "createdAt": "2024-02-12T04:02:35.078603796Z",
                        "updatedAt": "2024-03-05T06:57:08.974414177Z",
                        "raider": {
                            "__typename": "User",
                            "id": "67279243",
                            "displayName": "StikkyBikky",
                            "login": "stikkybikky"
                        },
                        "partySize": 8
                    }
                }
                */

                console.error('not implemented yet');
                break;

            case 'ActivityFeedHypeTrainAlert':
                /* Example queue message:
                {
                    "type": "activity_feed_alerts_update",
                    "data": {
                        "__typename": "ActivityFeedHypeTrainAlert",
                        "id": "HYPE_TRAIN:10e91276-f7ea-4f6a-9442-6e254581abd7",
                        "status": "QUEUED",
                        "createdAt": "2024-02-20T01:53:14.749523706Z",
                        "updatedAt": "2024-03-05T06:59:02.064719949Z",
                        "hypeTrainState": "STARTED",
                        "level": 1,
                        "allTimeHighLevel": 1,
                        "isAllTimeHighLevel": false
                    }
                }
                */
                console.error('Unhandled message:', message);
                break;

            default:
                console.error('Unhandled message:', message);
                break;
        }
    } // eo handleMessage
}
