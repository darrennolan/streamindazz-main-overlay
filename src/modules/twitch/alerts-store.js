import React from 'react';
import { runInAction, makeObservable, observable } from 'mobx';

class TwitchAlertsStore {
    _queue = [];
    _processing = false;

    follower = null;

    constructor() {
        makeObservable(this, {
            follower: observable,
        });
    }

    addEvent(event) {
        this._queue.push(event);

        // If not currently processing an event, start processing
        if (!this._processing) {
            this.processNextEvent();
        }
    }

    processNextEvent() {
        if (this._queue.length > 0) {
            this._processing = true;
            const event = this._queue.shift();

            this.handleEvent(event);
        }
    }

    handleEvent(event) {
        switch (event.type) {
            case 'new-follower':
                runInAction(() => {
                    this.follower = {
                        data: event.data,
                        callback: () => {
                            this.follower = null;
                            this._processing = false;
                            this.processNextEvent();
                        },
                    };
                });
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
