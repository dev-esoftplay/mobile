const shell = require('child_process').execSync;
const packJson = require("./package.json")
const fs = require('fs');
const version = packJson.version
const baseVersion = version.split('-')[0]
const parts = baseVersion.split('.')
let nextNumber = parseInt(parts[2]) + 1
let nextVersion = parts[0] + '.' + parts[1] + '.' + nextNumber
const newPackJson = { ...packJson, version: nextVersion }
fs.writeFileSync("./package.json", JSON.stringify(newPackJson, undefined, 2))
shell("npm pack", { stdio: ['inherit', 'inherit', 'inherit'] })
shell("mv -f ./esoftplay-" + nextVersion + ".tgz /var/www/html/mobile-master/esoftplay.tgz")
console.log("\nbun add /var/www/html/mobile-master/esoftplay.tgz && bun install\n")
// shell("npm publish", { stdio: ['inherit', 'inherit', 'inherit'] })
// console.log("\nbun add esoftplay@" + nextVersion + " && bun install\n")