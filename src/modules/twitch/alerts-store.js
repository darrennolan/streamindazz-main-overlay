import React from 'react';
import { runInAction, makeObservable, observable } from 'mobx';

export class TwitchAlertsStoreClass {
    _queue = [];
    _processing = false;

    follower = null;
    raid = null;
    subscriber = null;

    constructor() {
        makeObservable(this, {
            follower: observable,
            raid: observable,
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

            case 'raid':
                runInAction(() => {
                    this.raid = {
                        data: event.data,
                        callback: () => {
                            this.raid = null;
                            this._processing = false;
                            this.processNextEvent();
                        },
                    };
                });
                break;

            case 'subscriber':
                runInAction(() => {
                    this.subscriber = {
                        data: event.data,
                        callback: () => {
                            this.subscriber = null;
                            this._processing = false;
                            this.processNextEvent();
                        },
                    };
                });
                break;

            default:
                console.error('Unhandled event type:', event.type);
                break;
        }
    }
}

export const twitchAlertsStore = new TwitchAlertsStoreClass();
export const TwitchAlertsContext = React.createContext(twitchAlertsStore);
