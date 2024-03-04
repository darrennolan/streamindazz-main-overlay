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

window.speechSynthesis.onvoiceschanged = function() {
    // after voices are loaded, we'll boot the app
    developerScale();
    bootApp();
};

new SpeechSynthesisUtterance(`Loading voices on page boot`); // don't stress, we don't ask it to talk.
