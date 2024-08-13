import Pusher from 'pusher-js';
import {PubSubClient} from '@twurple/pubsub';
import {ApiClient} from '@twurple/api';
import {EventSubWsListener} from '@twurple/eventsub-ws';


import getAuthenticationSingleton from './authentication';
import {twitchAlertsStore} from './alerts-store';

let webSocketServicesSingleton = null;

export class WebSocketServices {
    _twitchAuthentication = null;
    _twitchConfig = null;
    _userId = null;
    _login = null;

    // twurple stuffz
    _apiClient = null;
    _eventSubClient = null;
    _pubSubClient = null;

    // debugger stuff from pusher.com
    _pusherClient = null;
    _pusherChannel = null;

    connected = false;

    constructor({twitchConfig, pusherConfig}) {
        this._twitchConfig = twitchConfig;
        this._pusherConfig = pusherConfig;
        this._twitchAuthentication = getAuthenticationSingleton(twitchConfig);
    }

    async connect() {
        if (this.connected) {
            return;
        }

        this.connected = true;

        const firstAccessToken = await this._twitchAuthentication.getAccessToken();

        if (!firstAccessToken) {
            console.error('WebsocketServices: No access token');

            return;
        }

        this._userId = this._twitchAuthentication.userId;
        this._login = this._twitchAuthentication.login;

        const twurpleAuthProvider = {
            authorizationType: 'Bearer',
            clientId: this._twitchConfig.clientId,
            getAccessTokenForIntent: async (intent, scopeSets) => console.error('getAccessTokenForIntent', intent, scopeSets),
            getAccessTokenForUser: async (/*user, scopeSets*/) => this._twitchAuthentication.getTwurpleAccessToken(),
            getAnyAccessToken: async (/*user*/) => this._twitchAuthentication.getTwurpleAccessToken(),
            getAppAccessToken: async (forceNew) => console.error('getAppAccessToken', forceNew),
            getCurrentScopesForUser: (/*user*/) => this._twitchAuthentication.getScopes(),
            refreshAccessTokenForIntent: async (intent) => console.error('refreshAccessTokenForIntent', intent),
            refreshAccessTokenForUser: (user) => console.error('refreshAccessTokenForUser', user),
        };

        this._apiClient = new ApiClient({authProvider: twurpleAuthProvider});
        this._eventSubClient = new EventSubWsListener({apiClient: this._apiClient});
        this._eventSubClient.start();

        this._pubSubClient = new PubSubClient({authProvider: twurpleAuthProvider});

        this._pusherClient = this.pusher = new Pusher(this._pusherConfig.key, {
            cluster: this._pusherConfig.cluster,
            useTLS: true,
        });
        this._pusherChannel = this._pusherClient.subscribe(`streamer-${this._userId}`);

        // Follower
        this._eventSubClient.onChannelFollow(this._userId, this._userId, (event) => {
            console.log('EventSub onChannelFollow', event);
            twitchAlertsStore.addEvent({
                type: 'new-follower',
                data: {
                    id: event.userId,
                    updatedAt: event.followDate.toISOString(),
                    displayName: event.userDisplayName,
                },
            });
        });
        this._pusherChannel.bind('onChannelFollow', (event) => {
            console.log('Pusher onChannelFollow', event);
            twitchAlertsStore.addEvent({
                type: 'new-follower',
                data: {
                    id: event.userId,
                    updatedAt: event.followDate, // already a string.
                    displayName: event.userDisplayName,
                },
            });
        });

        // Raid
        this._eventSubClient.onChannelRaidTo(this._userId, (event) => {
            console.log('EventSub onChannelRaidTo', event);
            twitchAlertsStore.addEvent({
                type: 'raid',
                data: {
                    id: event.raidingBroadcasterId,
                    updatedAt: new Date().toISOString(),
                    displayName: event.raidingBroadcasterDisplayName,
                    viewers: event.viewers,
                },
            });
        });
        this._pusherChannel.bind('onChannelRaidTo', (event) => {
            console.log('Pusher onChannelRaidTo', event);
            twitchAlertsStore.addEvent({
                type: 'raid',
                data: {
                    id: event.raidingBroadcasterId,
                    updatedAt: new Date().toISOString(),
                    displayName: event.raidingBroadcasterDisplayName,
                    viewers: event.viewers,
                },
            });
        });

        // Subscriptions
        this._eventSubClient.onChannelSubscriptionGift(this._userId, (event) => {
            console.log('EventSub onChannelSubscriptionGift', event);
            twitchAlertsStore.addEvent({
                type: 'subscriber',
                data: {
                    isGift: true,
                    isAnonymous: event.isAnonymous,
                    time: new Date(), // just base the event as 'now'.  EventSub doesn't seem to have a time but we use it for uniqueness in react.
                    userId: event.gifterId,
                    gifterId: event.gifterId,
                    gifterName: event.gifterName,
                    gifterDisplayName: event.gifterDisplayName,

                    tier: event.tier,
                    amount: event.amount,
                    cumulativeAmount: event.cumulativeAmount,
                },
            });
        });
        this._pusherChannel.bind('onChannelSubscriptionGift', (event) => {
            console.log('Pusher onChannelSubscriptionGift', event);
            twitchAlertsStore.addEvent({
                type: 'subscriber',
                data: {
                    isGift: true,
                    isAnonymous: event.isAnonymous,
                    time: new Date(), // just base the event as 'now'.  EventSub doesn't seem to have a time but we use it for uniqueness in react.
                    userId: event.gifterId,
                    gifterId: event.gifterId,
                    gifterName: event.gifterName,
                    gifterDisplayName: event.gifterDisplayName,

                    tier: event.tier,
                    amount: event.amount,
                    cumulativeAmount: event.cumulativeAmount,
                },
            });
        });

        this._pubSubClient.onSubscription(this._userId, (event) => {
            if (event.isGift) {
                console.log('GIFT IGNORED PubSub onSubscription', event);
            } else {
                console.log('PubSub onSubscription', event);
                twitchAlertsStore.addEvent({
                    type: 'subscriber',
                    data: {
                        cumulativeMonths: event.cumulativeMonths,
                        duration: event.duration,
                        gifterDisplayName: event.gifterDisplayName,
                        gifterId: event.gifterId,
                        gifterName: event.gifterName,
                        isAnonymous: event.isAnonymous,
                        isGift: event.isGift,
                        isResub: event.isResub,
                        message: event.message,
                        // months: event.months,
                        streakMonths: event.streakMonths,
                        subPlan: event.subPlan,
                        time: event.time,
                        userId: event.userId,
                        userName: event.userName,
                        userDisplayName: event.userDisplayName,
                    },
                });
            }
        });
        this._pusherChannel.bind('onChannelSubscription', (event) => {
            if (event.isGift) {
                console.log('GIFT IGNORED PubSub onSubscription', event);
            } else {
                console.log('Pusher onChannelSubscription', event);
                twitchAlertsStore.addEvent({
                    type: 'subscriber',
                    data: {
                        cumulativeMonths: event.cumulativeMonths,
                        duration: event.duration,
                        gifterDisplayName: event.gifterDisplayName,
                        gifterId: event.gifterId,
                        gifterName: event.gifterName,
                        isAnonymous: event.isAnonymous,
                        isGift: event.isGift,
                        isResub: event.isResub,
                        message: event.message,
                        // months: event.months,
                        streakMonths: event.streakMonths,
                        subPlan: event.subPlan,
                        time: new Date(event.time),
                        userId: event.userId,
                        userName: event.userName,
                        userDisplayName: event.userDisplayName,
                    },
                });
            }
        });

        // Cheers
        this._eventSubClient.onChannelCheer(this._userId, (event) => {
            console.log('EventSub onChannelCheer', event);
            twitchAlertsStore.addEvent({
                type: 'cheer',
                data: {
                    userId: event.userId,
                    userName: event.userName,
                    userDisplayName: event.userDisplayName,
                    bits: event.bits,
                    message: event.message,
                },
            });
        });
        this._pusherChannel.bind('onChannelCheer', (event) => {
            console.log('Pusher onChannelCheer', event);
            twitchAlertsStore.addEvent({
                type: 'cheer',
                data: {
                    userId: event.userId,
                    userName: event.userName,
                    userDisplayName: event.userDisplayName,
                    bits: event.bits,
                    message: event.message,
                },
            });
        });

        window.test = () => {
            console.log('Window Test onChannelCheer', event);
            twitchAlertsStore.addEvent({
                type: 'cheer',
                data: {
                    userId: 12345,
                    userName: 'streamindazz',
                    userDisplayName: 'streaminDazz',
                    bits: 1,
                    message: 'yo man sup',
                },
            });
        };
    }
}

export default function getWebSocketServices({twitchConfig, pusherConfig}) {
    if (!webSocketServicesSingleton) {
        webSocketServicesSingleton = new WebSocketServices({twitchConfig, pusherConfig});
    }

    return webSocketServicesSingleton;
}
