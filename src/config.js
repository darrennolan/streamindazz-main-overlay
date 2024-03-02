const config = {
    useDeveloperScale: process.env.USE_DEVELOPER_SCALE && (process.env.USE_DEVELOPER_SCALE.toLowerCase() === 'true'),

    // @TODO Move these over to .env maybe.
    streamerName: 'StreaminDazz',
    themeBackgroundColor: '#F29A44',
    themeForegroundColor: '#FFF',
    themeForegroundShadowColor: '#000',

    spotifyNowPlaying: {
        clientId: process.env.SPOTIFY_NOW_PLAYING_CLIENT_ID,
    },
};

export default config;
