import { expect } from 'chai'; // Import the expect function from the testing framework

import { startWindowLocationMock, startLocalStorageMock } from '../utils/browser-mock';
import { TwitchAlertsStoreClass } from '../../src/modules/twitch/alerts-store';

describe('TwitchAlertsStore', () => {
    let twitchAlertsStore;
    let windowLocationMockCleanup;
    let windowLocalStorageMockCleanup;

    beforeEach(() => {
        windowLocationMockCleanup = startWindowLocationMock();
        windowLocalStorageMockCleanup = startLocalStorageMock();

        twitchAlertsStore = new TwitchAlertsStoreClass();
    });

    afterEach(() => {
        windowLocationMockCleanup();
        windowLocalStorageMockCleanup();
    });

    it('should add events to the queue', () => {
        const mockEvent = {
            /*... mock event data ...*/
        };

        twitchAlertsStore.addEvent(mockEvent);

        // Check that the event was added to the queue
        expect(twitchAlertsStore._queue).to.contain(mockEvent);
    });

    // Add more tests here...
});
