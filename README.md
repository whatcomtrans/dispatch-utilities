## Dispatch Utilities

### Features

- Clipboard synchronization between workstations in the same dispatch console. **Workstation name must match the description for the channel in the AIM Server**

### Getting Started

1.  Clone this repo and `cd` to folder
2.  Run `yarn` or `npm install` to install depdendencies
3.  Add `.env` file to configure environment variables (only needed for local development)

```
AIM_USERNAME=<username>
AIM_PASSWORD=<password>
```

Production environment variables are handled by `pm2`. Make sure `PORT`, `AIM_USERNAME`, and `AIM_PASSWORD` defined in the `pm2` config (`pm2.json`).

PORT is the port the server is running from (`3032`).
AIM server username and password can be found in KeePass.

### Run Locally

`yarn dev` or `npm run dev`

For debugging, you may want to run the server, webpack-dev-server, and electron app separately.

`yarn server-dev` or `npm run server-dev`

`yarn react-start` or `npm run react-start`

`yarn electron-dev` or `npm run electron-dev`

### Production build

#### Server

`yarn react-build` or `npm run react-build` to build static files.
`yarn server-build` or `npm run server-build` to build the server.
`yarn serve` starts a Node.js Express server.

#### Client

`yarn electron-build` or `npm run electron-build` builds the installer (to `/dist`) for the Electron app.
