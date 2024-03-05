import { expect } from 'chai'; // Import the expect function from the testing framework
import { WebSocketMock } from 'jest-websocket-mock';

import { startWindowLocationMock, startLocalStorageMock } from '../utils/browser-mock';
import PubSubService from '../../src/modules/twitch/pubsub-service';
import { TwitchAlertsStoreClass } from '../../src/modules/twitch/alerts-store';

describe('PubSubService', () => {
    let pubSubService;
    let twitchAlertsStore;
    let windowLocationMockCleanup;
    let windowLocalStorageMockCleanup;

    beforeEach(() => {
        windowLocationMockCleanup = startWindowLocationMock();
        windowLocalStorageMockCleanup = startLocalStorageMock();

        twitchAlertsStore = new TwitchAlertsStoreClass();
        pubSubService = new PubSubService({ twitchConfig: {} });
        pubSubService.twitchAlertsStore = twitchAlertsStore; // Assuming you can set this directly
    });

    afterEach(() => {
        windowLocationMockCleanup();
        windowLocalStorageMockCleanup();
    });

    it('should handle incoming messages correctly', () => {
        const mockEvent ={
            type: 'activity_feed_alerts_update',
            data: {
                __typename: 'ActivityFeedFollowAlert',
                id: 'FOLLOW:63c9f63e-14ca-4f2f-b281-2ef6a99c4612',
                status: 'QUEUED',
                createdAt: '2024-02-29T00:39:03.582913311Z',
                updatedAt: '2024-03-03T13:35:28.89972706Z',
                follower: {
                    __typename: 'User',
                    id: '1010958187',
                    displayName: 'frey_wenye34',
                    login: 'frey_wenye34',
                },
            },
        };

        pubSubService.handleMessage(mockEvent);

        // Check that the event was added to the alerts store
        expect(twitchAlertsStore._queue).to.contain(mockEvent);
    });

    // Add more tests here...
});

