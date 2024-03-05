export function startWindowLocationMock() {
    global.window = global.window || {};
    global.window.location = global.window.location || {};

    Object.assign(global.window.location, {
        href: 'http://localhost:1234/',
    });

    return () => {
        delete global.window.location;
    };
}

export function startLocalStorageMock() {
    let store = {};

    global.window == global.window || {};
    global.window.localStorage = global.window.localStorage || {};

    Object.assign(global.window.localStorage, {
        clear() {
            store = {};
        },

        getItem(key) {
            return store[key] || null;
        },

        setItem(key, value) {
            store[key] = String(value);
        },

        removeItem(key) {
            delete store[key];
        },
    });

    return () => {
        delete global.window.localStorage;
    };
}
