import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { TwitchAlertsContext, twitchAlertsStore } from './modules/twitch/alerts-store';
import developerScale from './utilities/developer-scale';
import MainLayout from './layouts/main';

import config from './config';

const root = createRoot(document.getElementById('app'));

const bootApp = () => {
    root.render((
        <TwitchAlertsContext.Provider value={twitchAlertsStore}>
            <Router>
                <Routes>
                    <Route path="/" element={<MainLayout config={config} />} />
                    {/* Define more routes here */}
                    {/* Example: <Route path="about" element={<About />} /> */}
                    {/* Example: <Route path="contact" element={<Contact />} /> */}
                </Routes>
            </Router>
        </TwitchAlertsContext.Provider>
    ));
};

developerScale();
bootApp();

if (config.newRelicSnippet) {
    const scriptElement = document.createElement('script');

    scriptElement.type = 'text/javascript';
    scriptElement.text = config.newRelicSnippet;

    // Append the script element to the document body to execute it
    document.body.appendChild(scriptElement);

} else {
    console.warn('no new relic happening');
}
