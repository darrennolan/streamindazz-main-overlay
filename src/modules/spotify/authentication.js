import OAuthAuthentication from '../../utilities/oauth-authentication';

class SpotifyAuthentication extends OAuthAuthentication {
    constructor(config) {
        super({
            ...config,
            authorizationEndpoint: 'https://accounts.spotify.com/authorize',
            tokenEndpoint: 'https://accounts.spotify.com/api/token',
            useCodeChallenge: true,
            responseType: 'code',
            scope: 'user-read-currently-playing',
            localStoragePrefix: 'spotify_',
        });
    }
}

let authenticationSingleton;

export default function getAuthenticationSingleton(config) {
    if (!authenticationSingleton) {
        authenticationSingleton = new SpotifyAuthentication(config);
    }

    return authenticationSingleton;
}
