import Pusher from 'pusher-js';

export default class PusherService {
    pusher = null;

    constructor({pusherConfig, streamerName}) {
        this.pusher = new Pusher({
            key: pusherConfig.key,
            cluster: pusherConfig.cluster,
            useTLS: true,
        });
    }
}
