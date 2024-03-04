import React from 'react';
import { runInAction, makeAutoObservable } from 'mobx';

class TwitchAlertsStore {
    follower = null;

    constructor() {
        makeAutoObservable(this);
    }

    // In your FollowerStore
    handleEvent(event, callback) {
        switch (event.type) {
            case 'new-follower':
                this.follower = event.data;
                this.callback = () => {
                    runInAction(() => {
                        this.follower = null;
                        callback();
                    });
                };


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
