let voiceReady = false;

export async function getVoiceReady() {
    if (voiceReady) {
        return true;
    } else {
        window.speechSynthesis.onvoiceschanged = function() {
            voiceReady = true;
        };

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (voiceReady) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
}

new SpeechSynthesisUtterance(`Loading voices on page boot`); // don't stress, we don't ask it to talk.

export async function say(
    message = '',
    {
        rate = 1.0,
        volume = 1.0,
        preferredURIs = [
            'Google UK English Male',
            'Microsoft David - English (United States)',
            'Google US English',
            'Google UK English Female',
        ]
    } = {} // options
) {
    return new Promise((resolve, reject) => {
        if (!voiceReady) {
            reject(new Error('Voice is not ready, be sure to call getVoiceReady first.'));
        }

        const utterance = new SpeechSynthesisUtterance(message);
        const voices = speechSynthesis.getVoices();

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

        utterance.volume = volume; // Set volume
        utterance.rate = rate; // Set speed

        utterance.onend = function(event) {
            resolve(); // Resolve the promise when the utterance has finished speaking
        };

        speechSynthesis.speak(utterance);
    });
}

export async function getVoiceAndSay(message, options) {
    await getVoiceReady();

    return say(message, options);
}
