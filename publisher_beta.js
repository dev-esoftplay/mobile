const shell = require('child_process').execSync;
const packJson = require("./package.json")
const fs = require('fs');
const crypto = require('crypto')
const version = packJson.version
const baseVersion = version.split('-')[0]
const randomHash = crypto.randomBytes(4).toString('hex').substring(0,7)
const nextVersion = baseVersion + '-beta' + randomHash
const newPackJson = { ...packJson, version: nextVersion }
fs.writeFileSync("./package.json", JSON.stringify(newPackJson, undefined, 2))
shell("npm publish", { stdio: ['inherit', 'inherit', 'inherit'] })
console.log("\nbun add esoftplay@" + nextVersion + " && bun install\n")