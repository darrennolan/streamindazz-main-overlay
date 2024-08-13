import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1.js';
import {PollyClient, SynthesizeSpeechCommand} from '@aws-sdk/client-polly';
import express from 'express';
import cors from 'cors';

const ibmTextToSpeech = new TextToSpeechV1({
    // See: https://github.com/watson-developer-cloud/node-sdk#authentication
});

const awsTextToSpeech = new PollyClient({
    // See: https://www.npmjs.com/package/@aws-sdk/client-polly
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/polly/
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/polly/command/SynthesizeSpeechCommand/
    // https://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html#API_SynthesizeSpeech_SeeAlso

    // ensure you've set up your AWS credentials in .env
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
    const provider = req.body?.provider || req.query?.provider || 'aws';

    if (!whatToSay) {
        res.status(400)
            .send('Missing required parameter or body "say"');

        console.error('body', req.body);
        console.error('params', req.query);

        return;
    }

    switch (provider) {
        default:
        case 'ibm':
            return handleIbmTTSRequest(whatToSay, res);

        case 'aws':
            return handleAwsTTSRequest(whatToSay, res);
    }
}

function handleIbmTTSRequest(whatToSay, res) {
    ibmTextToSpeech
        .synthesize({
            text: whatToSay,
            accept: 'audio/mp3',
            // voice: 'en-AU_JackExpressive',
            // voice: 'en-GB_JamesV3Voice',
            voice: 'en-GB_KateV3Voice',
        })
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

async function handleAwsTTSRequest(whatToSay, res) {
    const input = { // SynthesizeSpeechInput
        OutputFormat: 'mp3',
        SampleRate: '24000',
        Text: whatToSay,
        TextType: 'text',
        VoiceId: 'Brian',
    };
    const command = new SynthesizeSpeechCommand(input);
    const response = await awsTextToSpeech.send(command);

    const audio = response.AudioStream;

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'audio/mp3');
    audio.pipe(res);
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
