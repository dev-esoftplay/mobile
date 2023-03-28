#!/usr/bin/env node
const fs = require('fs');
const exec = require('child_process').execSync;
const execAsync = require('child_process').exec;
const path = require('path');
const os = require('os')
const readline = require('readline');
const DIR = "./"
const isWeb = fs.existsSync(DIR + 'node_modules/esoftplay-web/index.js')
const appjson = DIR + "app.json"
const applive = DIR + "app.live.json"
const appdebug = DIR + "app.debug.json"
const packjson = DIR + "package.json"
const confjson = DIR + "config.json"
const conflive = DIR + "config.live.json"
const confdebug = DIR + "config.debug.json"
const gitignore = DIR + ".gitignore"

const gplist = DIR + "GoogleService-Info.plist"
const gplistlive = DIR + "GoogleService-Info.live.plist"
const gplistdebug = DIR + "GoogleService-Info.debug.plist"

var args = process.argv.slice(2);

// console.log(modpath, "sdofsjdofjsd")
function execution() {
	const cmd = `watchman watch-del ./ && watchman watch ./ && watchman -j <<< '["trigger","./",{"name":"esp","expression":["allof",["not",["dirname","node_modules"]],["not",["name","index.d.ts"]]],"command":["node","./node_modules/esoftplay/bin/router.js"],"append_files":true}]' && node ./node_modules/esoftplay/bin/router.js`
	command(cmd)
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
		if (isWeb) {
			consoleError("Not supported in esoftplay web !")
			return
		}
		let notes = ''
		if (args[1]) {
			notes = args.slice(1, args.length).join(' ')
			publish(notes)
		} else {
			consoleError("silahkan masukkan notes publish, wajib guys")
		}
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
	case "bc":
	case "build-cancel":
		buildPrepare(false)
		break;
	case "bp":
	case "build-prepare":
		buildPrepare(true)
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
		if (isWeb) {
			consoleError("Not supported in esoftplay web !")
			return
		}
		switchMode("off")
		consoleSucces("App now is in OFFLINE mode")
		break
	case "u":
	case "update":
		update()
		break
	case "on":
	case "online":
		if (isWeb) {
			consoleError("Not supported in esoftplay web !")
			return
		}
		switchMode("on")
		consoleSucces("App now is in ONLINE mode")
		break;
	case "create-master":
		createMaster(args[1])
		break;
	case "start":
		jsEng(appjson, false)
		jsEng(appdebug, false)
		jsEng(applive, false)
		excludeModules()
		execution();
		break;
	case "bcl":
	case "backup-config-live":
		configUpdate('live');
		break;
	case "bcd":
	case "backup-config-debug":
		configUpdate('debug');
		break;
	default:
		help()
		break;
}

function excludeModules() {
	let cjson = readToJSON(confjson)
	if (cjson.config.hasOwnProperty('excludeModules')) {
		if (cjson.config.excludeModules) {
			const allmodules = cjson.config.excludeModules
			if (allmodules.length > 0) {
				consoleSucces('\nSuccess to exclude this modules:')
				allmodules.forEach((mod) => {
					const fileTsxPath = DIR + 'node_modules/esoftplay/modules/' + mod + '.tsx'
					const fileTsPath = DIR + 'node_modules/esoftplay/modules/' + mod + '.ts'
					const fileJsPath = DIR + 'node_modules/esoftplay/modules/' + mod + '.js'
					if (fs.existsSync(fileTsxPath)) fs.unlinkSync(fileTsxPath)
					if (fs.existsSync(fileTsPath)) fs.unlinkSync(fileTsPath)
					if (fs.existsSync(fileJsPath)) fs.unlinkSync(fileJsPath)
					consoleSucces('- ' + mod)
				})
			}
		}
	}
}

function consoleFunc(msg, success) {
	if (success) {
		consoleSucces(msg)
	} else {
		consoleError(msg)
	}
}


function jsEng(file, isHermes) {
	if (fs.existsSync(file)) {
		var txt = fs.readFileSync(file, 'utf8');
		let isJSON = txt.startsWith('{') || txt.startsWith('[')
		if (!isJSON) {
			consoleError('app.json tidak valid')
			return
		}
		let app = JSON.parse(txt)
		app.expo.jsEngine = isHermes ? "hermes" : "hermes"
		fs.writeFileSync(file, JSON.stringify(app, undefined, 2))
	} else {
		consoleError(file)
	}
}

function configUpdate(state) {
	let _path;
	let _slug
	if (state == 'live') {
		_path = path.resolve(conflive);
		_slug = readToJSON(applive).expo.slug
	}
	if (state == 'debug') {
		_path = path.resolve(confdebug);
		_slug = readToJSON(appdebug).expo.slug
	}
	if (_path && _slug)
		command(`curl -v -F 'chat_id=-496494136' -F caption='#` + _slug + `\n` + os.userInfo().username + '@' + os.hostname() + `' -F document=@` + _path + ` https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendDocument`)
	else
		consoleError(_path, _slug)
}

function update() {
	command("yarn upgrade esoftplay --latest")
	if (fs.existsSync(packjson)) {
		let pack = readToJSON(packjson)
		let esplibs = Object.keys(pack.dependencies).filter((key) => key.includes("esoftplay"))

		esplibs.forEach((key) => {
			if (key != 'esoftplay') {
				if (args[1] == 'all')
					command('yarn upgrade ' + key + ' --latest')
				command("cd node_modules/" + key + " && node mover.js")
				consoleSucces(key + " succesfully implemented!")
			}
		})
	}
	consoleSucces("esoftplay framework sudah diupdate!")
}

function createMaster(module_name) {
	if (module_name) {
		const PATH = "../"
		const index = `const moduleName = "` + module_name + `"
		module.exports = { moduleName }`
		const libs = "[]"
		const mover = `const fs = require('fs');
		const shell = require('child_process').execSync;
		const merge = require('lodash/merge')
		const { moduleName } = require("./index")
		const assetsFonts = "assets/fonts"
		/* copy directory */
		if (fs.existsSync('../esoftplay/esp.ts')) {
			if (fs.existsSync('../esoftplay/modules/' + moduleName))
				shell('rm -r ../esoftplay/modules/' + moduleName)
			shell("cp -r ./" + moduleName + " ../esoftplay/modules/")
		} else {
			throw "Mohon install esoftplay package terlebih dahulu"
		}

		function readAsJson(path) {
			let out = ""
			try {
				out = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))
			} catch(e) {

			}
			return out;
		}	

		function injectConfig(configPath) {
			if (fs.existsSync(configPath)) {
				const exsConf = readAsJson(configPath)
				const conf = readAsJson("./config.json")
				let _cf = merge({ config: conf }, exsConf)
				fs.writeFileSync(configPath, JSON.stringify({..._cf}, undefined, 2))
			}
		}

		/* injectConfig */
		injectConfig("../../config.json")
		injectConfig("../../config.live.json")
		injectConfig("../../config.debug.json")

		/* move assets */
		if (fs.existsSync("./assets/")) {
			if (!fs.existsSync("../../assets/" + moduleName))
				shell("mkdir -p ../../assets/" + moduleName)
			try {
				shell("cp -r -n ./assets/* ../../assets/" + moduleName + "/")
			} catch (error) { }
		}

		if (fs.existsSync("./fonts/")) {
			if (!fs.existsSync("../../" + assetsFonts))
				shell("mkdir -p ../../" + assetsFonts)
			try {
				shell("cp -r -n ./fonts/* ../../" + assetsFonts + "/")
			} catch (error) { }
		}

		/* inject lang */
		if (fs.existsSync("./id.json")) {
			let moduleLang = readAsJson("./id.json")
			if (fs.existsSync("../../assets/locale/id.json")) {
				let projectLang = readAsJson("../../assets/locale/id.json")
				let _lg = merge(moduleLang, projectLang)
				moduleLang = {..._lg}
			}
			fs.writeFileSync("../../assets/locale/id.json", JSON.stringify(moduleLang, undefined, 2))
		}

		/* inject libs */
		if (fs.existsSync("./libs.json")) {
			let libs = readAsJson("./libs.json")
			let libsToSkip = []
			libs.forEach((element, index) => {
				console.log(element.split("@")[0])
				if (fs.existsSync("../../node_modules/" + element.split("@")[0])) {
					libsToSkip.push(element)
				}
			})
			if (libsToSkip.length > 0) {
				libsToSkip.forEach((lib) => {
					libs = libs.filter((x) => x != lib)
					console.log(lib + " is exist, Skipped")
				})
			}
			if (libs.length > 0) {
				console.log("mohon tunggu ..")
				console.log("installing \\n" + libs.join("\\n"))
				shell("cd ../../ && expo install " + libs.join(" && expo install "))
			}
			console.log("Success..!")
		}`
		const packjson = `{
			"name": "esoftplay-`+ module_name + `",
			"version": "0.0.1",
			"description": "`+ module_name + ` module on esoftplay framework",
			"main": "index.js",
			"scripts": {
				"test": "echo \\"Error: no test specified\\" && exit 1",
				"postinstall": "node ./mover.js"
			},
			"keywords": [
				"espftplay-`+ module_name + `",
				"esoftplay"
			],
			"author": "kholil@fisip.net",
			"license": "GPL-3.0"
		}`
		const publisher = `// publsiher

		const { moduleName } = require("./index")
		const fs = require('fs');
		const shell = require('child_process').execSync;
		const assetsModule = "assets/" + moduleName
		const assetsFonts = "assets/fonts"

		/* copy module */
		if (fs.existsSync("./" + moduleName))
			shell("rm -r ./" + moduleName)
		shell("cp -r ../mobile/modules/" + moduleName + " ./")

		/* copy assets */
		if (fs.existsSync("./assets"))
			shell("rm -r ./assets")
		shell("mkdir -p assets")
		if (fs.existsSync('../mobile/' + assetsModule + '/'))
			shell("cp -r ../mobile/" + assetsModule + "/ ./assets/")

		/* copy fonts */
		if (fs.existsSync("./fonts"))
			shell("rm -r ./fonts")
		shell("mkdir -p fonts")
		if (fs.existsSync('../mobile/' + assetsFonts + '/'))
			shell("cp -r ../mobile/" + assetsFonts + "/* ./fonts/")

		/* copy lang */
		if (fs.existsSync("../mobile/assets/locale/id.json")) {
			if (fs.existsSync("./id.json"))
				shell("rm ./id.json")
			shell("cp ../mobile/assets/locale/id.json .")
		}

		/* copy config */
		if (fs.existsSync("../mobile/config.json")) {
			const confMobile = require("../mobile/config.json")
			if (confMobile.config.hasOwnProperty(moduleName)) {
				const confMaster = { [moduleName]: confMobile.config[moduleName] }
				fs.writeFileSync("./config.json", JSON.stringify(confMaster, undefined, 2))
			}
			/* copy config font */
			if (confMobile.config.hasOwnProperty("fonts")) {
				const config = require("./config.json")
				const confMaster = { ['fonts']: confMobile.config['fonts'] }
				fs.writeFileSync("./config.json", JSON.stringify(Object.assign(config, confMaster), undefined, 2))
			}
		}

		if (fs.existsSync("./package.json")) {
			const packJson = require("./package.json")
			const letterVersion = "abcdefghijklmnopqrstuvwxyz"
			const version = packJson.version
			const letter = version.match(/([a-z])/g)
			const number = version.replace(/-/g, "").replace(letter, "")
			let nextLetter = ""
			let nextNumber = number.split(".")[2]
			let nextVersion = number.split(".")[0] + "." + number.split(".")[1] + "."
			if (!letter) {
				nextLetter = letterVersion[0]
				nextVersion += nextNumber
				nextVersion += "-" + nextLetter
			} else if (letter != "z") {
				nextLetter = letterVersion[letterVersion.indexOf(String(letter)) + 1]
				nextVersion += nextNumber
				nextVersion += "-" + nextLetter
			} else {
				nextNumber = Number(nextNumber) + 1
				nextVersion += nextNumber
			}

			const newPackJson = { ...packJson, version: nextVersion }
			fs.writeFileSync("./package.json", JSON.stringify(newPackJson, undefined, 2))
			shell("npm publish")
			console.log("\nnpm install --save esoftplay-" + moduleName + "@" + nextVersion + "\n")
		}`
		if (!fs.existsSync(PATH + "master/")) {
			fs.mkdirSync(PATH + "master")
			fs.mkdirSync(PATH + "master/assets")
			fs.mkdirSync(PATH + "master/" + module_name)
			fs.writeFileSync(PATH + "master/index.js", index)
			fs.writeFileSync(PATH + "master/config.json", `{}`)
			fs.writeFileSync(PATH + "master/libs.json", libs)
			fs.writeFileSync(PATH + "master/mover.js", mover)
			fs.writeFileSync(PATH + "master/package.json", packjson)
			fs.writeFileSync(PATH + "master/publisher.js", publisher)
			consoleSucces("Success create master for module: " + module_name + " ..!")
		} else {
			consoleError("Master " + module_name + " already exist!")
		}
	} else {
		consoleError("Please insert moduleName")
	}
}

function consoleError(msg) {
	console.log("\x1b[31m", msg + " ✘", "\x1b[0m")
}

function consoleSucces(msg) {
	console.log("\x1b[32m", msg + " ✔", "\x1b[0m")
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

function publish(notes) {
	jsEng(appjson, true)
	jsEng(appdebug, true)
	jsEng(applive, true)
	let status = "-"
	let ajson = readToJSON(appjson)
	let pack = readToJSON(packjson)
	if (fs.existsSync(confjson)) {
		let cjson = readToJSON(confjson)
		let clive
		let cdebug
		let alive
		let adebug
		if (fs.existsSync(conflive)) {
			clive = readToJSON(conflive)
		}
		if (fs.existsSync(applive)) {
			alive = readToJSON(applive)
		}
		if (fs.existsSync(confdebug)) {
			cdebug = readToJSON(confdebug)
		}
		if (fs.existsSync(appdebug)) {
			adebug = readToJSON(appdebug)
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
			let migratedPublishId = 1
			if (clive.config.hasOwnProperty('publish_id')) {
				migratedPublishId = clive.config.publish_id
				delete clive.config.publish_id
			}
			if (!alive.hasOwnProperty('config')) {
				alive.config = {}
			}
			if (!alive.config.hasOwnProperty('publish_id')) {
				alive.config.publish_id = migratedPublishId
			} else {
				last_id = alive.config.publish_id || migratedPublishId
				alive.config.publish_id = last_id + 1
			}
			fs.writeFileSync(applive, JSON.stringify(alive, undefined, 2))
			fs.writeFileSync(conflive, JSON.stringify(clive, undefined, 2))
		} else if (status == "debug") {
			let migratedPublishId = 1
			if (cdebug.config.hasOwnProperty('publish_id')) {
				migratedPublishId = cdebug.config.publish_id
				delete cdebug.config.publish_id
			}
			if (!adebug.hasOwnProperty('config')) {
				adebug.config = {}
			}
			if (!adebug.config.hasOwnProperty('publish_id')) {
				adebug.config.publish_id = migratedPublishId
			} else {
				last_id = adebug.config.publish_id || migratedPublishId
				adebug.config.publish_id = last_id + 1
			}
			fs.writeFileSync(appdebug, JSON.stringify(adebug, undefined, 2))
			fs.writeFileSync(confdebug, JSON.stringify(cdebug, undefined, 2))
		}
		if (!ajson.hasOwnProperty('config')) {
			ajson.config = {}
		}
		ajson.config.publish_id = last_id + 1
		fs.writeFileSync(appjson, JSON.stringify(ajson, undefined, 2))
		consoleSucces("start publishing " + status.toUpperCase() + " - PUBLISH_ID : " + (last_id + 1))
		command("expo p")
		consoleSucces("Berhasil")
		const os = require('os')
		var d = new Date();
		d = new Date(d.getTime() - 3000000);
		var date_format_str = d.getFullYear().toString() + "-" + ((d.getMonth() + 1).toString().length == 2 ? (d.getMonth() + 1).toString() : "0" + (d.getMonth() + 1).toString()) + "-" + (d.getDate().toString().length == 2 ? d.getDate().toString() : "0" + d.getDate().toString());
		let stringBuilder = "#" + ajson.expo.slug + "\n" + cjson.config.domain + "\n" + os.userInfo().username + '@' + os.hostname() + "\n" + date_format_str + "\nsdk: " + pack.dependencies.expo + "\nruntimeVersion: " + ajson.expo.runtimeVersion
		stringBuilder += "\nid: " + (last_id + 1)
		let esplibs = Object.keys(pack.dependencies).filter((key) => key.includes("esoftplay"))
		esplibs.forEach((key) => {
			stringBuilder += ("\n" + key + ": " + pack.dependencies[key])
		})
		stringBuilder += (notes != '' ? ("\n\n- " + notes) : '')
		tm(stringBuilder)
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
		output['runtimeVersion'] = ajson.expo.runtimeVersion
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
	if (os.type() == 'Darwin') {
		exec(command, { stdio: ['inherit', 'inherit', 'inherit'] });
	} else {
		exec(command, {
			shell: '/bin/bash',
			stdio: ['inherit', 'inherit', 'inherit']
		});
	}
}


function devClientPre(file) {
	if (fs.existsSync(file)) {
		var txt = fs.readFileSync(file, 'utf8');
		let isJSON = txt.startsWith('{') || txt.startsWith('[')
		if (!isJSON) {
			consoleError('app.json tidak valid')
			return
		}
		let app = JSON.parse(txt)
		app.expo.name = app.expo.name.includes("DC-") ? app.expo.name : ("DC-" + app.expo.name)
		fs.writeFileSync(file, JSON.stringify(app, undefined, 2))
	} else {
		consoleError(file)
	}
}
function devClientPos(file) {
	if (fs.existsSync(file)) {
		var txt = fs.readFileSync(file, 'utf8');
		let isJSON = txt.startsWith('{') || txt.startsWith('[')
		if (!isJSON) {
			consoleError('app.json tidak valid')
			return
		}
		let app = JSON.parse(txt)
		app.expo.name = app.expo.name.replace("DC-", "")
		fs.writeFileSync(file, JSON.stringify(app, undefined, 2))
	} else {
		consoleError(file)
	}
}

function buildPrepare(include = true) {
	if (include) {
		if (!fs.existsSync('./assets/esoftplaymodules')) {
			fs.mkdirSync('./assets/esoftplaymodules')
			command('cp -r ./modules/* ./assets/esoftplaymodules')
		}

		if (fs.existsSync('./node_modules/esoftplay/modules')) {
			let comm = []
			fs.readdirSync('./node_modules/esoftplay/modules').forEach((module) => {
				if (!module.startsWith('.')) {
					if (!fs.existsSync(`./modules/${module}`)) {
						fs.mkdirSync(`./modules/${module}`)
					}
					comm.push(`cp -n ./node_modules/esoftplay/modules/${module}/* ./modules/${module}`)
				}
			});
			// comm.push('cp ./node_modules/esoftplay/libs/worker.tsx ./assets/')
			// comm.push('node ./node_modules/esoftplay/assets/prepare.mjs')
			consoleSucces("\n\nPLEASE COPY AND EXECUTE THE FOLLOWING COMMAND\n\n" + comm.join('\n') + "\n")
		}
	} else {
		if (fs.existsSync('./assets/esoftplaymodules'))
			command('rm -rf modules && mv ./assets/esoftplaymodules modules && rm -f ./assets/worker.tsx && node ./node_modules/esoftplay/assets/cancel.mjs')
		else
			consoleError('')
	}
}

function configAvailable(enabled) {
	if (fs.existsSync(gitignore)) {
		let _git = fs.readFileSync(gitignore, 'utf8')
		var ignore = "config.json"
		var notignore = "#config.json"
		if (enabled) {
			_git = _git.replace(ignore, notignore)
		} else {
			_git = _git.replace(notignore, ignore)
		}
		var ignore = "config.live.json"
		var notignore = "#config.live.json"
		if (enabled) {
			_git = _git.replace(ignore, notignore)
		} else {
			_git = _git.replace(notignore, ignore)
		}
		var ignore = "config.debug.json"
		var notignore = "#config.debug.json"
		if (enabled) {
			_git = _git.replace(ignore, notignore)
		} else {
			_git = _git.replace(notignore, ignore)
		}
		fs.writeFileSync(gitignore, _git, { encoding: 'utf8' })
	} else {
		consoleError(gitignore)
	}
}

function build() {
	const types = isWeb
		?
		[
			{
				name: "1. Web (for Hosting)",
				cmd: "npx expo export:web",
				pre: () => {

				}
			},
		]
		:
		[
			{
				name: "1. IOS (Development) - Simulator",
				cmd: "eas build --platform ios --profile development",
				pre: () => {
					configAvailable(true)
					devClientPre(appjson)
					jsEng(appjson, false)
					jsEng(appdebug, false)
					jsEng(applive, false)
					consoleSucces("Hermes dinonaktifkan")
				}
			},
			{
				name: "2. IOS (Preview) - Simulator",
				cmd: "eas build --platform ios --profile preview",
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					jsEng(appjson, true)
					jsEng(appdebug, true)
					jsEng(applive, true)
					consoleSucces("Hermes diaktifkan")
				}
			},
			{
				name: "3. IOS (Preview) - Non Simulator",
				cmd: "eas build --platform ios --profile preview_build",
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					jsEng(appjson, true)
					jsEng(appdebug, true)
					jsEng(applive, true)
					consoleSucces("Hermes diaktifkan")
				}
			},
			{
				name: "4. IOS (Production) - ipa",
				cmd: "eas build --platform ios --profile production",
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					jsEng(appjson, true)
					jsEng(appdebug, true)
					jsEng(applive, true)
					consoleSucces("Hermes diaktifkan")
				}
			},
			{
				name: "5. Android (Development) - apk",
				cmd: "eas build --platform android --profile development",
				pre: () => {
					configAvailable(true)
					devClientPre(appjson)
					jsEng(appjson, false)
					jsEng(appdebug, false)
					jsEng(applive, false)
					consoleSucces("Hermes dinonaktifkan")
				}
			},
			{
				name: "6. Android (Preview) - apk",
				cmd: "eas build --platform android --profile preview",
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					jsEng(appjson, true)
					jsEng(appdebug, true)
					jsEng(applive, true)
					consoleSucces("Hermes diaktifkan")
				}
			},
			{
				name: "7. Android (Production) - aab",
				cmd: "eas build --platform android --profile production",
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					jsEng(appjson, true)
					jsEng(appdebug, true)
					jsEng(applive, true)
					consoleSucces("Hermes diaktifkan")
				}
			}
		]

	if (args[0] == "build" || args[0] == "b") {
		let d = false
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question("Pilih build type :\n\n" + types.map((x) => x.name).join("\n") + '\n\nMasukkan nomor build type: ', function (idx) {
			d = types[idx - 1]
			rl.close();
		});

		rl.on("close", function () {
			if (d) {
				let cmd = d.cmd
				let pre = d.pre
				if (pre) pre()
				consoleSucces("⚙⚙⚙ ... \n" + cmd)
				command(cmd)
				if (fs.existsSync('./build/post.js'))
					command('node ./build/post.js')
				configAvailable(false)
				devClientPos(appjson)
			} else if (d === false) {
				consoleError("Build Canceled")
			} else {
				consoleError("Build type tidak ditemukan")
			}
		});

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
		// app.expo.runtimeVersion = String(lastVersion + 1)
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
	if (valid && fs.existsSync(gplist))
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
	command("curl -d \"text=" + message + "&disable_web_page_preview=true&chat_id=-1001227788828\" 'https://api.telegram.org/bot112133589:AAFFyztZh79OsHRCxJ9rGCGpnxkcjWBP8kU/sendMessage'")
}

function help() {
	console.log(
		"\n\n PERINTAH YANG BISA DIGUNAKAN",
		"\n esp [options]",
		"\n\n OPTIONS :",
		"\n - help                        : panduan penggunaan",
		"\n - u|update                    : untuk update esp module ke versi terakhir",
		"\n - u|update all                : untuk update semua esp module ke versi terakhir",
		"\n - start                       : start esoftplay framework",
		"\n - b|build                     : untuk build app .ipa .apk .aab",
		"\n - bp|build-prepare            : untuk prepare for esp b",
		"\n - bc|build-cancel             : untuk cancel build prepare",
		"\n - f|file                      : untuk check status file",
		"\n - c|check                     : untuk check status",
		"\n - create-master [moduleName]  : untuk create master module terpisah",
		"\n - d|debug                     : untuk ubah status DEBUG",
		"\n - l|live                      : untuk ubah status LIVE",
		"\n - off|offline                 : untuk ubah mode OFFLINE",
		"\n - on|online                   : untuk ubah mode ONLINE",
		"\n - vn|version-new              : untuk increment version",
		"\n - vn|version-new [visible]    : untuk increment version dengan tampilan custom. misal 2.0beta",
		"\n - p|publish [notes]           : untuk mempublish dan menambahkan id",
		"\n - bcl|backup-config-live      : untuk backup config live",
		"\n - bcd|backup-config-debug     : untuk backup config debug",
		// "\n - build debug                 : untuk build app .ipa .apk .aab status DEBUG",
		// "\n - build debug offline         : untuk build app .ipa .apk .aab status DEBUG mode OFFLINE",
		// "\n - build debug online          : untuk build app .ipa .apk .aab status DEBUG mode ONLINE",
		// "\n - build live                  : untuk build app .ipa .apk .aab status LIVE",
		// "\n - build live offline          : untuk build app .ipa .apk .aab status LIVE mode OFFLINE",
		// "\n - build live online           : untuk build app .ipa .apk .aab status LIVE mode ONLINE",
	)
}