import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { twitchAlertsStore, TwitchAlertsContext } from '../alerts-store';

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
    100% { transform: translateX(150%); }
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
`

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
    top: calc(50% - 2.5%);
    left: 50%;
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
    const onAnimationEnd = (e) => {
        if (e.animationName === slideOutRight.name) {
            setAnimationEnded(true);
        }
    }

    useEffect(() => {
        // Set up a reaction that runs whenever the follower changes
        const disposer = reaction(
            () => twitchAlertsContext.follower,
            (follower) => {
                if (follower) {
                    console.log(`New follower: ${follower.displayName}`);
                    // You can add more code here to handle the new follower
                }
            },
        );

        // Clean up the reaction when the component is unmounted
        return () => disposer();
    }, [twitchAlertsContext]);

    useEffect(() => {
        if (animationEnded) {
            setAnimationEnded(false);
            twitchAlertsStore.callback();
        }
    }, [animationEnded]);

    if (!twitchAlertsContext.follower) {
        return null;
    }

    return (
        <FollowerContainer onAnimationEnd={onAnimationEnd}>
            <StripBackground />
            <StripColor />
            <TextContainer>
                <Text>
                    NEW FOLLOWER!<br />
                    <TextUsername>{twitchAlertsContext.follower.displayName}</TextUsername>
                </Text>
            </TextContainer>
        </FollowerContainer>
    );
});

export default TwitchFollowers;

setTimeout(() => {
    window.test.follower();
}, 500);
