class SpotifyAuthentication {
    authorizationEndpoint = 'https://accounts.spotify.com/authorize';
    tokenEndpoint = 'https://accounts.spotify.com/api/token';
    scope = 'user-read-currently-playing';

    expiresBufferTimeInMs = 3000; // Refresh our token if we're within this time.

    clientId = null;
    redirectUrl = null;


    accessTokenPromise = null;

    constructor({clientId, redirectUrl}) {
        this.authPromise = null;
        this.clientId = clientId;
        this.redirectUrl = redirectUrl || `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}${window.location.pathname}${window.location.hash}`;

        this.processCodeFromUrlIfPresent();
    }

    get currentAccessToken() { return localStorage.getItem('spotify_access_token') || null; }
    get currentRefreshToken() { return localStorage.getItem('spotify_refresh_token') || null; }
    get currentExpiresIn() { return localStorage.getItem('spotify_refresh_in') || null }
    get currentExpires() { return localStorage.getItem('spotify_expires') || null }

    // On page load, try to fetch auth code from current browser search URL
    async processCodeFromUrlIfPresent() {
        const args = new URLSearchParams(window.location.search);
        const code = args.get('code');

        // If we find a code, we're in a callback, do a token exchange
        if (code) {
            const response = await this.getTokensFromUrlCode(code);

            this.saveTokensFromResponse(response);

            // Remove code from URL so we can refresh correctly.
            const url = new URL(window.location.href);

            url.searchParams.delete('code');

            const updatedUrl = url.search ? url.href : url.href.replace('?', '');

            window.history.replaceState({}, document.title, updatedUrl);
        }
    }

    saveTokensFromResponse(response) {
        const { access_token, refresh_token, expires_in } = response;
        const now = new Date();
        const expiry = new Date(now.getTime() + (expires_in * 1000));

        if (access_token && refresh_token && expires_in) {
            localStorage.setItem('spotify_access_token', access_token);
            localStorage.setItem('spotify_refresh_token', refresh_token);
            localStorage.setItem('spotify_expires_in', expires_in);

            localStorage.setItem('spotify_expires', expiry);
        } else {
            console.error(response);

            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_refresh_token');
            localStorage.removeItem('spotify_expires_in');

            localStorage.removeItem('spotify_expires');
        }
    }

    async redirectToSpotifyAuthorize() {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomValues = crypto.getRandomValues(new Uint8Array(64));
        const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '');

        const code_verifier = randomString;
        const data = new TextEncoder().encode(code_verifier);
        const hashed = await crypto.subtle.digest('SHA-256', data);

        const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        window.localStorage.setItem('spotify_code_verifier', code_verifier);

        const authUrl = new URL(this.authorizationEndpoint)
        const params = {
            response_type: 'code',
            client_id: this.clientId,
            scope: this.scope,
            code_challenge_method: 'S256',
            code_challenge: code_challenge_base64,
            redirect_uri: this.redirectUrl,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    }

    async getTokensFromUrlCode(code) {
        const code_verifier = localStorage.getItem('spotify_code_verifier');

        const response = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.redirectUrl,
                code_verifier: code_verifier,
            }),
        });

        window.localStorage.removeItem('spotify_code_verifier');

        return await response.json();
    }

    async refreshToken() {
        const response = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                grant_type: 'refresh_token',
                refresh_token: this.currentRefreshToken,
            }),
        });

        return await response.json();

    }

    async getAccessToken() {
        const currentDate = new Date();

        // If there's no ongoing authPromise, create a new one
        if (!this.accessTokenPromise) {


            // return false we're not logged in.

            // check if we have valid access token, if we do, return it
            if (this.currentAccessToken
                && this.currentExpires
                && (this.currentExpires > (currentDate + this.expiresBufferTimeInMs))) {

                this.accessTokenPromise = new Promise((resolve) => {
                    resolve(this.currentAccessToken);
                })
                    .finally(() => {
                        // Once the promise is settled (either resolved or rejected), reset authPromise so future calls can generate a new promise
                        this.accessTokenPromise = null;
                    });

            // check if we have valid refresh token, if we do, refresh access token, then return it
            } else if (this.currentRefreshToken) {
                this.accessTokenPromise = this.refreshToken()
                    .then((response) => {
                        this.saveTokensFromResponse(response);

                        return this.currentAccessToken;
                    })
                    .finally(() => {
                        // Once the promise is settled (either resolved or rejected), reset authPromise so future calls can generate a new promise
                        this.accessTokenPromise = null;
                    });
            } else {
                this.accessTokenPromise = new Promise((resolve) => {
                    resolve(false);
                })
                    .finally(() => {
                        // Once the promise is settled (either resolved or rejected), reset authPromise so future calls can generate a new promise
                        this.accessTokenPromise = null;
                    });
            }
        }

        // Return the existing or new promise we just made
        return this.accessTokenPromise;
    }
}


let authenticationSingleton;

export default function getAuthenticationSingleton(config) {
    if (!authenticationSingleton) {
        authenticationSingleton = new SpotifyAuthentication(config);
    }

    return authenticationSingleton;
}
