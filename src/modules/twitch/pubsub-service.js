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
                    console.log('adding', name);
                    twitchAlertsStore.addEvent({type: 'new-follower', data: {displayName: name}});

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

            default:
                console.error('Unhandled message:', message);
                break;
        }
    } // eo handleMessage
}
