# Pokebonk Desktop

An unofficial, fullscreen Windows client for the online game at <https://pokebonk.com/>.
It is a small [Electron](https://www.electronjs.org/) wrapper: it opens the official website
in its own window, so the game runs on the real game servers exactly as it does in a browser.
It can also be added to Steam as a non-Steam game.

This project is not affiliated with the developer of Pokebonk, Nintendo, or The Pokémon Company.
It contains no game code, artwork, music or saves. Pokémon and related names belong to their owners,
and the game and its services remain subject to their own terms.

## Features

- Opens `https://pokebonk.com/` fullscreen; keyboard, mouse and gamepad input go straight to the game.
- Keeps your login between launches in its own profile.
- Scales the page to about 1920px wide on high-resolution screens so the game's UI looks like it does in a browser. Sizes below 1920px are left alone.
- In-game options menu: Resume, Windowed / Fullscreen, Smaller / Larger UI, Reset UI size, Reload, Exit.

## Controls

| Action | Input |
| --- | --- |
| Options menu | **F10**, **Start + Select** on a controller, or the gear button at the bottom right |
| Menu navigation | Arrow keys / D-pad or left stick; Enter / A to select; Esc / B to close |
| Toggle fullscreen | F11 |
| Reload | F5 |
| UI size | Ctrl + `+`, Ctrl + `-`, Ctrl + `0` (reset to automatic) |
| Quit | Ctrl + Q or Alt + F4 |

While the menu is open, keyboard presses do not reach the game; controller presses still can.

## Download

Grab `Pokebonk.exe` from the [Releases](../../releases) page. It is a single portable file and needs
no installer. It unpacks itself to a temporary folder on each launch, so the first seconds are slower
than a folder build.

### Steam

1. Put `Pokebonk.exe` somewhere permanent.
2. In Steam choose **Add a Non-Steam Game**, browse to the file and add it.
3. Use the Gamepad controller layout.

## Build from source

Requires Node.js 20 or newer on Windows.

```bash
npm install
npm start               # run in development
npm run build           # folder build in dist/ (electron-packager)
npm run build:single    # single portable exe in dist-single/ (electron-builder)
```

If `npm run build:single` fails with a symbolic-link error, enable Windows Developer Mode or run the
shell as administrator; the config already skips code signing.

## Privacy

Your game login is stored in your user profile by Chromium, like in a normal browser. This app sends
nothing anywhere except the requests the website itself makes.

## License

[MIT](LICENSE)
