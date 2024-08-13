import React, { useEffect, useState, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { TwitchAlertsContext } from '../alerts-store';
import { getReadyToSay } from '../../../utilities/voice';

import soundAccents from '../../../sounds/cheers/accents.mp3';
import soundReactionCrowd from '../../../sounds/cheers/reaction-crowd.mp3';
import soundSwish from '../../../sounds/cheers/swish.mp3';
import soundWhooshes from '../../../sounds/cheers/whooshes.mp3';

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

const CheerContainer = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 200px;
    animation: ${fadeIn} 0.5s ease-in-out;
`;

const TwitchCheer = observer(() => {
    const twitchAlertsContext = useContext(TwitchAlertsContext);
    const [animationEnded, setAnimationEnded] = useState(false);
    const [voiceReadyObject, setVoiceReadyObject] = useState(false);

    const audioAccents = new Audio(soundAccents);
    const audioReactionCrowd = new Audio(soundReactionCrowd);
    const audioSwish = new Audio(soundSwish);
    const audioWhooshes = new Audio(soundWhooshes);
});

export default TwitchCheer;
