import React from 'react';
import { makeAutoObservable } from 'mobx';

class TwitchAlertsStore {
    follower = null;

    constructor() {
        makeAutoObservable(this);
    }

    // In your FollowerStore
    handleEvent(event, callback) {
        this.callback = callback;

        switch (event.type) {
            case 'new-follower':
                this.follower = event.data;


                break;
            // Add more cases here for other event types
            default:
                console.error('Unhandled event type:', event.type);
                break;
        }
    }
}

export const twitchAlertsStore = new TwitchAlertsStore();
export const TwitchAlertsContext = React.createContext(twitchAlertsStore);
