import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';
import { getVoiceAndSay } from '../../../utilities/voice';

import soundWhoosh from '../../../sounds/whoosh/whoosh.mp3';
import soundPunch from '../../../sounds/punch/heavy-face-punch.mp3';
import soundCartoonHorn from '../../../sounds/cartoon-horn/cartoon-horn.mp3';

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

const shake = keyframes`
    0% { transform: translateY(-50%) translateX(0%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    10% { transform: translateY(-52%) translateX(-2%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    20% { transform: translateY(-48%) translateX(2%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    30% { transform: translateY(-49%) translateX(-1%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    40% { transform: translateY(-51%) translateX(1%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    50% { transform: translateY(-50%) translateX(0%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    60% { transform: translateY(-52%) translateX(-2%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    70% { transform: translateY(-48%) translateX(2%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    80% { transform: translateY(-49%) translateX(-1%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    90% { transform: translateY(-51%) translateX(1%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
    100% { transform: translateY(-50%) translateX(0%) perspective(1000px) rotateY(-20deg) rotateX(20deg); }
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

    animation: ${shake}  0.25s 0.25s forwards;
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

const TwitchFollower = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const [animationEnded, setAnimationEnded] = useState(false);
    const audioWhoosh = new Audio(soundWhoosh);
    const audioPunch = new Audio(soundPunch);
    // const audioCartoonHorn = new Audio(soundCartoonHorn);

    const onAnimationStart = (e) => {
        if (e.animationName === slideInLeft.name || e.animationName === slideOutRight.name) {
            audioWhoosh.playbackRate = 3;
            audioWhoosh.play();
        }
    };

    const onAnimationEnd = (e) => {
        if (e.animationName === slideInLeft.name) {
            audioPunch.play();
            // audioCartoonHorn.play();
            getVoiceAndSay(`${twitchAlertsContext.follower.data.follower.displayName} just followed!`);
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
        <FollowerContainer key={twitchAlertsContext.follower.data.id + twitchAlertsContext.follower.data.updatedAt} onAnimationStart={onAnimationStart} onAnimationEnd={onAnimationEnd}>
            <StripBackground />
            <StripColor />
            <TextContainer>
                <Text>
                    NEW FOLLOWER!<br />
                    <TextUsername>{twitchAlertsContext.follower.data.follower.displayName}</TextUsername>
                </Text>
            </TextContainer>
        </FollowerContainer>
    );
});

export default TwitchFollower;
