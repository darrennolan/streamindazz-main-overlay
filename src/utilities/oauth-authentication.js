export default class OAuthAuthentication {
    authorizationEndpoint = 'Empty Auth Endpoint';
    tokenEndpoint = 'Empty Token End Point';
    scope = '';
    localStoragePrefix = 'empty_local_storage_prefix_';
    expiresBufferTimeInMs = 3000; // Refresh our token if we're within this time.
    responseType = 'code';

    clientId = null;
    redirectUrl = null;

    accessTokenPromise = null;

    constructor(configuration) {
        Object.keys(configuration).forEach(key => {
            this[key] = configuration[key];
        });

        this.redirectUrl = this.redirectUrl ||
            `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}${window.location.pathname}${window.location.hash}`;

        this.processCodeFromUrlIfPresent();
    }

    get currentAccessToken() { return localStorage.getItem(`${this.localStoragePrefix}access_token`) || null; }
    get currentRefreshToken() { return localStorage.getItem(`${this.localStoragePrefix}refresh_token`) || null; }
    get currentExpiresIn() { return localStorage.getItem(`${this.localStoragePrefix}refresh_in`) || null; }
    get currentExpires() { return localStorage.getItem(`${this.localStoragePrefix}expires`) || null; }

    // On page load, try to fetch auth code from current browser search URL
    async processCodeFromUrlIfPresent() {
        const args = new URLSearchParams(window.location.search);
        const code = args.get('code');
        const codeVerifier = localStorage.getItem(`${this.localStoragePrefix}code_verifier`);

        // If we find a code and we're expecting a spotify token, we're in a callback, do a token exchange
        if (code && codeVerifier) {
            const response = await this.getTokensFromUrlCode(code);

            this.saveTokensFromResponse(response);

            // Remove code from URL so we can refresh correctly.
            const url = new URL(window.location.href);

            url.searchParams.delete('code');
            url.searchParams.delete('scope');

            const updatedUrl = url.search ? url.href : url.href.replace('?', '');

            window.history.replaceState({}, document.title, updatedUrl);
        } else if (codeVerifier && !code) {
            // This means we have a code_verifier but no code, we're in a weird state, clear the code_verifier
            // Potentially someone hit 'back' after heading to the auth web page.
            localStorage.removeItem(`${this.localStoragePrefix}code_verifier`);
        }
    }

    saveTokensFromResponse(response) {
        const { access_token, refresh_token, expires_in } = response;
        const now = new Date();
        const expiry = new Date(now.getTime() + (expires_in * 1000));

        if (access_token && refresh_token && expires_in) {
            localStorage.setItem(`${this.localStoragePrefix}access_token`, access_token);
            localStorage.setItem(`${this.localStoragePrefix}refresh_token`, refresh_token);
            localStorage.setItem(`${this.localStoragePrefix}expires_in`, expires_in);

            localStorage.setItem(`${this.localStoragePrefix}expires`, expiry);
        } else {
            console.error(response);

            localStorage.removeItem(`${this.localStoragePrefix}access_token`);
            localStorage.removeItem(`${this.localStoragePrefix}refresh_token`);
            localStorage.removeItem(`${this.localStoragePrefix}expires_in`);

            localStorage.removeItem(`${this.localStoragePrefix}expires`);
        }
    }

    async redirectToAuthorize() {
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

        window.localStorage.setItem(`${this.localStoragePrefix}code_verifier`, code_verifier);

        const authUrl = new URL(this.authorizationEndpoint);
        const params = {
            response_type: this.responseType,
            client_id: this.clientId,
            scope: this.scope,
            ...(this.useCodeChallenge ? {
                code_challenge_method: 'S256',
                code_challenge: code_challenge_base64,
            } : {}),
            redirect_uri: this.redirectUrl,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    }

    async getTokensFromUrlCode(code) {
        const code_verifier = localStorage.getItem(`${this.localStoragePrefix}code_verifier`);

        // Only use this code once, if fetch fails, we'll need to re-auth.
        window.localStorage.removeItem(`${this.localStoragePrefix}code_verifier`);

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
