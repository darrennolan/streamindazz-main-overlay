import React, {useEffect, useState, useContext} from 'react';
import styled, {keyframes, ifProp, css} from 'styled-components';
import {observer} from 'mobx-react';
import {TwitchAlertsContext} from '../alerts-store';

import {getVoiceAndSay} from '../../../utilities/voice';
import soundEffectMp3 from '../../../sounds/smash-bros/smash-bros-ultimate-super-smash-bros-ultimate-a-new-foe-has-appeared-sound-effect.mp3';
import backgroundImage from '../../../images/abstract-background/minified.jpg';
import ralphSilhouetteImage from '../../../images/ralph/silhouette.png';

const fadeInAnimation = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const fadeOutAnimation = keyframes`
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
`;

const theAnimation = (props) => css`
    ${props.$fadeOut ? fadeOutAnimation : fadeInAnimation} 0.5s ease-in-out;
`;

const SubscribeContainer = styled.div`
    color: white;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: black;

    opacity: ${props => props.$fadeOut ? 0 : 1};
    animation: ${theAnimation};
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

const StyleNewSubMessage = styled.h2`
    font-size: 1.8rem;
    font-family: 'Roboto Slab', serif;
    font-weight: normal;
    font-style: italic;
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

    const [fadeOut, setFadeOut] = useState(false);
    const [animationEnded, setAnimationEnded] = useState(false);

    // Function to create a promise that resolves when the audio ends
    function playAudioPromise(audioSrc) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioSrc);

            audio.onended = () => resolve('Audio has ended');
            audio.onerror = () => reject('Error playing audio');
            audio.play();
        });
    }

    // Function to create a promise that resolves after a timeout
    function timeoutPromise(duration) {
        return new Promise(resolve => setTimeout(() => resolve('Timeout reached'), duration));
    }

    let mainLine = '';
    let subLine = '';
    let message = subscriberData?.message?.message ? subscriberData?.message.message : '';

    if (subscriberData) {
        if (subscriberData.isGift) {
            mainLine = subscriberData.isAnonymous ? 'Anonymous' : subscriberData.gifterDisplayName;
            if (subscriberData.duration > 1) {
            // Specific sub gifted
                subLine = `${subscriberData.userDisplayName} received a ${subscriberData.duration}-month gift subscription`;
            } else {
                // General sub gifts
                subLine = `Gifted ${subscriberData.duration} subscription${subscriberData.duration > 1 ? 's' : ''}`;
            }
        } else {
            mainLine = `${subscriberData.userDisplayName} just subbed`;

            if (subscriberData.isResub) {
                subLine = `For ${subscriberData.cumulativeMonths} months!${subscriberData.streakMonths ? ' Streak of ' + subscriberData.streakMonths + ' months!' : ''}`;
            } else {
                subLine = 'Welcome & Thank you!';
            }
        }
    }

    const onAnimationStart = (e) => {
        if (e.animationName === fadeInAnimation.name) {
            Promise.all([
                playAudioPromise(soundEffectMp3),
                timeoutPromise(10000),
                getVoiceAndSay(`${mainLine}, ${subLine}, ${message ? `they said: ${message}` : ''}`),
            ]).then(() => {
                console.log('set fadeout true');
                setFadeOut(true);
            });
        }
    };

    const onAnimationEnd = (e) => {
        if (e.animationName === fadeOutAnimation.name) {
            setAnimationEnded(true);
        }
    };

    useEffect(() => {
        if (animationEnded) {
            console.log('hit sub callback');
            twitchAlertsContext.subscriber.callback();

            setTimeout(() => {
                setFadeOut(false); // reset fadeOut state
                setAnimationEnded(false); // reset animationEnded state
            });
        }
    }, [animationEnded]);

    if (!twitchAlertsContext.subscriber) {
        return null;
    }

    return (
        <SubscribeContainer
            key={`${twitchAlertsContext.subscriber.data.userId}-${twitchAlertsContext.subscriber.data.time.toISOString()}`}
            onAnimationStart={onAnimationStart}
            onAnimationEnd={onAnimationEnd}
            $fadeOut={fadeOut}
        >
            <StyledBackgroundContainer>
                <StyledBackgroundImage src={backgroundImage} />
            </StyledBackgroundContainer>
            <StyledNewSubText>A new sub has appeared!</StyledNewSubText>

            <StyledNewSubDetailsContainer>
                <StyledNewSubName>
                    {mainLine}
                </StyledNewSubName>

                <StyleNewSubDetailsTextDetail>
                    {subLine}
                </StyleNewSubDetailsTextDetail>

                <StyleNewSubMessage>
                    {message}
                </StyleNewSubMessage>
            </StyledNewSubDetailsContainer>


            <StyledRalphSilhouetteWhiteLight />
            <StyledRalphSilhouette src={ralphSilhouetteImage} />
        </SubscribeContainer>
    );
});

export default TwitchSubscriber;
