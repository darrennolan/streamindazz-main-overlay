// import config from '../config';
new SpeechSynthesisUtterance(`Loading voices on page boot`); // don't stress, we don't ask it to talk.

let voiceReady = false;

export async function getNativeVoiceReady() {
    if (voiceReady) {
        return true;
    } else {
        window.speechSynthesis.onvoiceschanged = function() {
            voiceReady = true;
        };

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (voiceReady) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
}

export async function nativeSay(
    message = '',
    {
        rate = 1.0,
        volume = 1.0,
        preferredURIs = [
            'Google UK English Male',
            'Microsoft David - English (United States)',
            'Google US English',
            'Google UK English Female',
        ],
    } = {}, // options
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

        utterance.onend = function() {
            resolve(); // Resolve the promise when the utterance has finished speaking
        };

        speechSynthesis.speak(utterance);
    });
}

export async function ibmSay(message) {
    const response = await fetch(`http://localhost:12345/tts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'audio/mp3',
        },
        body: JSON.stringify({say: message}),
    });

    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    const audio = new Audio(objectURL);

    return new Promise((resolve, reject) => {
        audio.onended = function() {
            resolve();
        };
        audio.onerror = function(err) {
            reject(err);
        };
        audio.play();
    });
}

export async function getVoiceAndSay(message, options) {
    if (window.obsstudio) {
        // If OBS - use watson to say this.
        return ibmSay(message);
    } else {
        // Otherwise, use the native browser to say it.
        await getNativeVoiceReady();

        return nativeSay(message, options);
    }
}

export async function getReadyToSay(message, options) {
    if (window.obsstudio) {
        // If OBS - use watson to say this.
        return getIbmReadyToSay(message);
    } else {
        // Otherwise, use the native browser to say it.
        await getNativeVoiceReady();

        return getNativeVoiceReadyToSay(message, options);
    }
}

export async function getIbmReadyToSay(message) {
    const response = await fetch(`http://localhost:12345/tts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'audio/mp3',
        },
        body: JSON.stringify({say: message}),
    });

    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    const audio = new Audio(objectURL);

    return {say: ()=> {
        audio.play();

        return new Promise((resolve, reject) => {
            audio.onended = function() {
                resolve();
            };
            audio.onerror = function(err) {
                reject(err);
            };
            audio.play();
        });
    }};
}

export async function getNativeVoiceReadyToSay(
    message = '',
    {
        rate = 1.0,
        volume = 1.0,
        preferredURIs = [
            'Google UK English Male',
            'Microsoft David - English (United States)',
            'Google US English',
            'Google UK English Female',
        ],
    } = {}, // options
) {
    console.debug('nativevoicereadyfunction to say shit');

    return {say: () => {
        if (!voiceReady) {
            throw new Error('Voice is not ready, be sure to call getVoiceReady first.');
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

        speechSynthesis.speak(utterance);

        return new Promise((resolve) => {
            utterance.onend = function() {
                resolve(); // Resolve the promise when the utterance has finished speaking
            };
        });
    }};
}
