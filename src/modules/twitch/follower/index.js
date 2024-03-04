import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';

import soundWhoosh from '../../../sounds/whoosh/whoosh.mp3';

const slideInLeft = keyframes`
    0% { transform: translateX(-150%); }
    100% { transform: translateX(0); }
`;

const slideInRight = keyframes`
    0% { transform: translateX(150%); }
    100% { transform: translateX(0); }
`;

const slideOutLeft = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(-150%); }
`;

const slideOutRight = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(200%); }
`;

const FollowerContainer = styled.div`
    position: absolute;
    top: 50%;
    height: 20%;

    left: 0;
    width: 100%;
    left: -22%;  /* Adjust as needed */
    width: 120%;  /* Adjust as needed */
    transform: translateY(-50%) perspective(1000px) rotateY(-20deg) rotateX(20deg);
`;

const StripBackground = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(211, 211, 211, 0.8);

    animation: ${slideInLeft} 0.25s forwards, ${slideOutLeft} 0.25s 5.25s forwards;
`;

const StripColor = styled.div`
    position: absolute;
    top: 5%;
    width: 100%;
    height: 85%;
    background: linear-gradient(to right, rgba(255, 0, 0, 0.8), rgba(255, 255, 0, 0.8));

    animation: ${slideInRight} 0.25s forwards, ${slideOutRight} 0.25s 5.25s forwards;
`;

const TextContainer = styled.div`
    background: rgba(0, 0, 0, 1);
    text-align: center;
    top: 5%;
    left: 40%;
    height: 85%;
    transform: translate(-50%, -50%);
    font-size: 40px;
    font-weight: bold;
    position: absolute;
    padding: 20px 80px;

    animation: ${slideInRight} 0.25s forwards, ${slideOutRight} 0.25s 5.25s forwards;
`;

const Text = styled.div`
    color: black;
    -webkit-text-fill-color: transparent;
    background: radial-gradient(circle at 80% center, rgba(255, 255, 255, 1) 5%, rgba(255, 255, 0, 1) 30%, rgba(255, 140, 0, 1));
    -webkit-background-clip: text;
    background-clip: text;
`;
const TextUsername = styled.span`
    font-size: 80px;
`;

const TwitchFollowers = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const [animationEnded, setAnimationEnded] = useState(false);
    const audioWhoosh = new Audio(soundWhoosh);

    const onAnimationStart = (e) => {
        if (e.animationName === slideInLeft.name || e.animationName === slideOutRight.name) {
            audioWhoosh.playbackRate = 2;
            audioWhoosh.play();
        }
    };

    const onAnimationEnd = (e) => {
        if (e.animationName === slideInLeft.name) {
            // read out follower name + text
            const utterance = new SpeechSynthesisUtterance(`New Follower! ${twitchAlertsContext.follower.data.displayName}!`);
            const voices = speechSynthesis.getVoices();

            // Preferred voice URIs
            const preferredURIs = [
                'Google UK English Male',
                'Microsoft David - English (United States)',
                'Google US English',
                'Google UK English Female',
            ];

            // Find a voice that matches a preferred URI
            utterance.voice = voices
                .filter(voice => preferredURIs.includes(voice.voiceURI))
                .sort((a, b) => {
                    const indexA = preferredURIs.indexOf(a.voiceURI);
                    const indexB = preferredURIs.indexOf(b.voiceURI);

                    if (indexA === -1 && indexB === -1) {
                        return 0;
                    } else if (indexA === -1) {
                        return 1;
                    } else if (indexB === -1) {
                        return -1;
                    } else {
                        return indexA - indexB;
                    }
                })[0] || voices[0];

            utterance.volume = 1; // Set volume
            utterance.rate = 1.0; // Set speed
            speechSynthesis.speak(utterance);
        }

        if (e.animationName === slideOutRight.name) {
            setAnimationEnded(true);
        }
    };

    useEffect(() => {
        if (animationEnded) {
            setAnimationEnded(false);
            twitchAlertsContext.follower.callback();
        }
    }, [animationEnded]);

    if (!twitchAlertsContext.follower) {
        return null;
    }

    return (
        <FollowerContainer key={twitchAlertsContext.follower.data.displayName} onAnimationStart={onAnimationStart} onAnimationEnd={onAnimationEnd}>
            <StripBackground />
            <StripColor />
            <TextContainer>
                <Text>
                    NEW FOLLOWER!<br />
                    <TextUsername>{twitchAlertsContext.follower.data.displayName}</TextUsername>
                </Text>
            </TextContainer>
        </FollowerContainer>
    );
});

export default TwitchFollowers;
