import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';

import { getVoiceAndSay } from '../../../utilities/voice';
import soundEffect from '../../../sounds/smash-bros/smash-bros-ultimate-super-smash-bros-ultimate-a-new-foe-has-appeared-sound-effect.mp3';
import backgroundImage from '../../../images/abstract-background/minified.jpg';

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

    animation: ${fadeIn} 0.5s ease-in-out, ${fadeOut} 0.5s ease-in-out 20s;
`;

const StyledBackgroundContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;

    width: 150%;
    height: 75%;

    transform: rotate(-3deg) translate(-50%, -50%) scale(1.5);

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, transparent, rgba(0, 0, 0, 0.99));
    }
`;

const StyledBackgroundImage = styled.img`
    width: 100%;
    height: 100%;
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

            {/* <p>
                A new subscriber has appeared!
            </p>
            <p>
                ${subscriberData.totalDuration > 1 ? `Welcome ${subscriberData.subscriber?.displayName}` : `<bold>${subscriberData.subscriber.displayName}</bold> for ${subscriberData.totalDuration} months!`}
            </p> */}
        </SubscribeContainer>
    );
});

export default TwitchSubscriber;
