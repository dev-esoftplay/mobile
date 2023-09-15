const fs = require('fs');
const shell = require('child_process').execSync;

if (fs.existsSync('./node_modules')) {
  fs.readdirSync('./node_modules').forEach((module) => {
    if (module.includes("esoftplay-")) {
      shell(`cd ./node_modules/${module} && bun install && cd ../../`)
    }
  })
}