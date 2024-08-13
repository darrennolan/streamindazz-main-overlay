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
    'cheer',
    'cheer100',
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
            userDisplayName: 'StreaminDazz',
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
            userDisplayName: 'StreaminDazz',
            userId: 12345,
            userName: 'streamindazz',
        });
        break;

    case 'gift':
        // this pusher should be ignored, but is here for testing purposes
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelSubscription', {
            cumulativeMonths: 1,
            duration: 1,
            gifterDisplayName: 'StreaminDazz',
            gifterId: 5678,
            gifterName: 'streamindazz',
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
            gifterDisplayName: 'StreaminDazz',

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
            gifterDisplayName: 'StreaminDazz',
            gifterId: 5678,
            gifterName: 'streamindazz',
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

    case 'raid':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelRaidTo', {
            id: '123456',
            updatedAt: new Date().toISOString(),
            raidingBroadcasterDisplayName: 'StreaminDazz',
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

    case 'cheer':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelCheer', {
            id: '123456',
            updatedAt: new Date().toISOString(),
            userDisplayName: 'StreaminDazz',
            bits: 1,
            message: 'ralph is the best!',
        });
        break;

    case 'cheer100':
        pusher.trigger(`streamer-${config.pusher.twitchUserId}`, 'onChannelCheer', {
            id: '123456',
            updatedAt: new Date().toISOString(),
            userDisplayName: 'StreaminDazz',
            bits: 100,
            message: 'ralph is the bestest!',
        });
        break;

    default:
        console.error('Invalid action');
        break;
}
