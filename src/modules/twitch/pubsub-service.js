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
                follower: (name = 'xSuperSandLegend') => {
                    this.queue.push({type: 'new-follower', data: {displayName: name}});
                    this.processEvents();
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

    async handleMessage(event) {
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
        const data = message?.data?.message && JSON.parse(message?.data?.message);

        console.info('PubSub message:', message);

        switch (topic) {
            case `activity-feed-alerts-v2.${this.userId}`:
                // If we see a queue message, add it to the queue, ignore the rest
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
                if (data.status === 'QUEUED') {
                    console.info(`Received activity-feed-alerts-v2.${this.userId} message:`, message);

                    this.queue.push({type: 'new-follower', data: data.follower});
                    this.processEvents();
                }

                break;

            default:
                console.error('Unhandled message:', message);
                break;
        }
    }

    sendPing() {
        // Respond to a ping message with a pong message to keep the connection alive
        const message = {
            type: 'PING',
        };

        this.ws.send(JSON.stringify(message));
    }

    processEvents() {
        if (!this.processing && this.queue.length > 0) {
            const event = this.queue.shift();

            this.processing = true;

            twitchAlertsStore.handleEvent(event, () => {
                this.processing = false;
                this.processEvents();
            });
        }
    }
}
