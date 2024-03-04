import React, { useEffect, useContext } from 'react';
import styled from 'styled-components';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';

const FollowerContainer = styled.div`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    width: 100%;
    height: 20%;

    transform: perspective(1000px) rotateY(-20deg);
`;

const StripBackground = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: lightgrey;
`

const StripColor = styled.div`
    position: absolute;
    top: 5%;
    width: 100%;
    height: 90%;
    background: linear-gradient(to right, red, yellow);
`;

const TextContainer = styled.div`
    background: black;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 40px;
    font-weight: bold;
    position: absolute;
    padding: 20px;
    margin-top: -9px;
`;

const Text = styled.div`
    color: black;
    -webkit-text-fill-color: transparent;
    background: linear-gradient(to right, red, yellow);
    -webkit-background-clip: text;
    background-clip: text;
`;
const TextUsername = styled.span`
    font-size: 80px;
`;

const TwitchFollowers = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);

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

    if (!twitchAlertsContext.follower) {
        return null;
    }

    return (
        <FollowerContainer>
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
