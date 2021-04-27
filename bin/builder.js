const { spawn, execSync } = require('child_process');
execSync("cd ../../ && node ./node_modules/esoftplay/bin/build.js install", { stdio: ['inherit', 'inherit', 'inherit'] })