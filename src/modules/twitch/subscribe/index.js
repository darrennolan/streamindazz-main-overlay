import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';

import soundWhoosh from '../../../sounds/whoosh/whoosh.mp3';

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
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
`;


const TwitchSubscriber = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const [animationEnded, setAnimationEnded] = useState(false);
    const subscriberData = twitchAlertsContext.subscriber.data;
    const audioWhoosh = new Audio(soundWhoosh);

    const onAnimationStart = (e) => {
        if (e.animationName === fadeIn.name) {
            audioWhoosh.play();
        }
    };

    const onAnimationEnd = (e) => {
        if (e.animationName === fadeIn.name) {
            const utterance = new SpeechSynthesisUtterance();
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

            // Get subscriber data

            const displayName = subscriberData.subscriber.displayName;
            const totalDuration = subscriberData.totalDuration;
            const messageContent = subscriberData.messageContent.fragments.map(fragment => fragment.text).join(' ');

            // Construct the message
            let message = `A new subscriber has appeared! Welcome ${displayName}. `;

            if (totalDuration > 1) {
                message += `This is your ${totalDuration} month of subscription. `;
            }
            message += `Your message: ${messageContent}`;

            utterance.text = message;
            speechSynthesis.speak(utterance);
        }

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
            <p>
                A new subscriber has appeared!
            </p>
            <p>
                ${subscriberData.totalDuration > 1 ? `Welcome ${subscriberData.subscriber.displayName}` : `<bold>${subscriberData.subscriber.displayName}</bold> for ${subscriberData.totalDuration} months!`}
            </p>
        </SubscribeContainer>
    );
});

export default TwitchSubscriber;
