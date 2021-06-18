const shell         = require('child_process').execSync;
const packJson      = require("./package.json")
const fs            = require('fs');
const letterVersion = "abcdefghijklmnopqrstuvwxyz"
const version       = packJson.version
const vm            = version.match(/([a-z])/g)
const letter        = vm ? vm[0] : null
const number        = version.replace(/-/g, "").replace(letter, "")
let nextLetter      = ""
let nextNumber      = number.split(".")[2]
let nextVersion     = number.split(".")[0] + "." + number.split(".")[1] + "."
if (!letter) {
  nextLetter   = letterVersion[0]
  nextVersion += nextNumber
  nextVersion += "-" + nextLetter
} else if (letter != "z") {
  nextLetter   = letterVersion[letterVersion.indexOf(String(letter)) + 1]
  nextVersion += nextNumber
  nextVersion += "-" + nextLetter
} else {
  nextNumber   = Number(nextNumber) + 1
  nextVersion += nextNumber
}
const newPackJson = { ...packJson, version: nextVersion }
fs.writeFileSync("./package.json", JSON.stringify(newPackJson, undefined, 2))
shell("npm publish", { stdio: ['inherit', 'inherit', 'inherit'] })
console.log("\nnpm install --save esoftplay@" + nextVersion + "\n")