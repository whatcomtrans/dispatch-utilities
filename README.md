## Dispatch Utilities

### Features

* Clipboard synchronization between workstations in the same dispatch console. **Workstation name must match the description for the channel in the AIM Server**

### Getting Started

1.  Clone this repo and `cd` to folder
2.  Run `yarn` to install depdendencies
3.  Add `.env` file to configure environment variables

For local development:

```
AIM_USERNAME=<username>
AIM_PASSWORD=<password>
```

For production:

Client

```
REACT_APP_SERVER=http://<serverip>:<port>
```

Server

```
PORT=<port>
AIM_USERNAME=<username>
AIM_PASSWORD=<password>
```

REACT_APP_SERVER is where you're running the server from.
PORT is the port the server is running from.
AIM server username and password can be found in KeePass.

### Run Locally

`yarn dev`

### Production build

#### Server

`yarn server-build && yarn serve` starts a Node.js Express server at the port specified in `.env`

#### Client

`yarn electron-build` builds an Electron executable (to `/dist`) that can be run on a workstation to install Dispatch Utilities
