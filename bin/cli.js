#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const exec = require('child_process').execSync;

const DIR = "./"
const appjson = DIR + "app.json"
const applive = DIR + "app.live.json"
const appdebug = DIR + "app.debug.json"
const packjson = DIR + "package.json"

const confjson = DIR + "config.json"
const conflive = DIR + "config.live.json"
const confdebug = DIR + "config.debug.json"

const gplist = DIR + "GoogleService-Info.plist"
const gplistlive = DIR + "GoogleService-Info.live.plist"
const gplistdebug = DIR + "GoogleService-Info.debug.plist"


var watcherConf = "./node_modules/esoftplay/bin/watchman.json";
var args = process.argv.slice(2);

// console.log(modpath, "sdofsjdofjsd")
function execution() {
	var yourscript = exec(
		'node ./node_modules/esoftplay/bin/router.js && watchman -j < ' + watcherConf,
		(error, stdout, stderr) => {
			console.log(stdout);
			console.log(stderr);
			if (error !== null) {
				console.log(`exec error: ${error}`);
			}
		});
}

if (args.length == 0) {
	help()
	return
}
switch (args[0]) {
	case "help":
		help()
		break;
	case "p":
	case "publish":
		publish()
		break;
	case "f":
	case "file":
		checkApp()
		checkConfig()
		checkGplist()
		break
	case "c":
	case "check":
		doctor()
		break
	case "b":
	case "build":
		build()
		break;
	case "vn":
	case "version-new":
		incrementVersion()
		break
	case "d":
	case "debug":
		if (switchStatus("d"))
			consoleSucces("App now is in DEBUG status")
		break
	case "l":
	case "live":
		if (switchStatus("l"))
			consoleSucces("App now is in LIVE status")
		break
	case "off":
	case "offline":
		switchMode("off")
		consoleSucces("App now is in OFFLINE mode")
		break
	case "on":
	case "online":
		switchMode("on")
		consoleSucces("App now is in ONLINE mode")
		break
	case "start":
		execution();
		break;
	default:
		help()
		break;
}

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

function readToJSON(path) {
	var txt = fs.readFileSync(path, 'utf8');
	let isJSON = txt.startsWith('{') || txt.startsWith('[')
	return isJSON ? JSON.parse(txt) : txt
}

function publish() {
	let status = "-"
	if (fs.existsSync(confjson)) {
		let cjson = readToJSON(confjson)
		let clive
		let cdebug
		if (fs.existsSync(conflive)) {
			clive = readToJSON(conflive)
		}
		if (fs.existsSync(confdebug)) {
			cdebug = readToJSON(confdebug)
		}
		if (clive) {
			if (clive.config.domain == cjson.config.domain) {
				status = "live"
			}
		}
		if (cdebug) {
			if (cdebug.config.domain == cjson.config.domain) {
				status = "debug"
			}
		}
		let last_id = 0
		if (status == "live") {
			if (!clive.config.hasOwnProperty("publish_id")) {
				clive.config.publish_id = 1
			} else {
				last_id = clive.config.publish_id
				clive.config.publish_id = last_id + 1
			}
			fs.writeFileSync(conflive, JSON.stringify(clive, undefined, 2))
		} else if (status == "debug") {
			if (!cdebug.config.hasOwnProperty("publish_id")) {
				cdebug.config.publish_id = 1
			} else {
				last_id = cdebug.config.publish_id
				cdebug.config.publish_id = last_id + 1
			}
			fs.writeFileSync(confdebug, JSON.stringify(cdebug, undefined, 2))
		}
		cjson.config.publish_id = last_id + 1
		fs.writeFileSync(confjson, JSON.stringify(cjson, undefined, 2))
		consoleSucces("start publishing " + status.toUpperCase() + " - PUBLISH_ID : " + (last_id + 1))
		command("expo p")
		tm("#PUBLISH\n" + cjson.config.domain + " - [ID] : " + (last_id + 1))
	}
}

function doctor() {
	let output = {}
	if (fs.existsSync(packjson)) {
		let pack = readToJSON(packjson)
		output.expo = pack.dependencies.expo
		let esplibs = Object.keys(pack.dependencies).filter((key) => key.includes("esoftplay"))
		esplibs.forEach((key) => {
			output[key] = pack.dependencies[key]
		})
	}

	if (fs.existsSync(confjson)) {
		let cjson = readToJSON(confjson)
		let clive
		let cdebug
		if (fs.existsSync(conflive)) {
			clive = readToJSON(conflive)
		}
		if (fs.existsSync(confdebug)) {
			cdebug = readToJSON(confdebug)
		}
		let status = "UNKNOWN @ " + cjson.config.domain
		let publish_id = 1
		if (clive) {
			if (clive.config.domain == cjson.config.domain) {
				status = "LIVE @ " + cjson.config.domain
			}
		}
		if (cdebug) {
			if (cdebug.config.domain == cjson.config.domain) {
				status = "DEBUG @ " + cjson.config.domain
			}
		}
		output.isDebug = cjson.config.isDebug
		output.publishId = cjson.config.publish_id || 0
		output.status = status

	}
	if (fs.existsSync(appjson)) {
		let ajson = readToJSON(appjson)
		output.mode = ajson.expo.updates.enabled ? "ONLINE" : "OFFLINE"
		output.visible = ajson.expo.version
		output.ios = ajson.expo.ios.buildNumber
		output.android = ajson.expo.android.versionCode
	}
	console.log(JSON.stringify(output, undefined, 2))
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
				app.expo.updates.enabled = (mode.includes("on") ? true : false)
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
		valid = copyFromTo(status.includes("l") ? applive : appdebug, appjson)
	if (valid)
		valid = copyFromTo(status.includes("l") ? conflive : confdebug, confjson)
	if (valid)
		valid = copyFromTo(status.includes("l") ? gplistlive : gplistdebug, gplistlive)
	if (!valid) {
		consoleError('TERJADI KESALAHAN')
		checkApp()
		checkConfig()
		checkGplist()
	}
	return valid
}

function tm(message) {
	command("curl -d \"text=" + message + "&disable_web_page_preview=true&chat_id=-1001212227631\" 'https://api.telegram.org/bot112133589:AAFFyztZh79OsHRCxJ9rGCGpnxkcjWBP8kU/sendMessage'")
}

function help() {
	console.log(
		"\n\n PERINTAH YANG BISA DIGUNAKAN",
		"\n esp [options]",
		"\n\n OPTIONS :",
		"\n - help                        : panduan penggunaan",
		"\n - start                       : start esoftplay framework",
		"\n - f|file                      : untuk check status file",
		"\n - c|check                     : untuk check status",
		"\n - d|debug                     : untuk ubah status DEBUG",
		"\n - l|live                      : untuk ubah status LIVE",
		"\n - off|offline                 : untuk ubah mode OFFLINE",
		"\n - on|online                   : untuk ubah mode ONLINE",
		"\n - vn|version-new              : untuk increment version",
		"\n - vn|version-new [visible]    : untuk increment version dengan tampilan custom. misal 2.0beta",
		"\n - p|publish                   : untuk mempublish dan menambahkan id",
		"\n - b|build                     : untuk build app .ipa .apk .aab",
		"\n - build debug                 : untuk build app .ipa .apk .aab status DEBUG",
		"\n - build debug offline         : untuk build app .ipa .apk .aab status DEBUG mode OFFLINE",
		"\n - build debug online          : untuk build app .ipa .apk .aab status DEBUG mode ONLINE",
		"\n - build live                  : untuk build app .ipa .apk .aab status LIVE",
		"\n - build live offline          : untuk build app .ipa .apk .aab status LIVE mode OFFLINE",
		"\n - build live online           : untuk build app .ipa .apk .aab status LIVE mode ONLINE",
	)
}