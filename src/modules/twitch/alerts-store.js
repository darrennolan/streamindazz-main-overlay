import React from 'react';
import { runInAction, makeObservable, observable } from 'mobx';

export class TwitchAlertsStoreClass {
    timeoutToClearInMs = 35 * 1000;

    _queue = [];
    _processing = false;

    _escapeTimeout = null;

    follower = null;
    raid = null;
    subscriber = null;

    constructor() {
        makeObservable(this, {
            follower: observable,
            raid: observable,
            subscriber: observable,
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

            setTimeout(() => {
                const event = this._queue.shift();

                this.handleEvent(event);
            });
        }
    }

    handleEvent(event) {
        switch (event.type) {
            case 'new-follower':
                runInAction(() => {
                    this._escapeTimeout = setTimeout(() => {
                        this.follower = null;
                        this._processing = false;
                        this.processNextEvent();

                        this._escapeTimeout = null;
                    }, this.timeoutToClearInMs);

                    this.follower = {
                        data: event.data,
                        callback: () => {
                            clearTimeout(this._escapeTimeout);

                            this.follower = null;
                            this._processing = false;
                            this.processNextEvent();
                        },
                    };
                });
                break;

            case 'raid':
                runInAction(() => {
                    this._escapeTimeout = setTimeout(() => {
                        this.raid = null;
                        this._processing = false;
                        this.processNextEvent();

                        this._escapeTimeout = null;
                    }, this.timeoutToClearInMs);

                    this.raid = {
                        data: event.data,
                        callback: () => {
                            clearTimeout(this._escapeTimeout);

                            this.raid = null;
                            this._processing = false;
                            this.processNextEvent();
                        },
                    };
                });
                break;

            case 'subscriber':
                console.log('Subscriber event:', event);

                runInAction(() => {
                    this._escapeTimeout = setTimeout(() => {
                        this.subscriber = null;
                        this._processing = false;
                        this.processNextEvent();

                        this._escapeTimeout = null;
                    }, this.timeoutToClearInMs);

                    this.subscriber = {
                        data: event.data,
                        callback: () => {
                            clearTimeout(this._escapeTimeout);

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
