import OAuthAuthentication from '../../utilities/oauth-authentication';

class TwitchAuthentication extends OAuthAuthentication {
    lastVerified = null;

    constructor(config) {
        super({
            ...config,
            authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
            tokenEndpoint: 'https://id.twitch.tv/oauth2/token',
            useCodeChallenge: false,
            responseType: 'token',
            scope: [
                'moderator:read:followers',
            ].join(' '),
            localStoragePrefix: 'twitch_',
        });

        // This only happens on a page refresh. If there's not 12 hours remaining in the expiry,
        // we'll remove the expiry and force a re-authentication.
        const currentDate = new Date();
        const currentExpires = localStorage.getItem(`${this.localStoragePrefix}expires`);

        if (this.scope !== localStorage.getItem(`${this.localStoragePrefix}scope`)) {
            this.logout();
        }

        if (currentExpires) {
            const expiryDate = new Date(currentExpires);

            if (expiryDate.getTime() - currentDate.getTime() < 12 * 60 * 60 * 1000) {
                localStorage.removeItem(`${this.localStoragePrefix}expires`);
            } else {
                this.lastVerified = currentDate;
            }
        }
    }

    logout() {
        localStorage.removeItem(`${this.localStoragePrefix}access_token`);
        localStorage.removeItem(`${this.localStoragePrefix}expires`);
        localStorage.removeItem(`${this.localStoragePrefix}user_id`);
        localStorage.removeItem(`${this.localStoragePrefix}login`);
    }

    async processCodeFromUrlIfPresent() {
        const codeVerifier = localStorage.getItem(`${this.localStoragePrefix}code_verifier`);
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.substring(1)); // Remove the leading '#'
        const accessToken = hashParams.get('access_token');

        if (codeVerifier && accessToken) {
            // we got twitch details for an access token.
            localStorage.removeItem(`${this.localStoragePrefix}code_verifier`);

            hashParams.delete('access_token');
            hashParams.delete('scope');
            hashParams.delete('token_type');

            window.history.replaceState({}, '', `${url.origin}${url.pathname}${url.search}${hashParams.toString() ? '#' + hashParams.toString() : ''}`);

            this.verifyAccessToken(accessToken)
                .then((valid) => {
                    if (valid) {
                        localStorage.setItem(`${this.localStoragePrefix}access_token`, accessToken);
                        localStorage.setItem(`${this.localStoragePrefix}scope`, this.scope);
                    }
                });
        }
    }

    async getAccessToken() {
        const currentDate = new Date();
        const accessToken = localStorage.getItem(`${this.localStoragePrefix}access_token`);

        if (!accessToken) {
            return false;
        }

        if (this.lastVerified === null) {
            // If lastVerified is null, hit the API to verify
            const isVerified = await this.verifyAccessToken(accessToken); // Assuming this method exists and returns a boolean

            if (!isVerified) {
                return false;
            }

            this.lastVerified = currentDate;
        } else if (this.lastVerified.getTime() + (3600 * 1000) < currentDate.getTime()) {
            // If more than an hour has passed since the last verification, hit the API again
            const isVerified = await this.verifyAccessToken(accessToken); // Assuming this method exists and returns a boolean

            if (!isVerified) {
                return false;
            }

            this.lastVerified = currentDate;
        }

        return accessToken;
    }

    async verifyAccessToken(accessToken) {
        const expiryDate = new Date();
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            headers: {Authorization: `Bearer ${accessToken}`},
        });
        const data = await response.json();

        if (response.status === 200) {
            // Calculate the expiry date and save it to local storage
            expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);
            localStorage.setItem(`${this.localStoragePrefix}expires`, expiryDate);
            localStorage.setItem(`${this.localStoragePrefix}user_id`, data.user_id);
            localStorage.setItem(`${this.localStoragePrefix}login`, data.login);

            return true;
        } else {
            return false;
        }
    }

    get userId() {
        return localStorage.getItem(`${this.localStoragePrefix}user_id`);
    }

    get login() {
        return localStorage.getItem(`${this.localStoragePrefix}login`);
    }

}

let authenticationSingleton;

export default function getAuthenticationSingleton(config) {
    if (!authenticationSingleton) {
        authenticationSingleton = new TwitchAuthentication(config);
    }

    return authenticationSingleton;
}


/*

https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=aj7hos0gg823m0gmxvt0gk5nmvmz0u&redirect_uri=http://localhost:1234/&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls&state=c3ab8aa609ea11e793ae92361f002671
https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=aj7hos0gg823m0gmxvt0gk5nmvmz0u&scope=user%253Aread%253Aemail&redirect_uri=http%3A%2F%2Flocalhost%3A1234%2F
*/
