# StreaminDazz Main Overlay

This project is a Twitch stream overlay built with React, MobX, and styled-components.
Currently supports Spotify Now PLaying module, and some Twitch alerts like new Follower and Raid.  Will hope to replace default Twitch Alerts and make them more fun for myself/viewers.

## Getting Started

First, clone the repository and install the dependencies:

```sh
git clone git@github.com:darrennolan/streamindazz-main-overlay.git
cd streamindazz-main-overlay
npm install
```

This project uses environment variables for configuration. Copy the .env.sample file to a new file named .env or .env.local and fill in the appropriate values.

```sh
cp .env.sample .env
```

## Testing

You can test using methods exposed on the window object.  Unit/Integration tests coming(tm).

```javascript
// You do not need to be logged in via Twitch to trigger these alerts this way.
// USE_DEVELOPER_SCALE=true in .env must be set.
window.test.follower(name = 'StreaminDazz');
window.test.raid(name = 'StreaminDazz', partySize = 22)
```

## Building and Running

```sh
# Get developin
npm start

# Get building.. haven't tried this yet but we'll get there eventually...
npm run build
```

Open http://localhost:1234 to view the overlay in your browser.

## Contributing

Pull requests are potentially welcome. For changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.
