import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import getSpotifyAuthentication from '../authentication';
import MusicInfo from './music-info';

const SpotifyNowPlayingContainer = styled.div`
    overflow: hidden;
`;

const LoginButton = styled.button`
  background-color: #1DB954; /* spotify green */
  padding: 10px;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
`;

function SpotifyNowPlaying({spotifyConfig}) {
    const spotifyAuthentication = getSpotifyAuthentication(spotifyConfig);

    const [spotifyCurrentlyPlayingData, setSpotifyCurrentlyPlayingData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    useEffect(() => {
        // Define a function to check authentication and fetch time
        const getAccessCodeAndFetchNowPlaying = async () => {
            const accessToken = await spotifyAuthentication.getAccessToken();

            setIsLoggedIn(!!accessToken);

            if (accessToken) {
                await fetchNowPlaying(accessToken);
            }
        };

        // Immediately invoke the check, then set it to repeat every 10 seconds
        getAccessCodeAndFetchNowPlaying();
        const intervalId = setInterval(getAccessCodeAndFetchNowPlaying, 60 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const fetchNowPlaying = async (accessToken) => {
        let response, responseData;

        try {
            response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {Authorization: `Bearer ${accessToken}`},
            });

            // no content. Aka, nothing playing.
            if (response.status === 204) {
                setSpotifyCurrentlyPlayingData({});

            } else if (response.status === 401) {
                // Likely access code has expired. Log user out and let them sign back in.
                console.warn('Spotify 401 response:', response);

                spotifyAuthentication.logout();
                setIsLoggedIn(false);
            } else {
                responseData = await response.json();

                if (responseData.is_playing) {
                    setSpotifyCurrentlyPlayingData({
                        albumArtUrl: responseData.item.album.images[0].url,
                        artist: responseData.item.artists.map(artist => artist.name).join(', '),
                        track: responseData.item.name,
                    });
                } else {
                    setSpotifyCurrentlyPlayingData({});
                }
            }

        } catch (error) {
            console.error('Error fetching now playing:', {error, response, responseData});
            setIsLoggedIn(false);
        }
    };

    const handleLogin = () => {
        setIsLoading(true);
        spotifyAuthentication.redirectToAuthorize();
    };

    return (
        <SpotifyNowPlayingContainer>
            {isLoggedIn ? (
                <MusicInfo {...spotifyCurrentlyPlayingData} />
            ) : (
                <LoginButton onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? 'Wait...' : 'Login to Spotify'}
                </LoginButton>
            )}
        </SpotifyNowPlayingContainer>
    );
}

SpotifyNowPlaying.propTypes = {
    spotifyConfig: PropTypes.object,
};

export default SpotifyNowPlaying;
