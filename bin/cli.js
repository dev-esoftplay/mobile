#!/usr/bin/env node
const fs = require('fs');
const exec = require('child_process').execSync;
// const fetch = require("node-fetch")
const path = require('path');
const https = require('https');
const os = require('os')
const readline = require('readline');
const DIR = "./"
const isWeb = fs.existsSync(DIR + 'node_modules/esoftplay-web/index.js')
const appjson = DIR + "app.json"
const applive = DIR + "app.live.json"
const appdebug = DIR + "app.debug.json"
const packjson = DIR + "package.json"
const packdebugjson = DIR + "package.debug.json"
const packlivejson = DIR + "package.live.json"
const confjson = DIR + "config.json"
const conflive = DIR + "config.live.json"
const easjson = DIR + "eas.json"
const confdebug = DIR + "config.debug.json"
const gitignore = DIR + ".gitignore"
const gplist = DIR + "GoogleService-Info.plist"
const gplistlive = DIR + "GoogleService-Info.live.plist"
const gplistdebug = DIR + "GoogleService-Info.debug.plist"

var args = process.argv.slice(2);

// console.log(modpath, "sdofsjdofjsd")
async function execution() {
	command('bun ./node_modules/esoftplay/bin/connector.js')
	const preload = await preload_api()
	console.log("PRELOAD", preload)
	if (preload) {
		const cmd = `watchman watch-del ./ && watchman watch ./ && watchman -j <<< '["trigger","./",{"name":"esp","expression":["allof",["not",["dirname","node_modules"]],["not",["name","index.d.ts"]]],"command":["bun","./node_modules/esoftplay/bin/router.js"],"append_files":true}]' && bun ./node_modules/esoftplay/bin/run.js && bun ./node_modules/esoftplay/bin/gen.js && bun ./node_modules/esoftplay/bin/router.js`
		command(cmd)
	} else {
		console.log("SINI GAES")
	}
}

if (args.length == 0) {
	help()
	return
}
switch (args[0]) {
	case "a":
	case "analyze":
		command('bun ./node_modules/esoftplay/bin/analyze.js')
		break
	case "ac":
	case "analyze-clear":
		command('bun ./node_modules/esoftplay/bin/analyze.js clear')
		break;
	case "fr":
	case "fastrefresh":
		command('bun ./node_modules/esoftplay/bin/perf.js')
		break
	case "frc":
	case "fastrefresh-clear":
		command('bun ./node_modules/esoftplay/bin/perf.js clear')
		break;
	case "font":
		createFontConfig()
		break;
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
			command('esp frc')
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
	case "cm":
	case "connect-module":
		command('bun ./node_modules/esoftplay/bin/connector.js')
		break
	case "b":
	case "build":
		buildPrepare(false)
		buildPrepare(true)
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
		break;
	case 'su':
	case "setup-update":
		setupUpdate()
		break;
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

function easconfg() {
	return `{
		"cli": {
			"version": ">= 0.52.0"
		},
		"build": {
			"development": {
				"developmentClient": true,
				"distribution": "internal",
				"ios": {
					"simulator": true
				},
				"channel": "default"
			},
			"development_build": {
				"developmentClient": true,
				"distribution": "internal",
				"channel": "default"
			},
			"preview": {
				"distribution": "internal",
				"ios": {
					"simulator": true
				},
				"channel": "default"
			},
			"preview_build": {
				"distribution": "internal",
				"android": {
					"buildType": "apk"
				},
				"channel": "default"
			},
			"production": {
				"channel": "default"
			}
		},
		"submit": {
			"production": {}
		}
	}`
}



function setupUpdate() {
	command("eas update:configure")
	fs.writeFileSync(easjson, easconfg(), { encoding: 'utf8' })
	fs.writeFileSync(isDebug() ? appdebug : applive, JSON.stringify(readToJSON(appjson), undefined, 2))
}

function isDebug() {
	let cjson = readToJSON(confjson)
	let status
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
	return status == "debug"
}

function createFontConfig() {
	function removeFileExtension(filename) {
		return filename.replace(/\.[^/.]+$/, "");
	}

	if (fs.existsSync(DIR + '/assets/fonts')) {
		let fonts = {}
		let fontNames = []
		fs.readdirSync(DIR + '/assets/fonts').forEach((file) => {
			fonts[removeFileExtension(file)] = file
			fontNames.push(removeFileExtension(file))
		})
		let clive, cjson, cdebug
		if (fs.existsSync(conflive)) {
			clive = readToJSON(conflive)
			clive["config"]["fonts"] = fonts
			fs.writeFileSync(conflive, JSON.stringify(clive, undefined, 2))
		}
		if (fs.existsSync(confjson)) {
			cjson = readToJSON(confjson)
			cjson["config"]["fonts"] = fonts
			fs.writeFileSync(confjson, JSON.stringify(cjson, undefined, 2))
		}
		if (fs.existsSync(confdebug)) {
			cdebug = readToJSON(confdebug)
			cdebug["config"]["fonts"] = fonts
			fs.writeFileSync(confdebug, JSON.stringify(cdebug, undefined, 2))
		}
		fs.writeFileSync(DIR + './assets/fonts.d.ts', "export type FontName = '" + fontNames.join("'|'") + "'")
	} else {
		consoleError("./assets/fonts directory not found")
	}
}

function switchStatusAssets(status) {
	function copyFileFromTo(from, to) {
		if (fs.existsSync(from)) {
			if (fs.existsSync(to))
				command('rm ' + to)
			const oldscript = fs.readFileSync(from, 'utf8')
			const data = oldscript.match(new RegExp(/^\/\/\s{0,}export\s{1}default/gm))
			let newData = data;
			if (data && data.length > 0) {
				newData = oldscript.replace((new RegExp(/^\/\/\s{0,1}/gm)), "")
				fs.writeFileSync(to, newData)
			} else {
				command('cp ' + from + ' ' + to)
			}
		}
	}
	fs.readdirSync(DIR).forEach((file) => {
		if (!fs.statSync(DIR + '/' + file).isDirectory()) {
			if (status.includes('d'))
				if (file.match(/^.*.debug.*/g)) {
					copyFileFromTo(file, file.replace('.debug.', '.'))
				}
			if (status.includes('l'))
				if (file.match(/^.*.live.*/g)) {
					copyFileFromTo(file, file.replace('.live.', '.'))
				}
		}
	})
	fs.readdirSync(DIR + '/modules/').forEach((mod) => {
		const path = DIR + '/modules/' + mod
		if (fs.statSync(path).isDirectory())
			fs.readdirSync(path).forEach((file) => {
				if (status.includes('d'))
					if (file.match(/^.*.debug.*/g)) {
						copyFileFromTo(path + '/' + file, path + '/' + file.replace('.debug.', '.'))
					}
				if (status.includes('l'))
					if (file.match(/^.*.live.*/g)) {
						copyFileFromTo(path + '/' + file, path + '/' + file.replace('.live.', '.'))
					}
			})
	})
	fs.readdirSync(DIR + '/assets/').forEach((file) => {
		const path = DIR + '/assets/'
		if (status.includes('d'))
			if (file.match(/^.*.debug.*/g)) {
				copyFileFromTo(path + '/' + file, path + '/' + file.replace('.debug.', '.'))
			}
		if (status.includes('l'))
			if (file.match(/^.*.live.*/g)) {
				copyFileFromTo(path + '/' + file, path + '/' + file.replace('.live.', '.'))
			}
	})
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
	command("bun add esoftplay")
	if (fs.existsSync(packjson)) {
		let pack = readToJSON(packjson)
		let esplibs = Object.keys(pack.dependencies).filter((key) => key.includes("esoftplay"))

		esplibs.forEach((key) => {
			if (key != 'esoftplay') {
				if (args[1] == 'all')
					command('bun add ' + key)
				command(`bun ./node_modules/esoftplay/bin/mover.js ${key}`)
				consoleSucces(key + " succesfully implemented!")
			}
		})
	}
	command("bun install")
	command("bun ./node_modules/esoftplay/bin/locale.js")
	consoleSucces("esoftplay framework sudah diupdate!")
}

function createMaster(module_name) {
	if (module_name) { 
		const PATH = "../"
		const index = `const moduleName = "` + module_name + `"
		module.exports = { moduleName }`
		const libs = "[]"
		const mover = ``
		const packjson = `{
			"name": "esoftplay-`+ module_name + `",
			"version": "0.0.1",
			"description": "`+ module_name + ` module on esoftplay framework",
			"main": "index.js",
			"scripts": {
				"test": "echo \\"Error: no test specified\\" && exit 1",
				"postinstall": "bun ../esoftplay/bin/mover.js esoftplay-`+ module_name + `"
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
	return (isJSON && typeof txt == 'string') ? JSON.parse(txt) : txt
}

function isCustomUpdates() {
	let ajson = readToJSON(appjson)
	if (ajson.expo.hasOwnProperty("updates"))
		return ajson.expo.updates.hasOwnProperty('url') && !ajson.expo.updates.url.includes("https://u.expo.dev")
	return false
}

async function preload_api() {
	let out = true
	let cjson = await readToJSON(confjson)
	const { protocol, domain, uri, preload_api } = cjson.config
	if (preload_api?.length > 0) {
		fs.rmSync("./assets/preload_api", { recursive: true, force: true })
		fs.rmSync("./assets/preload_assets", { recursive: true, force: true })
		fs.mkdirSync("./assets/preload_api")
		fs.mkdirSync("./assets/preload_assets")
		for (const apiUri of preload_api) {
			let fullUrl = apiUri.includes("://") ? apiUri : `${(protocol || 'http')}://api.${domain}${(uri || "/")}${apiUri}`
			const lastString = fullUrl.slice(fullUrl.lastIndexOf("/") + 1) // Fixed index adjustment
			try {
				// console.log(data, fullUrl)
				const data = await fetch(fullUrl).then((res) => res.text())
				if (data) {
					try {
						if (JSON.parse(data).ok === 0) {
							consoleError(`-> 1 preload_api: ${fullUrl}`)
							fs.writeFileSync(`./assets/preload_api/${lastString}.json`, data)
							out = false
							return out
						}
					} catch (error) {
						fs.writeFileSync(`./assets/preload_api/${lastString}.json`, data)
						consoleError(`-> 2 preload_api: ${fullUrl}`)
						out = false
						return out
					}
					/* sukses */
					if (!fs.existsSync("./assets/preload_api")) {
						fs.mkdirSync('./assets/preload_api', { recursive: true })
					}
					fs.writeFileSync(`./assets/preload_api/${lastString}.json`, data)
					let objectData = JSON.parse(data)

					async function readDeepObject(obj, path = []) {
						if (Array.isArray(obj)) {
							obj.forEach(async (item, index) => {
								await readDeepObject(item, [...path, index]);
							});
						} else if (typeof obj === "object" && obj !== null) {
							Object.keys(obj).forEach(async (key) => {
								await readDeepObject(obj[key], [...path, key]);
							});
						} else if (obj != undefined) {
							const value = obj
							var cursor = path.join(".")
							if (/\.(jpg|jpeg|png|gif|bmp|webp|svg|pdf|txt)$/i.test(value)) {
								const localFilePath = await downloadFile(value, "./assets/preload_assets/" + lastString)
								objectData = LibObject.set(objectData, String(localFilePath)?.replace('assets/', ''))(cursor)
								const newData = JSON.stringify(objectData, undefined, 2)
								fs.writeFileSync(`./assets/preload_api/${lastString}.json`, newData, { encoding: "utf8" })
							}
						}
					}

					async function downloadFile(url, downloadDir = "./assets/preload_assets", retries = 3) {
						if (!fs.existsSync(downloadDir)) {
							fs.mkdirSync(downloadDir, { recursive: true });
						}
						const fileName = path.basename(url);
						const filePath = path.join(downloadDir, fileName);

						for (let attempt = 1; attempt <= retries; attempt++) {
							try {
								return await new Promise((resolve, reject) => {
									const fileStream = fs.createWriteStream(filePath);
									const request = https.get(url, (response) => {
										if (response.statusCode !== 200) {
											reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
											return;
										}

										response.pipe(fileStream);

										fileStream.on('finish', () => {
											fileStream.close(() => {
												// Validate that file is not empty
												if (fs.statSync(filePath).size > 0) {
													resolve(filePath);
												} else {
													reject(new Error(`Downloaded file is empty: ${filePath}`));
												}
											});
										});

										fileStream.on('error', (error) => {
											fileStream.close(() => reject(error));
										});
									});

									request.on('error', (error) => reject(error));
								});
							} catch (error) {
								console.error(`Attempt ${attempt} failed:`, error);
								if (attempt === retries) {
									return null; // Return null after final attempt
								}
							}
						}
					}
					// async function downloadFile(url, downloadDir = "./assets/preload_assets") {
					// 	if (!fs.existsSync("./assets/preload_assets")) {
					// 		fs.mkdirSync("./assets/preload_assets")
					// 	}
					// 	try {
					// 		const https = require('https');
					// 		const fileName = path.basename(url);
					// 		const filePath = path.join(downloadDir, fileName);
					// 		const fileStream = fs.createWriteStream(filePath);

					// 		return new Promise((resolve, reject) => {
					// 			https.get(url, (response) => {
					// 				if (response.statusCode !== 200) {
					// 					reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
					// 					return;
					// 				}
					// 				response.pipe(fileStream);
					// 				fileStream.on('finish', () => resolve(filePath));
					// 				fileStream.on('error', reject);
					// 			}).on('error', reject);
					// 		});
					// 	} catch (error) {
					// 		console.error(`Error downloading file ${url}:`, error);
					// 		return null;
					// 	}
					// }

					await readDeepObject(objectData)
					consoleSucces("-> 3 preload_api: " + fullUrl)
					/* endSukses */
				}
			} catch (error) {
				out = false
				consoleError(`-> 4 preload_api: ${fullUrl}${error}`,)
			}
		}
	}
	return out
}

async function publish(notes) {
	if (!await preload_api()) {
		return consoleError("Preload API ada yg error, tidak bisa publish")
	}
	let status = "-"
	let isCustomServer = false
	let ajson = readToJSON(appjson)
	if (ajson.expo.hasOwnProperty("updates"))
		if (ajson.expo.updates.hasOwnProperty('url') && !ajson.expo.updates.url.includes("https://u.expo.dev")) {
			if (!fs.existsSync('./code-signing')) {
				consoleError("./code-signing not found!")
				return
			}
			isCustomServer = true
			consoleSucces("START PULL OTA..")
			command('cd /var/www/html/ota && git fetch origin master && git reset --hard FETCH_HEAD && git clean -df')
			consoleSucces("END PULL OTA..")
		}
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

		let brokenConfig = undefined
		if (status != 'debug' && status != 'live') {
			brokenConfig = "Gagal publish : CONFIG tidak valid"
		}
		if (!cjson.config.salt) {
			brokenConfig = "Gagal publish : CONFIG tidak valid"
		}
		if (brokenConfig) {
			consoleError(brokenConfig)
			return
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
		if (isCustomServer) {
			if (!fs.existsSync('/var/www/html/ota/')) {
				consoleError("ota not found at /var/www/html/ota, please clone it first!")
				return
			}
			const isUpdateExist = fs.existsSync('/var/www/html/ota/updates/' + ajson.expo.runtimeVersion)
			let currentUpdate;
			let date_format_str;
			if (isUpdateExist) {
				currentUpdate = fs.readdirSync('/var/www/html/ota/updates/' + ajson.expo.runtimeVersion)[0]
				let formattedDate = new Date(currentUpdate * 1000).toLocaleString('id', {
					day: '2-digit',
					month: 'long',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false, // Use 24-hour format
					timeZone: 'Asia/Jakarta'
				});
				date_format_str = formattedDate
			}
			var out = false
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			rl.question(`
--- Detail Publish ---
Nama Aplikasi  : ${ajson.expo.name}
isDebug        : ${cjson.config.isDebug}
runtimeVersion : ${ajson.expo.runtimeVersion}
Update terakhir: ${currentUpdate ? date_format_str : '- not found'}

Pastikan data sudah benar sebelum anda melanjutkan, lanjut publish ketikkan runtimeVersion: `,
				function (input) {
					out = input
					rl.close();
				});

			rl.on("close", function () {
				if (out && out == ajson.expo.runtimeVersion) {
					const os = require('os')
					tm(os.userInfo().username + '@' + os.hostname() + " -- start publishing " + ajson.expo.name + "@" + (last_id + 1))
					fs.writeFileSync(appjson, JSON.stringify(ajson, undefined, 2))
					consoleSucces("start publishing " + status.toUpperCase() + " - PUBLISH_ID : " + (last_id + 1))
					command("rm -rf ./dist && esp start && currentPath=$(pwd) && cd /var/www/html/ota/ && npm run publish $currentPath \"" + notes + "\" && cd $currentPath && rm -rf ./dist")
					consoleSucces("Berhasil")
					var d = new Date();
					d = new Date(d.getTime() - 3000000);
					var date_format_str = d.getFullYear().toString() + "-" + ((d.getMonth() + 1).toString().length == 2 ? (d.getMonth() + 1).toString() : "0" + (d.getMonth() + 1).toString()) + "-" + (d.getDate().toString().length == 2 ? d.getDate().toString() : "0" + d.getDate().toString());
					let stringBuilder = "#" + ajson.expo.slug + "\n" + cjson.config.domain + "\n" + os.userInfo().username + '@' + os.hostname() + "\n" + date_format_str + "\nsdk: " + pack.dependencies.expo + "\nruntimeVersion: " + ajson.expo.runtimeVersion
					stringBuilder += "\nid: " + (last_id + 1)
					let esplibs = Object.keys(pack.dependencies).filter((key) => key.includes("esoftplay"))
					esplibs.forEach((key) => {
						stringBuilder += ("\n" + key + ": " + pack.dependencies[key])
					})
					stringBuilder += "\n\nversionName: " + (ajson.expo.ios.buildNumber || ajson.expo.android.versionCode) + '-' + (last_id + 1) + ""
					const { exec } = require('child_process');
					exec("publisher=$(npx expo whoami &); echo $publisher;", (error, stdout, stderr) => {
						if (error) {
							console.error(`exec error: ${error}`);
							return;
						}
						let accountName = stdout.trim();
						stringBuilder += "\npublisher: @" + accountName + "\n"
						stringBuilder += (notes != '' ? ("\n\n- " + notes) : '')
						tm(stringBuilder)
						if (notes.startsWith('*') && ajson.config.publish_id) {
							const config = readToJSON(confjson).config;
							const ajson = readToJSON(appjson);
							const url = config.publish_uri + ajson.config.publish_id
							// const fetch = require('node-fetch')
							console.log("\n\nPROCESSING FORCE UPDATE")
							fetch(url).then((res) => JSON.stringify(res.json(), undefined, 2)).then(consoleSucces)
						}
					});
				} else {
					consoleError("Build Canceled")
				}
			});
			return
		} else {
			fs.writeFileSync(appjson, JSON.stringify(ajson, undefined, 2))
			consoleSucces("start publishing " + status.toUpperCase() + " - PUBLISH_ID : " + (last_id + 1))
			command(`eas update --branch default --message "${notes}"`)
			command("rm -rf ./dist")
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
			stringBuilder += "\n\nversionName: " + (ajson.expo.ios.buildNumber || ajson.expo.android.versionCode) + '-' + (last_id + 1) + ""
			const { exec } = require('child_process');
			exec("publisher=$(npx expo whoami &); echo $publisher;", (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				let accountName = stdout.trim();
				stringBuilder += "\npublisher: @" + accountName + "\n"
				stringBuilder += (notes != '' ? ("\n\n- " + notes) : '')
				tm(stringBuilder)
				if (cjson.config.hasOwnProperty('post_publish_script')) {
					eval(cjson.config.post_publish_script)
				}
				if (notes.startsWith('*') && ajson.config.publish_id) {
					const config = readToJSON(confjson).config;
					const ajson = readToJSON(appjson);
					const url = config.publish_uri + ajson.config.publish_id
					// const fetch = require('node-fetch')
					console.log("\n\nPROCESSING FORCE UPDATE")
					fetch(url).then((res) => JSON.stringify(res.json(), undefined, 2)).then(consoleSucces)
				}
			});
		}
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
		if (isDebug()) {
			copyFromTo('./GoogleService-Info.debug.dc.plist', './GoogleService-Info.plist')
		} else {
			copyFromTo('./GoogleService-Info.live.dc.plist', './GoogleService-Info.plist')
		}
		let app = JSON.parse(txt)
		app.expo.name = app.expo.name.includes("DC|") ? app.expo.name : ("DC|" + app.expo.name)
		if (app.expo.android)
			app.expo.android.package = String(app.expo.android.package).endsWith(".dc") ? app.expo.android.package : (app.expo.android.package + ".dc")
		if (app.expo.ios)
			app.expo.ios.bundleIdentifier = String(app.expo.ios.bundleIdentifier).endsWith(".dc") ? app.expo.ios.bundleIdentifier : (app.expo.ios.bundleIdentifier + ".dc")
		if (app.expo.updates.enabled = true) {
			app.expo.updates = { enabled: false }
		}
		delete app.expo.extra
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
		if (isDebug()) {
			copyFromTo('./GoogleService-Info.debug.plist', './GoogleService-Info.plist')
			if (app.expo.name.includes('DC|'))
				copyFromTo('./app.debug.json', './app.json')
		} else {
			copyFromTo('./GoogleService-Info.live.plist', './GoogleService-Info.plist')
			if (app.expo.name.includes('DC|'))
				copyFromTo('./app.live.json', './app.json')
		}
		app.expo.name = app.expo.name.replace("DC|", "")
		if (app.expo.android)
			app.expo.android.package = String(app.expo.android.package).replace('.dc', "")
		if (app.expo.ios)
			app.expo.ios.bundleIdentifier = String(app.expo.ios.bundleIdentifier).replace(".dc", "")
		fs.writeFileSync(file, JSON.stringify(app, undefined, 2))
	} else {
		consoleError(file)
	}
}

function buildPrepare(include = true) {
	if (include) {
		command("esp start")
		if (isCustomUpdates())
			if (!fs.existsSync('./code-signing')) {
				consoleError("./code-signing not found!")
				return
			}
		if (!fs.existsSync('./assets/esoftplaymodules')) {
			fs.mkdirSync('./assets/esoftplaymodules')
			command('cp -r -v ./modules/* ./assets/esoftplaymodules')
		}

		if (fs.existsSync('./node_modules/esoftplay/modules')) {
			fs.readdirSync('./node_modules/esoftplay/modules').forEach((module) => {
				if (!module.startsWith('.')) {
					if (!fs.existsSync(`./modules/${module}`)) {
						fs.mkdirSync(`./modules/${module}`)
					}
					command(`cp -n ./node_modules/esoftplay/modules/${module}/* ./modules/${module} || true`)
				}
			});
			consoleSucces("BUILD PREPARE SUCCESS..!")
		}
		if (isCustomUpdates()) {
			let ejson = readToJSON(easjson)
			delete ejson.build.development.channel
			delete ejson.build.development_build.channel
			delete ejson.build.preview.channel
			delete ejson.build.preview_build.channel
			delete ejson.build.production.channel
			fs.writeFileSync(easjson, JSON.stringify(ejson, undefined, 2))
		}
	} else {
		configAvailable(false)
		excludeOnBuild('ios', false)
		if (fs.existsSync('./assets/esoftplaymodules')) {
			command('rm -rf ./modules && mv ./assets/esoftplaymodules modules')
			consoleSucces("BUILD PREPARE SUCCESS CANCELED..!")
		}
		else
			consoleError('')
		if (isCustomUpdates()) {
			fs.writeFileSync(easjson, easconfg())
		}
	}
	devClientPos(appjson)
}

function configAvailable(enabled) {
	function replace(_git, ignore, enabled) {
		if (enabled) {
			_git = _git.replace('\n' + ignore, '\n#' + ignore)
		} else {
			_git = _git.replace('\n#' + ignore, '\n' + ignore)
		}
		return _git
	}
	if (fs.existsSync(gitignore)) {
		let _git = fs.readFileSync(gitignore, 'utf8')
		const ignores = [
			"config.json",
			"config.live.json",
			"config.debug.json",
			"code-signing/",
			"certificate.pem"
		]
		ignores.forEach((key) => {
			_git = replace(_git, key, enabled)
		})
		fs.writeFileSync(gitignore, _git, { encoding: 'utf8' })
	} else {
		consoleError(gitignore)
	}
}

function excludeOnBuild(platform, isBackup) {
	const backupPath = './assets/p.json'
	if (!isBackup) {
		if (fs.existsSync(backupPath)) {
			fs.writeFileSync(packjson, fs.readFileSync(backupPath))
			fs.unlinkSync(backupPath)
		}
	}
	if (fs.existsSync(confjson)) {
		let cjson = readToJSON(confjson).config
		if (cjson.exclude) {
			if (cjson.exclude[platform]) {
				let excluded = cjson.exclude[platform]
				let pjson = readToJSON(packjson)
				/* backup */
				fs.writeFileSync(backupPath, JSON.stringify(pjson, undefined, 2))
				/* cleanup */
				let cleanDeps = {}
				Object.keys(pjson.dependencies).forEach((key) => {
					const value = pjson.dependencies[key]
					if (!excluded.includes(key))
						cleanDeps[key] = value
				})
				pjson.dependencies = cleanDeps
				/* override */
				fs.writeFileSync(packjson, JSON.stringify(pjson, undefined, 2))
			}
		}
	}
}

function build() {
	let cjson = readToJSON(confjson)
	let brokenConfig = undefined
	if (!cjson.config.domain) {
		brokenConfig = "Gagal build : CONFIG tidak valid"
	}
	if (!cjson.config.salt) {
		brokenConfig = "Gagal build : CONFIG tidak valid"
	}
	if (brokenConfig) {
		consoleError(brokenConfig)
		return
	}
	const local = args[1] == 'local' ? ' --local' : ''
	const Named = args[2] || ""
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
				cmd: "eas build --platform ios --profile development" + local,
				pre: () => {
					configAvailable(true)
					devClientPre(appjson)
					excludeOnBuild('ios', true)
				}
			},
			{
				name: "2. IOS (Development) - Non Simulator",
				cmd: "eas build --platform ios --profile development_build" + local,
				pre: () => {
					configAvailable(true)
					devClientPre(appjson)
					excludeOnBuild('ios', true)
				}
			},
			{
				name: "3. IOS (Preview) - Simulator",
				cmd: "eas build --platform ios --profile preview" + local,
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					excludeOnBuild('ios', true)
				}
			},
			{
				name: "4. IOS (Preview) - Non Simulator",
				cmd: "eas build --platform ios --profile preview_build" + local,
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					excludeOnBuild('ios', true)
				}
			},
			{
				name: "5. IOS (Production) - ipa",
				cmd: "eas build --platform ios --profile production" + local,
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					excludeOnBuild('ios', true)
				}
			},
			{
				name: "6. Android (Development) - apk",
				cmd: "eas build --platform android --profile development" + local,
				pre: () => {
					configAvailable(true)
					devClientPre(appjson)
					excludeOnBuild('android', true)
				}
			},
			{
				name: "7. Android (Preview) - apk",
				cmd: "eas build --platform android --profile preview" + local,
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					excludeOnBuild('android', true)
				}
			},
			{
				name: "8. Android (Production) - aab",
				cmd: "eas build --platform android --profile production" + local,
				pre: () => {
					configAvailable(true)
					devClientPos(appjson)
					excludeOnBuild('android', true)
				}
			}
		]

	if (args[0] == "build" || args[0] == "b") {
		let d = false
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		const local = args[1] == 'local' ? ' --local' : ''
		rl.question((local ? "Pilih build type dengan mode LOCAL :\n\n" : "Pilih build type :\n\n") + types.map((x) => x.name).join("\n") + '\n\nMasukkan nomor build type: ', function (idx) {
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
				excludeOnBuild('android', false)

				const cjson = readToJSON(confjson)
				const ajson = readToJSON(appjson)

				if (local) {
					const fs = require('fs');
					const path = require('path');
					const directoryPath = './'; // Replace with the path to your directory
					function getTime() {
						const adjustedDate = new Date().getTime() + 7 * 60 * 60000; // Add offset in milliseconds
						const isoStringWithGMTPlus7 = new Date(adjustedDate).toISOString();
						return isoStringWithGMTPlus7.replace('T', ' ').replace(/\.[0-9]+Z/g, "")
					}
					fs.readdir(directoryPath, (err, files) => {
						if (err) {
							console.error('Error reading directory:', err);
							return;
						}
						// Define a regular expression pattern to match file names starting with "build-"
						const regexPattern = /^build-(.+)$/;
						// Filter the file names using the pattern
						const matchingFiles = files.filter((fileName) => regexPattern.test(fileName));

						if (matchingFiles.length === 0) {
							console.log('No files matching the pattern found.');
							return;
						}
						// Extract and display the old file names
						matchingFiles.forEach((fileName) => {
							// const oldFileName = fileName.replace(regexPattern, '$1');
							let ext = fileName.split(".")
							ext.shift()
							const appname = ajson.expo.name + "-" + Named + "-" + getTime() + "." + ext.join(".")
							fs.renameSync('./' + fileName, './' + appname)
							// if (fs.existsSync('./build/post.js')) {
							// 	fs.writeFileSync("./build/latestBuildName", appname, { encoding: 'utf8' })
							// }
						});
					});
					let tmId = "-1001429450501"
					if (cjson.hasOwnProperty('config')) {
						if (cjson.config.hasOwnProperty('build')) {
							let tmid = cjson.config.build[2]
							if (tmid) tmId = tmid;
						}
					}
					const os = require('os')
					const message = " ✅ Build Success by " + os.userInfo().username + '@' + os.hostname()
					// command("curl -d \"text=" + message + "&disable_web_page_preview=true&chat_id=" + tmId + "\" 'https://api.telegram.org/bot112133589:AAFFyztZh79OsHRCxJ9rGCGpnxkcjWBP8kU/sendMessage'")
				}
				if (fs.existsSync('./build/post.js'))
					command('bun ./build/post.js')
				configAvailable(false)
				devClientPos(appjson)
				buildPrepare(false)
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
	if (valid) {
		valid = copyFromTo(status.includes("l") ? conflive : confdebug, confjson)

		const cjson = readToJSON(confjson)
		if (cjson.hasOwnProperty('config')) {
			if (cjson.config.hasOwnProperty('build')) {
				const [usr, pwd] = Object.values(cjson.config.build)
				command(`eas logout && expect -c 'spawn eas login; expect "Email or username"; send "${usr}\r"; expect "Password"; send "${pwd}\r"; expect eof;'`)
			}
			if (cjson.config.hasOwnProperty('post_script')) {
				eval(cjson.config.post_script)
			}
		}
		if (valid) {

		}
	}
	if (valid && fs.existsSync(gplist))
		valid = copyFromTo(status.includes("l") ? gplistlive : gplistdebug, gplist)
	switchStatusAssets(status)
	if (!valid) {
		consoleError('TERJADI KESALAHAN')
		checkApp()
		checkConfig()
		checkGplist()
	}
	const hasSeparatePackageJson = status.includes("l") ? fs.existsSync(packlivejson) : fs.existsSync(packdebugjson)
	if (hasSeparatePackageJson) {
		command(`rm -rf ${DIR}node_modules ${DIR}package-lock.json ${DIR}yarn.lock ${DIR}bun.lockb && bun install`)
	}
	return valid
}

function tm(message) {
	command("curl -d \"text=" + message + "&disable_web_page_preview=true&chat_id=-1001227788828\" 'https://api.telegram.org/bot112133589:AAFENoEa4IY_YDam8YDoltqayawGyYPDBN8/sendMessage'")
}

class LibObject {
	#value = undefined;

	constructor(array) {
		this.#value = array;
		this.value = this.value.bind(this);
		this.push = this.push.bind(this);
		this.unset = this.unset.bind(this);
		this.unshift = this.unshift.bind(this);
		this.set = this.set.bind(this);
		this.splice = this.splice.bind(this);
		this.update = this.update.bind(this);
		this.assign = this.assign.bind(this);
		this.cursorBuilder = this.cursorBuilder.bind(this);
	}

	cursorBuilder(command, array, value, ...values) {
		return (cursor, ...cursors) => {
			let pathToUpdate = [cursor, ...cursors].filter(x => x != undefined).join('.');
			let allValues = [value, ...values].filter(x => x != undefined);
			let spec = {};
			if (pathToUpdate !== '') spec = { [pathToUpdate]: [command, ...allValues] };
			else spec = [command, ...allValues];
			this.#value = update(array, spec);
			return this;
		};
	}

	push(value, ...values) {
		return this.cursorBuilder("push", this.#value, value, ...values);
	}

	unshift(value, ...values) {
		return this.cursorBuilder("unshift", this.#value, value, ...values);
	}

	splice(index, deleteCount, value, ...values) {
		return this.cursorBuilder("splice", this.#value, index, deleteCount, value, ...values);
	}

	unset(index, ...indexs) {
		return this.cursorBuilder("unset", this.#value, index, ...indexs);
	}

	set(value) {
		return this.cursorBuilder("set", this.#value, value);
	}

	update(callback) {
		return this.cursorBuilder("batch", this.#value, callback);
	}

	assign(obj1) {
		return this.cursorBuilder("assign", this.#value, deepCopy(obj1));
	}

	removeKeys(deletedItemKeys) {
		return this.cursorBuilder("batch", this.#value, arr => _removeKeys(arr, deletedItemKeys));
	}

	replaceItem(filter, newItem) {
		return this.cursorBuilder("batch", this.#value, arr => _replaceItem(arr, filter, newItem));
	}

	value() {
		return this.#value;
	}

	static push(array, value, ...values) {
		return cursorBuilder("push", array, value, ...values);
	}

	static unshift(array, value, ...values) {
		return cursorBuilder("unshift", array, value, ...values);
	}

	static removeKeys(arrayOrObj, deletedItemKeys) {
		return cursorBuilder("batch", arrayOrObj, arrOrObj => _removeKeys(arrOrObj, deletedItemKeys));
	}

	static replaceItem(arrayOrObj, filter, newItem) {
		return cursorBuilder("batch", arrayOrObj, arrOrObj => _replaceItem(arrOrObj, filter, newItem));
	}

	static splice(array, index, deleteCount, value, ...values) {
		return cursorBuilder("splice", array, index, deleteCount, value, ...values);
	}

	static unset(obj, index, ...indexs) {
		return cursorBuilder("unset", obj, index, ...indexs);
	}

	static set(obj, value) {
		return cursorBuilder("set", obj, value);
	}

	static update(obj, callback) {
		return cursorBuilder("batch", obj, callback);
	}

	static assign(obj, obj1) {
		return cursorBuilder("assign", obj, deepCopy(obj1));
	}
}

function cursorBuilder(command, array, value, ...values) {
	const update = require('immhelper').default
	return function (cursor, ...cursors) {
		let pathToUpdate = [cursor, ...cursors].filter(x => x != undefined).join('.');
		let allValues = [value, ...values].filter(x => x != undefined);
		let spec = {};
		if (pathToUpdate !== '') spec = { [pathToUpdate]: [command, ...allValues] };
		else spec = [command, ...allValues];
		return update(array, spec);
	};
}

function _removeKeys(objOrArr, keysToRemove) {
	if (Array.isArray(objOrArr)) {
		return objOrArr.map(obj => {
			let newObj = { ...obj };
			keysToRemove.forEach(key => {
				delete newObj[key];
			});
			return newObj;
		});
	} else {
		let newObj = { ...objOrArr };
		keysToRemove.forEach(key => {
			delete newObj[key];
		});
		return newObj;
	}
}

function _replaceItem(data, predicate, newItem) {
	if (Array.isArray(data)) {
		return data.map((item, index) => (predicate(item, index) ? newItem : item));
	} else if (typeof data === 'object' && data !== null) {
		let newData = { ...data };
		Object.keys(newData).forEach((key, index) => {
			if (predicate(newData[key], index)) {
				newData[key] = newItem;
			}
		});
		return newData;
	} else return data;
}

function deepCopy(o) {
	switch (typeof o) {
		case 'object':
			if (o === null) return null;
			if (Array.isArray(o)) return o.map(item => deepCopy(item));
			let newO = Object.create(Object.getPrototypeOf(o));
			for (let key in o) {
				if (Object.prototype.hasOwnProperty.call(o, key)) {
					newO[key] = deepCopy(o[key]);
				}
			}
			return newO;
		default:
			return o;
	}
}


function help() {
	console.log(
		"\n\n PERINTAH YANG BISA DIGUNAKAN",
		"\n esp [options]",
		"\n\n OPTIONS :",
		"\n - help                        : panduan penggunaan",
		"\n - a|analyze                   : untuk menambahkan view render counter di semua component",
		"\n - ac|analyze-clear            : untuk menghapus view render counter di semua component",
		"\n - font                        : untuk mengaktifkan font dari ./assets/fonts",
		"\n - fr|fastrefresh              : untuk mengaktfikan fast refresh di semua component",
		"\n - frc|fastrefresh-clear       : untuk menonaktifkan fast refresh di semua component",
		"\n - su|setup-update             : untuk setup update esp module dengan EAS UPDATE SERVICES",
		"\n - u|update                    : untuk update esp module ke versi terakhir",
		"\n - update all                  : untuk update semua esp module ke versi terakhir",
		"\n - start                       : start esoftplay framework",
		"\n - b|build                     : untuk build app .ipa .apk .aab",
		"\n - bp|build-prepare            : untuk prepare for esp b",
		"\n - bc|build-cancel             : untuk cancel build prepare",
		"\n - f|file                      : untuk check status file",
		"\n - c|check                     : untuk check status",
		"\n - cm|connect-module           : untuk update module berdasarkan source",
		"\n - create-master [moduleName]  : untuk create master module terpisah",
		"\n - d|debug                     : untuk ubah status DEBUG",
		"\n - l|live                      : untuk ubah status LIVE",
		"\n - off|offline                 : untuk ubah mode OFFLINE",
		"\n - on|online                   : untuk ubah mode ONLINE",
		"\n - vn|version-new              : untuk increment version",
		"\n - vn|version-new [visible]    : untuk increment version dengan tampilan custom. misal 2.0beta",
		"\n - p|publish [notes]           : untuk mempublish dan menambahkan id",
		"\n - bcl|backup-config-live      : untuk backup config live",
		"\n - bcd|backup-config-debug     : untuk backup config debug"
	)
}