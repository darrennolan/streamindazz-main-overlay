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
                follower: (name = 'StreaminDazz') => {
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

                raid: (name = 'StreaminDazz', partySize = 22) => {
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

                subscriberNew: (
                    name = 'StreaminDazz',
                    type = 'new',
                    message = 'Yay resub',
                    subscriptionDuration = 1,
                    streakDuration = 1,
                    totalGiftCount = 1,
                    quantityPurchased = 1,
                    tier = 'T_1000' ,
                ) => {
                    twitchAlertsStore.addEvent({
                        type: 'subscriber',
                        data: {
                            id: name + Math.random(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            displayName: name,
                            type,
                            message,
                            subscriptionDuration,
                            streakDuration,
                            totalGiftCount,
                            quantityPurchased,
                            tier,
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
                        topics: [
                            'activity-feed-alerts-v2.' + this.userId,
                            // 'channel-subscribe-events-v1.' + this.userId,
                        ],
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
        let normalizedSubscriber;
        let subscriberType;
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
        const parsedMessage = message?.data?.message && JSON.parse(message?.data?.message);
        const typeName = parsedMessage?.data?.__typename;

        if (topic != `activity-feed-alerts-v2.${this.userId}`) {
            console.error('Unhandled topic:', topic, message);

            return;
        }

        if (parsedMessage?.data?.status !== 'QUEUED' && parsedMessage?.data?.status !== 'OFFLINE') {
            console.warn('Ignored not QUEUED or OFFLINE message from alerts', message);

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
                twitchAlertsStore.addEvent({type: 'new-follower', data: parsedMessage.data});
                break;

            case 'ActivityFeedResubscriptionAlert':
            case 'ActivityFeedPrimeSubscriptionAlert':
            case 'ActivityFeedCommunityGiftSubscriptionAlert':
                // Initialize the common structure with default/missing values
                normalizedSubscriber = {
                    id: message.data.id,
                    createdAt: message.data.createdAt,
                    updatedAt: message.data.updatedAt,
                    displayName: null,
                    type: null,
                    message: null,
                    subscriptionDuration: null,
                    streakDuration: null,
                    totalGiftCount: null,
                    quantityPurchased: null,
                    tier: message.data.tier || 'T_1000', // Default tier
                };

                // Identify the message type and extract relevant data
                subscriberType = message.data.__typename;

                switch (subscriberType) {
                    case 'ActivityFeedCommunityGiftSubscriptionAlert':
                        normalizedSubscriber.displayName = message.data.gifter.displayName;
                        normalizedSubscriber.type = 'gift';
                        normalizedSubscriber.totalGiftCount = message.data.totalGiftCount;
                        normalizedSubscriber.quantityPurchased = message.data.quantity;
                        break;

                    case 'ActivityFeedResubscriptionAlert':
                        normalizedSubscriber.displayName = message.data.subscriber.displayName;
                        normalizedSubscriber.type = 'resub';
                        normalizedSubscriber.subscriptionDuration = message.data.totalDuration;
                        normalizedSubscriber.streakDuration = message.data.streakDuration;
                        break;

                    // @TODO This case has not yet been captured!  TEST TEST TEST!
                    case 'ActivityFeedSubscriptionAlert':
                        normalizedSubscriber.displayName = message.data.subscriber.displayName;
                        normalizedSubscriber.type = 'new';
                        normalizedSubscriber.subscriptionDuration = message.data.totalDuration;
                        normalizedSubscriber.streakDuration = message.data.streakDuration;
                        break;

                    case 'ActivityFeedPrimeSubscriptionAlert':
                        normalizedSubscriber.displayName = message.data.subscriber.displayName;
                        normalizedSubscriber.type = 'prime';
                        break;
                    // Add cases for other known or anticipated variants
                }

                if (message.data.messageContent && message.data.messageContent.fragments) {
                    normalizedSubscriber.message = message.data.messageContent.fragments
                        .map(fragment => fragment.text)
                        .join(' ');
                }

                twitchAlertsStore.addEvent({type: 'subscriber', data: normalizedSubscriber});

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

                twitchAlertsStore.addEvent({type: 'raid', data: parsedMessage.data});
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
