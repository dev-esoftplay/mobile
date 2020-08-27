#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;

const DIR = "./"
const appjson = DIR + "app.json"
const applive = DIR + "app.live.json"
const appdebug = DIR + "app.debug.json"

const confjson = DIR + "config.json"
const conflive = DIR + "config.live.json"
const confdebug = DIR + "config.debug.json"

const gplist = DIR + "GoogleService-Info.plist"
const gplistlive = DIR + "GoogleService-Info.live.plist"
const gplistdebug = DIR + "GoogleService-Info.debug.plist"

var args = process.argv.slice(2);


function consoleFunc(msg, success) {
  if (success) {
    consoleSucces(msg)
  } else {
    consoleError(msg)
  }
}


function consoleError(msg) {
  console.log("\x1b[31m", msg + " ✘", "\x1b[0m")
}

function consoleSucces(msg) {
  console.log("\x1b[32m", msg + " ✓", "\x1b[0m")
}

function checkApp() {
  consoleFunc('app.json', fs.existsSync(appjson))
  consoleFunc('app.live.json', fs.existsSync(applive))
  consoleFunc('app.debug.json', fs.existsSync(appdebug))
}

function checkConfig() {
  consoleFunc('config.json', fs.existsSync(confjson))
  consoleFunc('config.live.json', fs.existsSync(conflive))
  consoleFunc('config.debug.json', fs.existsSync(confdebug))
}

function checkGplist() {
  consoleFunc('GoogleService-Info.plist', fs.existsSync(gplist))
  consoleFunc('GoogleService-Info.live.plist', fs.existsSync(gplistlive))
  consoleFunc('GoogleService-Info.debug.plist', fs.existsSync(gplistdebug))
}

function askPerm(question, answer) {
  var readline = require('readline');
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(question + " (Y/N)", function (ans) {
    if (ans.toLowerCase() == 'y') {
      answer()
    } else {
      console.warn("Build dibatalkan")
    }
    rl.close();
  });
}

function command(command) {
  exec(
    command,
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
}

function build() {
  if (args[0] == "build") {
    askPerm("Yakin akan membuild app " + (args[1] ? args[1] : "") + (args[2] ? " " + (args[2]) : "") + "?", () => {
      if (args[1] == "debug" || args[1] == "live") {
        switchStatus(args[1])
        console.log('+ status ' + args[1])
      }
      if (args[2] == "offline" || args[2] == "online") {
        switchMode(args[2])
        console.log('+ mode ' + args[2])
      }
      // command("expo build:android")
      command("expo build:ios")
      command("expo build:android -t app-bundle")
      consoleError("silahkan cek build pada halaman https://expo.io/builds")
    })
  }
}

function switchMode(mode) {
  let valid = false
  if (fs.existsSync(appjson)) {
    var txt = fs.readFileSync(appjson, 'utf8');
    let isJSON = txt.startsWith('{') || txt.startsWith('[')
    let app = isJSON ? JSON.parse(txt) : txt
    if (app.expo) {
      if (app.expo.updates) {
        valid = true
        app.expo.updates.enabled = (mode == "online" ? true : false)
        fs.writeFileSync(appjson, isJSON ? JSON.stringify(app, undefined, 2) : app)
      }
    } else {
      consoleError("app.json tidak valid")
    }
  } else {
    consoleError("app.json")
  }
  return valid
}

function copyFromTo(from, to) {
  let valid = false
  if (fs.existsSync(from)) {
    if (fs.existsSync(to)) {
      var txt = fs.readFileSync(from, 'utf8');
      let isJSON = txt.startsWith('{') || txt.startsWith('[')
      let app = isJSON ? JSON.parse(txt) : txt
      fs.writeFileSync(to, isJSON ? JSON.stringify(app, undefined, 2) : app)
      valid = true
    } else {
      valid = false
    }
  }
  return valid
}

function doInc(file) {
  if (fs.existsSync(file)) {
    var txt = fs.readFileSync(file, 'utf8');
    let isJSON = txt.startsWith('{') || txt.startsWith('[')
    if (!isJSON) {
      consoleError('app.json tidak valid')
      return
    }
    let app = JSON.parse(txt)
    let lastVersion = app.expo.android.versionCode
    consoleSucces(file + " Versi yang lama " + app.expo.version)
    app.expo.android.versionCode = lastVersion + 1
    app.expo.ios.buildNumber = String(lastVersion + 1)
    app.expo.version = args[1] || ('0.' + String(lastVersion + 1))
    consoleSucces(file + " Berhasil diupdate ke versi " + app.expo.version)
    fs.writeFileSync(file, JSON.stringify(app, undefined, 2))
  } else {
    consoleError(file)
  }
}

function incrementVersion() {
  doInc(appjson)
  doInc(appdebug)
  doInc(applive)
}

function switchStatus(status) {
  let valid = true
  if (valid)
    valid = copyFromTo(status == "live" ? applive : appdebug, appjson)
  if (valid)
    valid = copyFromTo(status == "live" ? conflive : confdebug, confjson)
  if (valid)
    valid = copyFromTo(status == "live" ? gplistlive : gplistdebug, gplistlive)
  if (!valid) {
    consoleError('TERJADI KESALAHAN')
    checkApp()
    checkConfig()
    checkGplist()
  }
  return valid
}

function tm(message) {
  command("curl -d \"text=" + message + "&chat_id=-1001212227631\" 'https://api.telegram.org/bot112133589:AAFFyztZh79OsHRCxJ9rGCGpnxkcjWBP8kU/sendMessage'")
}

function help() {
  console.log(
    "\n\n PERINTAH YANG BISA DIGUNAKAN",
    "\n esp builder [options]",
    "\n\n OPTIONS :",
    "\n - help                 : panduan penggunaan",
    "\n - check                : untuk check status file",
    "\n - debug                : untuk ubah status DEBUG",
    "\n - live                 : untuk ubah status LIVE",
    "\n - offline              : untuk ubah mode OFFLINE",
    "\n - online               : untuk ubah mode ONLINE",
    "\n - version              : untuk increment version",
    "\n - version [visible]    : untuk increment version dengan tampilan custom. misal 2.0beta",
    "\n - publish [message]    : untuk mempublish dan menambahkan pesan",
    // "\n - build                : untuk build app .ipa .apk .aab",
    // "\n - build debug          : untuk build app .ipa .apk .aab status DEBUG",
    // "\n - build debug offline  : untuk build app .ipa .apk .aab status DEBUG mode OFFLINE",
    // "\n - build debug online   : untuk build app .ipa .apk .aab status DEBUG mode ONLINE",
    // "\n - build live           : untuk build app .ipa .apk .aab status LIVE",
    // "\n - build live offline   : untuk build app .ipa .apk .aab status LIVE mode OFFLINE",
    // "\n - build live online    : untuk build app .ipa .apk .aab status LIVE mode ONLINE",
  )
}

if (args.length == 0) {
  help()
}

if (args[0] == 'publish') {
  tm(args.slice(1, args.length))
}

if (args[0] == 'check') {
  checkApp()
  checkConfig()
  checkGplist()
}

if (args[0] == 'build') {
  build()
}

if (args[0] == 'help') {
  help()
}


if (args[0] == "version") {
  incrementVersion()
}

if (args[0] == "debug") {
  if (switchStatus(args[0]))
    consoleSucces("App now is in DEBUG status")
}

if (args[0] == "live") {
  if (switchStatus(args[0]))
    consoleSucces("App now is in LIVE status")
}

if (args[0] == "offline") {
  switchMode(args[0])
  consoleSucces("App now is in OFFLINE mode")
}

if (args[0] == "online") {
  switchMode(args[0])
  consoleSucces("App now is in ONLINE mode")
}


