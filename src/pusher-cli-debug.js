// import {inspect} from 'node:util';
import Pusher from 'pusher';
import Prompt from 'prompt-sync';

import config from './config.js';

const prompt = Prompt({
    sigint: true,
    eot: true,
});

const pusher = new Pusher({
    appId: config.pusher.appId,
    key: config.pusher.key,
    secret: config.pusher.secret,
    cluster: config.pusher.cluster,
    useTLS: true,
});

function complete(commands) {
    return function (str) {
        var i;
        var ret = [];

        for (i=0; i< commands.length; i++) {
            if (commands[i].indexOf(str) == 0)
                ret.push(commands[i]);
        }

        return ret;
    };
}

const commands = [
    'follow',
    'follow2',
    'sub',
    'gift',
    'anonymous-gift',
    'cheer',
    'raid',
    'raid2',
    'raid3',
];

const action = prompt(
    `Enter the action: ${commands.map((command) => `"${command}"`).join(', ')}`,
    {
        autocomplete: complete(commands),
    },
);

switch (action) {
    case 'follow':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelFollow', {
            id: '123456',
            updatedAt: new Date().toISOString(),
            userDisplayName: 'StreamingDazz',
        });
        break;

    case 'follow2':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelFollow', {
            id: '654321',
            updatedAt: new Date().toISOString(),
            userDisplayName: 'CosyCalico',
        });
        break;


    case 'sub':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelSubscription', {
            cumulativeMonths: 9,
            duration: 2,
            gifterDisplayName: null,
            gifterId: null,
            gifterName: null,
            isAnonymous: false,
            isGift: false,
            isResub: true,
            message: {message:'stream965Heart yay more ad free watching!'},
            months: 9,
            streakMonths: 2,
            subPlan: 'Tier 1 fancy sub name',
            time: new Date().toISOString(),
            userDisplayName: 'StreamingDazz',
            userId: 12345,
            userName: 'streamingdazz',
        });
        break;

    case 'gift':
        // this pusher should be ignored, but is here for testing purposes
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelSubscription', {
            cumulativeMonths: 1,
            duration: 1,
            gifterDisplayName: 'StreamingDazz',
            gifterId: 5678,
            gifterName: 'streamingdazz',
            isAnonymous: false,
            isGift: true,
            isResub: false,
            message: null,
            months: 1,
            streakMonths: 1,
            subPlan: 'Tier 1 fancy sub name',
            time: new Date().toISOString(),
            userDisplayName: 'CosyCalico',
            userId: 12345,
            userName: 'cosycalico',
        });

        // This is the new eventsub implementation
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelSubscriptionGift', {
            isGift: true,
            isAnonymous: false,
            gifterId: 5678,
            gifterName: 'streamindazz',
            gifterDisplayName: 'StreamingDazz',

            tier: 2000,
            amount: 5,
            cumulativeAmount: 12,
        });
        break;

    case 'anonymous-gift':
        // this pusher should be ignored, but is here for testing purposes
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelSubscription', {
            cumulativeMonths: 1,
            duration: 1,
            gifterDisplayName: 'StreamingDazz',
            gifterId: 5678,
            gifterName: 'streamingdazz',
            isAnonymous: true,
            isGift: true,
            isResub: false,
            message: null,
            months: 1,
            streakMonths: 1,
            subPlan: 'Tier 1 fancy sub name',
            time: new Date().toISOString(),
            userDisplayName: 'CosyCalico',
            userId: 12345,
            userName: 'cosycalico',
        });

        // This is the new eventsub implementation
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelSubscriptionGift', {
            isGift: true,
            isAnonymous: true,
            gifterId: 12345,
            gifterName: 'cosycalico',
            gifterDisplayName: 'CosyCalico',

            tier: 1000,
            amount: 5,
            cumulativeAmount: null,
        });
        break;

    case 'cheer':

        break;

    case 'raid':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelRaidTo', {
            id: '123456',
            updatedAt: new Date().toISOString(),
            raidingBroadcasterDisplayName: 'StreamingDazz',
            viewers: 52,
        });
        break;

    case 'raid2':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelRaidTo', {
            id: '1234567',
            updatedAt: new Date().toISOString(),
            raidingBroadcasterDisplayName: 'CosyCalico',
            viewers: 112,
        });
        break;

    case 'raid3':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelRaidTo', {
            id: '12345678',
            updatedAt: new Date().toISOString(),
            raidingBroadcasterDisplayName: 'Miss_Laney_Ous',
            viewers: 35000,
        });
        break;

    default:
        console.error('Invalid action');
        break;
}
