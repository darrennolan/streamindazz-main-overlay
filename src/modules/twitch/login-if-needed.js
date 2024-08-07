import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import getTwitchAuthentication from './authentication';

import getWebSocketServices from './websocket-services';

const LoginButton = styled.button`
  background-color: #6441A4; /* twitch purple */
  padding: 10px;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
`;

const LoginIfNeeded = ({twitchConfig, pusherConfig}) => {
    const twitchAuthentication = getTwitchAuthentication(twitchConfig);
    const webSocketServices = getWebSocketServices({twitchConfig, pusherConfig});

    // const webSocketService = new WebSocketService({twitchConfig});
    // const pubSubService = new PubSubService({twitchConfig});

    const [hasRunOnce, setHasRunOnce] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    async function checkAuthentication() {
        const accessToken = await twitchAuthentication.getAccessToken();

        setIsLoggedIn(!!accessToken);
        setHasRunOnce(true);

        if (accessToken) {
            webSocketServices.connect();
            // webSocketService.connect();
            // pubSubService.connect();
        }

        return !!accessToken;
    }

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const isAuthed = await checkAuthentication();

            if (isAuthed) {
                clearTimeout(timeoutId);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        twitchAuthentication.redirectToAuthorize();
    };

    if (!hasRunOnce) {
        return null;
    }

    return (
        <div>
            {!isLoggedIn && (
                <LoginButton onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? 'Wait...' : 'Login with Twitch'}
                </LoginButton>
            )}
        </div>
    );
};

LoginIfNeeded.propTypes = {
    twitchConfig: PropTypes.object.isRequired,
    pusherConfig: PropTypes.object.isRequired,
};

export default LoginIfNeeded;
