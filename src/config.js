const config = {
    useDeveloperScale: process.env.USE_DEVELOPER_SCALE && (process.env.USE_DEVELOPER_SCALE.toLowerCase() === 'true'),

    // @TODO Move these over to .env maybe.
    streamerName: 'StreaminDazz',
    themeBackgroundColor: '#F29A44',
    themeForegroundColor: '#FFF',
    themeForegroundShadowColor: '#000',

    spotify: {
        clientId: process.env.SPOTIFY_NOW_PLAYING_CLIENT_ID,
        nowPlaying: {

        },
    },

    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
    },

    pusher: {
        key: process.env.PUSHER_KEY,
        cluster: process.env.PUSHER_CLUSTER,
        appId: process.env.PUSHER_APP_ID,
        secret: process.env.PUSHER_SECRET,

        twitchUserId: process.env.PUSHER_TWITCH_USER_ID,
    },

    ibm:{
        apikey: process.env.IBM_APIKEY,
        iamApikeyDescription: process.env.IBM_IAM_APIKEY_DESCRIPTION,
        iamApikeyId: process.env.IBM_IAM_APIKEY_ID,
        iamApikeyName: process.env.IBM_IAM_APIKEY_NAME,
        iamRoleCrn: process.env.IBM_IAM_ROLE_CRN,
        iamServiceid_crn: process.env.IBM_IAM_SERVICEID_CRN,
        url: process.env.IBM_URL,
    },
};

export default config;
