import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1.js';
import express from 'express';
import cors from 'cors';

const textToSpeech = new TextToSpeechV1({
    // See: https://github.com/watson-developer-cloud/node-sdk#authentication
});

const app = express();
const port = 12345;

app.use(cors());
app.use(express.json());

app.route('/tts')
    .get((req, res) => handleTTSRequest(req, res))
    .post((req, res) => handleTTSRequest(req, res));

function handleTTSRequest(req, res) {
    const whatToSay = req.body?.say || req.query?.say;

    if (!whatToSay) {
        res.status(400)
            .send('Missing required parameter or body "say"');

        console.error('body', req.body);
        console.error('params', req.query);

        return;
    }

    const synthesizeParams = {
        text: whatToSay,
        accept: 'audio/mp3',
        voice: 'en-AU_JackExpressive',
    };

    textToSpeech
        .synthesize(synthesizeParams)
        .then(response => {
            const audio = response.result;

            res.set('Access-Control-Allow-Origin', '*');
            res.set('Content-Type', 'audio/mp3');
            audio.pipe(res);
        })
        .catch(err => {
            console.log('error:', err);
            res.status(500)
                .send('An error occurred while synthesizing the text');
        });
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
