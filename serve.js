/*
This file allows pm2 to run npm scripts on windows
https://github.com/Unitech/pm2/issues/2808
*/

const cmd = require("node-cmd");
cmd.run("npm run serve");
