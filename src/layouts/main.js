import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// import config from '../config';
import backgroundImage from '../images/dev-background.jpg';

import SpotifyNowPlaying from '../modules/spotify/now-playing';
import TwitchLoginIfNeeded from '../modules/twitch/login-if-needed';
import TwitchFollower from '../modules/twitch/follower';
import TwitchRaid from '../modules/twitch/raid';
import TwitchSubscriber from '../modules/twitch/subscribe';

const Container = styled.div`
    position: relative;
    width: 1920px;
    min-width: 1920px;
    max-width: 1920px;

    height: 1080px;
    min-height: 1080px;
    max-height: 1080px;
`;

const DevContainer = styled(Container)`
    border: dotted 5px green;
    background-color: black;
    // background-image: url('${backgroundImage}');
    background-size: cover;
`;

const PositionTwitchLoginIfNeeded = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const PositionTwitchFollower = styled.div``;
const PositionTwitchRaid = styled.div``;
const PositionTwitchSubscriber = styled.div``;

const PositionSpotifyNowPlaying = styled.div`
    position: absolute;
    right: 20px;
    bottom: 20px;
`;

// const StyledStreamerName = styled.p`
//     position: absolute;
//     right: 0px;
//     bottom: 0px;
//     color: ${config.themeBackgroundColor};
//     text-shadow: 2px 2px 2px ${config.themeForegroundShadowColor};
// `;

const MainLayout = ({
    config = {},
} = {}) => {
    const ContainerToUse = (config.useDeveloperScale && !window.obsstudio) ? DevContainer : Container;

    return (
        <ContainerToUse>
            <PositionTwitchLoginIfNeeded>
                <TwitchLoginIfNeeded twitchConfig={config.twitch} pusherConfig={config.pusher} />
            </PositionTwitchLoginIfNeeded>

            <PositionTwitchFollower>
                <TwitchFollower />
            </PositionTwitchFollower>

            <PositionTwitchSubscriber>
                <TwitchSubscriber twitchConfig={config.twitch} />
            </PositionTwitchSubscriber>

            <PositionTwitchRaid>
                <TwitchRaid />
            </PositionTwitchRaid>

            <PositionSpotifyNowPlaying>
                <SpotifyNowPlaying spotifyConfig={config.spotify} />
            </PositionSpotifyNowPlaying>

            {/* <StyledStreamerName>
                {config.streamerName}
            </StyledStreamerName> */}
        </ContainerToUse>
    );
};

MainLayout.propTypes = {
    config: PropTypes.object,
};

export default MainLayout;
