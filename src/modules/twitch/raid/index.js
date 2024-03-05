import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import numeral from 'numeral';

import { TwitchAlertsContext } from '../alerts-store';

import terminatorImage from '../../../images/terminator/terminator.png';
import terminatorSound from '../../../sounds/terminator/the-terminator-2.mp3';

const terminatorBounceUpAndDown = keyframes`
    0% {
        transform: translateY(0);
        animation-timing-function: ease-out;
    }
    25% {
        transform: translateY(-28px);
        animation-timing-function: ease-in;
    }
    50% {
        transform: translateY(0);
        animation-timing-function: ease-out;
    }
    75% {
        transform: translateY(-8px);
        animation-timing-function: ease-in;
    }
    100% {
        transform: translateY(0);
        animation-timing-function: ease-out;
    }
`;

const slideUpFromTop = keyframes`
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(-150%);
    }
`;

const slideDownFromTop = keyframes`
    0% {
        transform: translateY(-150%);
    }
    100% {
        transform: translateY(0);
    }
`;

const slideInFromRight = keyframes`
    0% {
        transform: translateX(0%);
    }
    100% {
        transform: translateX(-250%);
    }
`;

const RaidContainer = styled.div`
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
`;

const Terminators = styled.div`
    position: absolute;
    left: 0;
    margin-left: 200vw;
    padding-left: 480px;
    bottom: 0;
    height: 40%;
    width: max-content;
    overflow: hidden;

    animation: ${slideInFromRight} ${props => props.$animationLengthInSeconds + 3}s linear both;
`;

const TerminatorImg = styled.img`
    margin-top: 28px;
    margin-left: -${props => props.$randomLeftOffset}px;
    z-index: ${props => props.$randomZIndex};

    animation: ${terminatorBounceUpAndDown} ${props => props.$randomBounceSpeed}s infinite;
`;

const TextContainer = styled.div`
    position absolute;
    top: 0;
    margin-top: 5%;
    width: 100%;
    font-size: 40px;

    font-family: 'Orbitron', sans-serif;
    color: white;
    text-align: center;
    text-shadow:
        -1px -1px 0 #ff0000,
        1px -1px 0 #ff0000,
        -1px 1px 0 #ff0000,
        1px 1px 0 #ff0000;

    animation: ${slideDownFromTop} 1s forwards, ${slideUpFromTop} 1s ${props => props.$animationLengthInSeconds + 3}s forwards;
`;

const TextUsername = styled.span`
    font-size: 80px;
`;


const TwitchRaid = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const [animationEnded, setAnimationEnded] = useState(false);
    const everythingDone = false;

    let audioContext, gainNode, source;

    // Function to fade out sound
    function fadeOut() {
        let fadeOutTime = audioContext.currentTime + 0.5; // 0.5 seconds from now
        gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Current volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, fadeOutTime); // Fade to near 0

        setTimeout(
            () => {
                source.stop();
                twitchAlertsContext.raid.callback();
            },
            (fadeOutTime - audioContext.currentTime) * 1000
        ); // Stop the sound after fade

    }

    const onAnimationStart = (e) => {
        if (e.animationName !== slideInFromRight.name) {
            return;
        }

        // Assuming terminatorSound is a URL to an audio file
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();

        fetch(terminatorSound)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                source.start();
            });

        // read out follower name + text
        const utterance = new SpeechSynthesisUtterance(`You are being raided by ${twitchAlertsContext.raid.data.raider.displayName}, with an army of ${twitchAlertsContext.raid.data.partySize}!`);
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
    };

    const onAnimationEnd = (e) => {
        fadeOut();
    };

    useEffect(() => {
        if (everythingDone) {
            setAnimationEnded(false);

        }
    }, [animationEnded]);

    if (!twitchAlertsContext.raid) {
        return null;
    }

    // If more than 100 raiders, animation length is 30 seconds. If less, 15;
    const animationLengthInSeconds = twitchAlertsContext.raid.data.partySize >= 100 ? 30 : 15;

    return (
        <RaidContainer key={twitchAlertsContext.raid.data.id + twitchAlertsContext.raid.data.updatedAt}>
            <TextContainer $animationLengthInSeconds={animationLengthInSeconds}>

                INCOMING RAID<br />
                <TextUsername><strong>{twitchAlertsContext.raid.data.raider.displayName}</strong></TextUsername><br />
                Army of {numeral(twitchAlertsContext.raid.data.partySize).format('0,0')}<br />

            </TextContainer>

            <Terminators onAnimationStart={onAnimationStart} onAnimationEnd={onAnimationEnd} $animationLengthInSeconds={animationLengthInSeconds}>
                    {Array.from({ length: Math.min(twitchAlertsContext.raid.data.partySize, 50) }).map((_, i) => {
                        // Random offset to be random number between 300 and 400
                        const randomLeftOffset = Math.floor(Math.random() * (460 - 300 + 1)) + 300;

                        // Generate 1 or 2 for z index
                        const randomZIndex = Math.floor(Math.random() * 2) + 1;
                        const randomBounceSpeed = Math.random() * 1 + 0.5; // generates a random number between 0.5 and 1

                        return <TerminatorImg key={i} src={terminatorImage} width="480" height="641"
                            $randomLeftOffset={randomLeftOffset}
                            $randomZIndex={randomZIndex}
                            $randomBounceSpeed={randomBounceSpeed} />;
                    })}
            </Terminators>
        </RaidContainer>
    );
});

export default TwitchRaid;
