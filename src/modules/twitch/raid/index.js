import React, { useEffect, useState, useContext, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import numeral from 'numeral';

import { TwitchAlertsContext } from '../alerts-store';

import { getReadyToSay } from '../../../utilities/voice';
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

const slideInFromRight = ($terminatorsWidth) => keyframes`
    0% {
        margin-left: calc(100% + 480px);
        opacity: 1;

    }
    95% {
        opacity: 1;
    }
    100% {
        margin-left: -${$terminatorsWidth}px;
        opacity: 0;
    }
`;

const RaidContainer = styled.div`
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
`;

const Terminators = styled.div`
    left: 0;
    margin-left: calc(100% + 480px);

    position: absolute;
    padding-left: 480px;
    bottom: 0;
    height: 40%;
    width: max-content;
    overflow: hidden;

    animation: ${props => slideInFromRight(props.$terminatorsWidth)} ${props => props.$animationLengthInSeconds + 3}s linear both;
`;

const TerminatorImg = styled.img`
    margin-top: 28px;
    margin-left: -300px;
    z-index: 1;
    animation: ${terminatorBounceUpAndDown} 1s infinite;
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
    const terminatorsRef = useRef(null);
    const [animationStarted, setAnimationStarted] = useState(false);
    const [terminatorsWidth, setTerminatorsWidth] = useState(0);
    const [voiceReadyObject, setVoiceReadyObject] = useState(false);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    const source = useRef();

    // Function to fade out sound
    function fadeOut() {
        let fadeOutTime = audioContext.currentTime + 3; // 3 seconds from now

        gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Current volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + fadeOutTime); // Fade to near 0

        // @TODO Fade out not working as expected. Just ends.

        setTimeout(
            () => {
                if (!source.current) {
                    return;
                }

                source.current.stop();
                setAnimationStarted(false);
                setVoiceReadyObject(false);
                twitchAlertsContext.raid.callback();
            },
            (fadeOutTime - audioContext.currentTime) * 1000,
        ); // Stop the sound after fade
    }

    const onAnimationStart = (e) => {
        if (animationStarted || !e.target.classList.contains('animated-terminators')) {
            return;
        }

        setAnimationStarted(true);

        fetch(terminatorSound)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
            .then((audioBuffer) => {
                source.current = audioContext.createBufferSource();
                source.current.buffer = audioBuffer;
                source.current.connect(gainNode);
                gainNode.connect(audioContext.destination);
                source.current.start();
            });


        new Promise(resolve => setTimeout(resolve, 2000))
            .then(() => voiceReadyObject.say());
    };

    const onAnimationEnd = () => {
        fadeOut();
    };

    useEffect(() => {
        if (terminatorsRef.current) {
            setTerminatorsWidth(terminatorsRef.current.offsetWidth);
        }
    }, [terminatorsRef.current, twitchAlertsContext?.raid?.data?.viewers]);

    useEffect(() => {
        if (twitchAlertsContext.raid) {
            // read out raider name + party size
            getReadyToSay(`Incoming raid by ${twitchAlertsContext.raid.data.displayName}, with an army of ${twitchAlertsContext.raid.data.viewers}!`)
                .then((sayObject) => {
                    setVoiceReadyObject(sayObject);
                });
        }
    }, [twitchAlertsContext.raid]);

    if (!twitchAlertsContext.raid || !voiceReadyObject) {
        return null;
    }

    // If more than 100 raiders, animation length is 30 seconds. If less, 15;
    const animationLengthInSeconds = twitchAlertsContext.raid.data.viewers >= 100 ? 30 : 15;

    return (
        <RaidContainer key={twitchAlertsContext.raid.data.id + twitchAlertsContext.raid.data.updatedAt}>
            <TextContainer $animationLengthInSeconds={animationLengthInSeconds}>

                INCOMING RAID<br />
                <TextUsername><strong>{twitchAlertsContext.raid.data.displayName}</strong></TextUsername><br />
                Army of {numeral(twitchAlertsContext.raid.data.viewers).format('0,0')}<br />

            </TextContainer>

            <Terminators
                ref={terminatorsRef}
                className="animated-terminators"
                onAnimationStart={onAnimationStart}
                onAnimationEnd={onAnimationEnd}
                $animationLengthInSeconds={animationLengthInSeconds}
                $terminatorsWidth={terminatorsWidth}>
                {Array.from({ length: Math.min(twitchAlertsContext.raid.data.viewers, 500) }).map((_, i) => {
                    // Random offset to be random number between 300 and 400
                    const randomLeftOffset = Math.floor(Math.random() * (460 - 300 + 1)) + 300;

                    // Generate 1 or 2 for z index
                    const randomZIndex = Math.floor(Math.random() * 2) + 1;
                    const randomBounceSpeed = Math.random() * 1 + 0.5; // generates a random number between 0.5 and 1

                    return <TerminatorImg key={i} src={terminatorImage} width="480" height="641"
                        style={{
                            animationDuration: `${randomBounceSpeed}s`,
                            marginLeft: `-${randomLeftOffset}px`,
                            zIndex: randomZIndex,
                        }}
                    />;
                })}
            </Terminators>
        </RaidContainer>
    );
});

export default TwitchRaid;
