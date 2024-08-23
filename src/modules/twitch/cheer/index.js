import React, { useEffect, useState, useContext, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';
import { getReadyToSay } from '../../../utilities/voice';

import soundAccents from '../../../sounds/cheers/accents.mp3'; // longer
import soundReactionCrowd from '../../../sounds/cheers/reaction-crowd.mp3'; // longer

import soundSwish from '../../../sounds/cheers/swish.mp3'; // short
import soundWhooshes from '../../../sounds/cheers/whooshes.mp3'; // short

import cheerVideo from '../../../images/cheer.webm';

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

const CheerContainer = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 200px;
    animation: ${theAnimation} 0.5s ease-in-out;
`;

const TwitchCheer = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const [fadeOut, setFadeOut] = useState(false);
    const [animationEnded, setAnimationEnded] = useState(false);
    const [voiceReadyObject, setVoiceReadyObject] = useState(false);
    const videoRef = useRef(null);

    const cheerDetails = twitchAlertsContext.cheer;

    const audioAccents = new Audio(soundAccents);
    const audioReactionCrowd = new Audio(soundReactionCrowd);
    const audioSwish = new Audio(soundSwish);
    const audioWhooshes = new Audio(soundWhooshes);

    audioAccents.volume = 0.9;
    audioReactionCrowd.volume = 0.9;
    audioSwish.volume = 0.9;
    audioWhooshes.volume = 0.9;

    const onAnimationStart = (e) => {
        if (e.animationName === fadeInAnimation.name) {
            if (cheerDetails.data.bits >= 50) {
                // play randomly either swish or wooshes
                if (Math.random() > 0.5) {
                    audioSwish.play();
                } else {
                    audioWhooshes.play();
                }
            } else {
                // play randomly either accents or reactioncrowd
                if (Math.random() > 0.5) {
                    audioAccents.play();
                } else {
                    audioReactionCrowd.play();
                }
            }
        }
    };

    const onAnimationEnd = (e) => {
        if (e.animationName === fadeInAnimation.name) {
            // Play the video
            if (videoRef.current) {
                videoRef.current.play();
            }

            // Play the text-to-speech
            new Promise(resolve => setTimeout(resolve, 500))
                .then(() => voiceReadyObject.say())
                .then(() => {
                    setFadeOut(true);
                });
        }

        if (e.animationName === fadeOut.name) {
            setAnimationEnded(true);
        }
    };

    useEffect(() => {
        if (animationEnded) {
            setAnimationEnded(false);
            setFadeOut(false);
            setVoiceReadyObject(false);
            cheerDetails.callback();
        }
    }, [animationEnded]);

    useEffect(() => {
        let whatToSay = '';

        if (cheerDetails) {
            if (cheerDetails.data.bits >= 50) {
                whatToSay = `${cheerDetails.data.userDisplayName} just cheered ${cheerDetails.data.bits} bits!`;
            } else {
                whatToSay = `${cheerDetails.data.userDisplayName} cheers!`;
            }

            if (cheerDetails.data.message) {
                whatToSay += ` They said: ${cheerDetails.data.message}`;
            }

            getReadyToSay(whatToSay)
                .then((sayObject) => {
                    setVoiceReadyObject(sayObject);
                });
        }
    }, [cheerDetails]);

    if (!cheerDetails || !voiceReadyObject) {
        return null;
    }

    return (
        <CheerContainer
            onAnimationStart={onAnimationStart}
            onAnimationEnd={onAnimationEnd}
            $fadeOut={fadeOut}
        >
            <video ref={videoRef} src={cheerVideo} />
            <p>{cheerDetails.data.userDisplayName} cheered {cheerDetails.data.bits} bit{cheerDetails.data.bits > 1 ? 's' : ''}</p>
            <p>{cheerDetails.data.message}</p>
        </CheerContainer>
    );
});

export default TwitchCheer;
