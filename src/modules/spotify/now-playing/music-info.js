import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import config from '../../../config';

const fadeInAndOut = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  4% { transform: translateX(90%); opacity: 1; }
  8% { transform: translateX(2%); opacity: 1; }
  10% { transform: translateX(0%); opacity: 1; }
  90% { transform: translateX(0%); opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const MusicInfoContainer = styled.div`
    display: flex;
    align-items: center;
    width: 400px;
    animation: ${fadeInAndOut} 10s forwards;
`;

const AlbumArt = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 10px;
`;

const MusicDetails = styled.div`
    background-color: ${config.themeBackgroundColor};
    color: ${config.themeForegroundColor};
    text-shadow: 2px 2px 2px ${config.themeForegroundShadowColor};
    transform-origin: 50% 50%;
    padding: 10px 0 10px 0;
    border-radius: 0 10px 10px 0;
    width: 100%;
    text-overflow: ellipsis;
    * {
        padding: 0 20px 0 20px;
    }
`;

const MusicInfo = ({ albumArtUrl, artist, track }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();

        img.onload = () => setImageLoaded(true);
        img.src = albumArtUrl;
    }, [albumArtUrl]);

    if (!imageLoaded) {
        return null;
    }

    // Generate a unique key based on the props
    const key = `${albumArtUrl}-${artist}-${track}`;

    return (
        <MusicInfoContainer key={key}>
            <AlbumArt src={albumArtUrl} alt="Album Art" />
            <MusicDetails>
                <h4>{track}</h4>
                <p>{artist}</p>
            </MusicDetails>
        </MusicInfoContainer>
    );
};

MusicInfo.propTypes = {
    albumArtUrl: PropTypes.string,
    artist: PropTypes.string,
    track: PropTypes.string,
};

export default MusicInfo;
