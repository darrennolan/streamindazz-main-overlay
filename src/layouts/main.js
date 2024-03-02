import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import config from '../config';
import backgroundImage from '../images/dev-background.jpg';

import SpotifyNowPlaying from '../modules/spotify/now-playing';

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
    background-image: url('${backgroundImage}');
    background-size: cover;
`;

const PositionSpotifyNowPlaying = styled.div`
    position: absolute;
    right: 20px;
    bottom: 20px;
`;

const StyledStreamerName = styled.p`
    position: absolute;
    right: 0px;
    bottom: 0px;
    color: ${config.themeBackgroundColor};
    text-shadow: 2px 2px 2px ${config.themeForegroundShadowColor};
`;

const MainLayout = ({
    config = {},
} = {}) => {
    const ContainerToUse = config.useDeveloperScale ? DevContainer : Container;

    return (
        <ContainerToUse>
            <PositionSpotifyNowPlaying>
                <SpotifyNowPlaying spotifyConfig={config.spotifyNowPlaying} />
            </PositionSpotifyNowPlaying>

            <StyledStreamerName>
                {config.streamerName}
            </StyledStreamerName>
        </ContainerToUse>
    );
};

MainLayout.propTypes = {
    config: PropTypes.object,
};

export default MainLayout;
