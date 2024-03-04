import getAuthenticationSingleton from './authentication';
import {followerStore} from './alerts-store';

export default class WebSocketService {
    queue = [];
    processing = false;
    ws = null;
    twitchConfig = null;

    constructor({twitchConfig}) {
        this.queue = [];
        this.processing = false;
        this.twitchConfig = twitchConfig;
        this.authentication = getAuthenticationSingleton(this.twitchConfig)
    }

    async connect() {
        return;

        // const accessToken = await this.authentication.getAccessToken();

        // if (accessToken) {
        //     this.ws = new WebSocket(`wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30&token=${accessToken}`);
        //     this.ws.onmessage = this.handleMessage.bind(this);

        //     return true;
        // } else {
        //     return false;
        // }

    }

    handleMessage(event) {
        const message = JSON.parse(event.data);

        if (message.metadata.message_type === 'session_keepalive') {
            console.info('WebSocket connection is still alive');

            return;
        }

        console.info('Received message:', message);

        switch (message.metadata.message_type) {
            case 'session_welcome':
                /* Example session_welcome message:
                {
                    "metadata": {
                        "message_id": "8e96422b-3225-49ff-bbe5-63edb65660cf",
                        "message_type": "session_welcome",
                        "message_timestamp": "2024-03-03T12:40:50.20129611Z"
                    },
                    "payload": {
                        "session": {
                            "id": "AgoQhf2L10xgQpqgGSo5ICzyeBIGY2VsbC1h",
                            "status": "connected",
                            "connected_at": "2024-03-03T12:40:50.192536676Z",
                            "keepalive_timeout_seconds": 30,
                            "reconnect_url": null
                        }
                    }
                } */
                // Store the session ID
                this.sessionId = message.payload.session.id;
                this.subscribeToChannels();
                break;

            case 'ping':
                this.sendPong();
                break;

            case 'follower':
                this.queue.push(event);
                this.processEvents();
                break;

            default:
                console.error('Unhandled message:', message);
                break;
        }
    }

    async subscribeToChannels() {
        const accessToken = await this.authentication.getAccessToken();

        // Use fetch to send a POST request to the Twitch API
        const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Client-Id': this.twitchConfig.clientId,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'channel.follow',
                version: '2',
                condition: {
                    broadcaster_user_id: this.authentication.userId,
                    moderator_user_id: this.authentication.userId,
                },
                transport: {
                    session_id: this.sessionId,
                    method: 'websocket',
                },
            }),
        });

        // Check the response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    sendPong() {
        // Respond to a ping message with a pong message to keep the connection alive
        const message = {
            type: 'pong',
        };

        this.ws.send(JSON.stringify(message));
    }

    processEvents() {
        if (!this.processing && this.queue.length > 0) {
            this.processing = true;
            const event = this.queue.shift();

            followerStore.handleEvent(event, this.markEventAsProcessed.bind(this));
        }
    }

    markEventAsProcessed() {
        this.processing = false;
        this.processEvents();
    }
}
