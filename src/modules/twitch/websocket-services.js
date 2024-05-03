import PubSubService from './pubsub-service';
import PusherService from './pusher-service';

let webSocketServicesSingleton = null;

export class WebSocketServices {
    _queue = [];
    _processing = false;
    _twitchEventSubSocket = null;
    _pusherSocket = null;

    constructor({twitchConfig, pusherConfig}) {
        this._twitchEventSubSocket = new PubSubService(twitchConfig);
        this._pusherSocket = new PusherService(pusherConfig);

        this._twitchEventSubSocket.pushEvent = this._pushEvent.bind(this);
        this._pusherSocket.pushEvent = this._pushEvent.bind(this);
    }

    pushEvent(event) {
        this._queue.push(event);
        this._processQueue();
    }
}

export default function getWebSocketServices({twitchConfig, pusherConfig}) {
    if (!WebSocketServices) {
        webSocketServicesSingleton = new WebSocketServices({twitchConfig, pusherConfig});
    }

    return webSocketServicesSingleton;
}
