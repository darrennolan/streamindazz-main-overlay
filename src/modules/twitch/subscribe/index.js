import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';

import { getVoiceAndSay } from '../../../utilities/voice';
import soundEffect from '../../../sounds/smash-bros/smash-bros-ultimate-super-smash-bros-ultimate-a-new-foe-has-appeared-sound-effect.mp3';
import backgroundImage from '../../../images/abstract-background/minified.jpg';
import ralphSilhouetteImage from '../../../images/ralph/silhouette.png';

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const fadeOut = keyframes`
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
`;

const SubscribeContainer = styled.div`
    color: white;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: black;

    animation: ${fadeIn} 0.5s ease-in-out, ${fadeOut} 0.5s ease-in-out 6s;
`;

const StyledBackgroundContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;

    width: 150%;
    height: 80%;

    transform: translate(-50%, -50%);

    &::after, &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 1))
    }

    &::before {
        // background: rgba(0, 0, 0, 0.5);
    }
`;

const StyledBackgroundImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: fill;
`;

const StyledNewSubText = styled.h1`
    position: absolute;
    top: 20%;
    left: 5%;
    font-size: 5rem;
    font-weight: bold;
    text-align: center;
    color: white;

    font-family: 'Permanent Marker', cursive;
    font-weight: normal;
`;

const StyledNewSubDetailsContainer = styled.div`
    position: absolute;
    top: 40%;
    left: 0%;
    width: 100%;
    padding: 1% 5%;

    background: rgba(0, 0, 0, 0.5);
`;

const StyledNewSubName = styled.h1`
    font-size: 6rem;
    font-weight: bold;
    text-align: left;
    color: white;

    font-family: 'Roboto Slab', serif;
    font-weight: normal;
`;

const StyleNewSubDetailsTextDetail = styled.h1`
    font-size: 2.5rem;
    font-family: 'Roboto Slab', serif;
    font-weight: normal;
    text-transform: uppercase;
`;

const StyledRalphSilhouette = styled.img`
    position: absolute;
    bottom: 50%;
    right: 6%;
    width: 20%;
    height: auto;
    object-fit: fill;
    transform: translateY(50%);
`;

const StyledRalphSilhouetteWhiteLight = styled.div`
    position: absolute;
    width: auto;
    height: auto;
    top: 5%;
    right: 0%;
    padding: 20%;
    background: radial-gradient(circle at center, white, transparent 70%);
`;

const TwitchSubscriber = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const subscriberData = twitchAlertsContext.subscriber?.data;

    const [animationEnded, setAnimationEnded] = useState(false);
    const audioEffect = new Audio(soundEffect);

    const onAnimationStart = (e) => {
        if (e.animationName === fadeIn.name) {
            audioEffect.play();
        }
    };

    const onAnimationEnd = (e) => {
        if (e.animationName === fadeOut.name) {
            setAnimationEnded(true);
        }
    };

    useEffect(() => {
        if (animationEnded) {
            setAnimationEnded(false);
            twitchAlertsContext.subscriber.callback();
        }
    }, [animationEnded]);

    if (!twitchAlertsContext.subscriber) {
        return null;
    }

    return (
        <SubscribeContainer key={`${twitchAlertsContext.subscriber.data.id}-${twitchAlertsContext.subscriber.data.updatedAt}`} onAnimationStart={onAnimationStart} onAnimationEnd={onAnimationEnd}>
            <StyledBackgroundContainer>
                <StyledBackgroundImage src={backgroundImage} />
            </StyledBackgroundContainer>
            <StyledNewSubText>A new sub has appeared!</StyledNewSubText>

            <StyledNewSubDetailsContainer>
                <StyledNewSubName>
                    {subscriberData.subscriberName}
                </StyledNewSubName>

                <StyleNewSubDetailsTextDetail>
                    {subscriberData.totalDuration >= 1 ? `Welcome!` : `For ${subscriberData.totalDuration} Months!`}
                </StyleNewSubDetailsTextDetail>
            </StyledNewSubDetailsContainer>

            <StyledRalphSilhouetteWhiteLight />
            <StyledRalphSilhouette src={ralphSilhouetteImage} />
        </SubscribeContainer>
    );
});

export default TwitchSubscriber;
