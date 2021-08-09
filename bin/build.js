#!/usr/bin/env node
// @ts-check
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const DIR = "../../"
const packjson = DIR + "package.json"
const appjson = DIR + "app.json"
const confjson = DIR + "config.json"
const gitignore = DIR + ".gitignore"
const tsconfig = DIR + "tsconfig.json"
const appjs = DIR + "App.js"
const appts = DIR + "App.tsx"
const pathScript = DIR + "node_modules/react-native-scripts/build/bin/react-native-scripts.js"
const pathJSTimer = DIR + "node_modules/react-native/Libraries/Core/Timers/JSTimers.js"

/**
 * function ini untuk mengambil name autocomplete dari @expo/vector-icons untuk library LibIcon
 * function akan di injectkan di folder @expo/vector-icons/build dengan nama file esoftplay_icons.ts
 * function ini hanya akan dieksekusi sekali saat install esoftplay framework
*/

if (fs.existsSync(packjson)) {
	let txt = fs.readFileSync(packjson, 'utf8');
	let $package = JSON.parse(txt);
	let rewrite = false;
	let args = process.argv.slice(2);


	/* ADD SCRIPTS.PRESTART AND SCRIPTS.POSTSTOP */
	if (fs.existsSync(pathScript)) {
		let $script = fs.readFileSync(pathScript, 'utf8');

		/* Update react-native-scripts */
		let code1 = "// the command is valid"
		let code2 = "";
		let match = $script.match(new RegExp(code1 + "(\s{0,}\n\s{0,}[^\n]+)\n")); // mengambil 1 baris setelah code1
		let $script2 = $script;
		let espCode = false;
		if (match) {
			if (args[0] == "install") {
				let reg = new RegExp(/(\[.*?\),)/g) // mengambil argument ke 2 dari .sync()
				let tag = match[1].match(reg)
				if (tag) {
					if (!tag[0].match(/esoftplay/)) {
						espCode = match[1].replace(reg, "['./node_modules/.bin/esoftplay', script],") // ganti argument ke 2 menjadi milik esoftplay
						code2 = code1 + espCode;
						$script2 = $script.replace(code1, code2) // masukkan code ke dalam script setelah argument ke 2 di ganti ke esoftplay
					}
				}
			} else
				if (args[0] == "uninstall") {
					if (match[1].match(/esoftplay/)) {
						$script2 = $script.replace(match[1], code2) // hapus script dari esoftplay
					}
				}
		}
		if ($script2 != $script) {
			fs.writeFile(pathScript, $script2, (err) => {
				if (err) throw err;
				console.log('react-native-scripts has been updated!!');
			});
		}
	} else {
		/* Update package.json for latest expo */
		let stringExist = ''
		let stringToBe = ''
		rewrite = false
		if (!$package.hasOwnProperty("scripts")) {
			rewrite = true
			$package.scripts = {
				"start": "esp start && expo start",
				"android": "expo start --android",
				"ios": "expo start --ios",
				"eject": "expo eject"
			};
		}
		if (args[0] == "install") {
			if (!$package.scripts.hasOwnProperty("start")) {
				rewrite = true;
				stringExist = `"start": "expo start"`
				stringToBe = `"start": "esp start && expo start"`
				// $package.scripts.start = "esp start && expo start"
			} else {
				if (!$package.scripts.start.match(/esp start/)) {
					rewrite = true
					stringExist = `"start": "expo start"`
					stringToBe = `"start": "esp start && expo start"`
					// $package.scripts.start = "esp start && " + $package.scripts.start
				}
			}
		} else
			if (args[0] == "uninstall") {
				if ($package.scripts.start.match(/esp start/)) {
					rewrite = true
					stringExist = `"start": "esp start && expo start"`
					stringToBe = `"start": "expo start"`
					// $package.scripts.start = $package.scripts.start.replace(/esp start(\s+&&\s+)/ig, "");
				}
			}
		if (rewrite) {
			fs.readFile(packjson, 'utf8', function (err, data) {
				if (err) {
					return console.log(err);
				}
				let result = data.replace(stringExist, stringToBe);

				fs.writeFile(packjson, result, 'utf8', function (err) {
					if (err) return console.log(err);
				});
			});
			// console.log("Please change scripts.start in package.json into '" + $package.scripts.start + "'")
			// spawn('node', ['./packager.js', args[0], packjson], { stdio: 'inherit' })
			// fs.writeFile(packjson, JSON.stringify($package, null, 2), (err) => {
			//   if (err) throw err;
			//   console.log('package.json has been updated');
			// });
		}
	}

	/* Create esp command line */
	if (args[0] == "install") {
		spawn('esp', ['start'], { stdio: 'inherit' })
			.on('exit', function (code) {
				console.log(code);
			})
			.on('error', function () {
				console.log("Installing the package 'esoftplay-cli'...");
				spawn('npm', ['install', '--global', '--loglevel', 'error', 'esoftplay-cli'], {
					stdio: ['inherit', 'ignore', 'inherit'],
				}).on('close', function (code) {
					if (code !== 0) {
						console.error('Installing esoftplay-cli failed. You can install it manually with:');
						console.error('  npm install --global esoftplay-cli');
					} else {
						console.log('esoftplay-cli installed. You can run `esp help` for instructions.');
					}
				});
			});
	}

	/* Update app.json */
	if (args[0] == "install") {
		let $config = {}
		if (fs.existsSync(confjson))
			$config = JSON.parse(fs.readFileSync(confjson, 'utf8')) || {};
		rewrite = false;
		if (!$config.hasOwnProperty('config')) {
			rewrite = true;
			$config.config = {
				"domain": "domain.com",
				"errorReport": {
					"telegramIds": [
						"-1001212227631",
					]
				},
				"isDebug": 0,
				"group_id": 4,
				"salt": "CHANGE_INTO_YOUR_OWN_SALT",
				"home": {
					"public": "content/index",
					"member": "content/index"
				}
			}
		}
		if (rewrite) {
			fs.writeFile(confjson, JSON.stringify($config, null, 2), (err) => {
				if (err) throw err;
				console.log('config.json has been created');
			});
		}
		let $appjson = {}
		if (fs.existsSync(appjson))
			$appjson = JSON.parse(fs.readFileSync(appjson, 'utf8')) || {};
		rewrite = false;
		if (!$appjson.expo.hasOwnProperty('android')) {
			rewrite = true;
			$appjson.expo.android = {
				"useNextNotificationsApi": true,
				"package": "com.domain",
				"versionCode": 1,
				"intentFilters": [
					{
						"action": "VIEW",
						"data": {
							"scheme": "http",
							"host": "*.domain.com"
						},
						"category": [
							"BROWSABLE",
							"DEFAULT"
						]
					},
					{
						"action": "VIEW",
						"data": {
							"scheme": "http",
							"host": "domain.com"
						},
						"category": [
							"BROWSABLE",
							"DEFAULT"
						]
					}
				]
			}
			$appjson.expo.ios = {
				"bundleIdentifier": "com.domain",
				"buildNumber": "1",
				"supportsTablet": true,
				"associatedDomains": [
					"applinks:*.domain.com",
					"applinks:domain.com"
				]
			}
			if (rewrite) {
				fs.writeFile(appjson, JSON.stringify($appjson, null, 2), (err) => {
					if (err) throw err;
					console.log('app.json has been updated');
				});
			}
		}
		/* Fix Code android timers */
		if (fs.existsSync(pathJSTimer)) {
			let JSTimers = fs.readFileSync(pathJSTimer, { encoding: 'utf8' })
			JSTimers = JSTimers.replace('const MAX_TIMER_DURATION_MS = 60 * 1000;', 'const MAX_TIMER_DURATION_MS = 10000 * 1000;')
			fs.writeFileSync(pathJSTimer, JSTimers)
		}

		/* Update App.js */
		const TSconfig = `{\n\
	"compilerOptions": {\n\
		"allowSyntheticDefaultImports": true,\n\
		"experimentalDecorators": true,\n\
		"forceConsistentCasingInFileNames": true,\n\
		"importHelpers": true,\n\
		"jsx": "react-native",\n\
		"lib": [\n\
			"es2017"\n\
		],\n\
		"module": "es2015",\n\
		"moduleResolution": "node",    \n\
		"noEmitHelpers": true,\n\
		"noImplicitReturns": true,\n\
		"noUnusedLocals": true,\n\
		"sourceMap": false,\n\
		"strict": true,\n\
		"target": "es2017"\n\
	},\n\
	"exclude": [\n\
		"node_modules"\n\
	]\n\
}`
		fs.writeFile(tsconfig, TSconfig, (err) => {
			if (err) throw err;
			console.log('tsconfig has been created');
		});

		const GitIgnore = `
.expo*/\n\
index.d.ts\n\
config.json\n\
config.debug.json\n\
config.live.json\n\
node_modules/\n\
npm-debug.*\n\
package-lock.json\n\
yarn.lock\n\
			`
		fs.writeFile(gitignore, GitIgnore, (err) => {
			if (err) throw err;
			console.log('.gitignore has been created');
		});

		const AppJS = `import React, { useEffect, useRef } from 'react';
import { esp, LibNotification } from 'esoftplay';
import * as ErrorReport from 'esoftplay/error'
import * as Notifications from 'expo-notifications';
import { enableScreens } from 'react-native-screens';
const { globalIdx } = require('esoftplay/global')
enableScreens();

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x))

export default function App() {
	const Home = useRef(esp.home()).current

	useEffect(() => {
		globalIdx.reset()
		ErrorReport.getError()
	}, [])

	return <Home />
}`;
		let expoLib = [
			'@expo/vector-icons',
			'@react-native-async-storage/async-storage',
			'@react-native-community/masked-view',
			'@react-native-community/netinfo',
			'@react-navigation/native',
			'@react-navigation/stack',
			'buffer',
			'expo-av',
			'expo-blur',
			'expo-camera',
			'expo-clipboard',
			'expo-constants',
			'expo-document-picker',
			'expo-error-recovery',
			'expo-file-system',
			'expo-font',
			'expo-image-crop',
			'expo-image-manipulator',
			'expo-image-picker',
			'expo-linear-gradient',
			'expo-media-library',
			'expo-notifications',
			'expo-status-bar',
			'expo-updates',
			'firebase',
			'immhelper',
			'moment',
			'moment-timezone',
			'react-fast-compare',
			'react-native-gesture-handler',
			'react-native-image-viewing',
			'react-native-modal',
			'react-native-picker-scrollview',
			'react-native-pinch-zoom-view-movable',
			'react-native-reanimated',
			'react-native-safe-area-context',
			'react-native-screens',
			'react-native-webview',
			'shorthash'
		]
		let devLibs = [
			"@babel/core",
			"@types/react",
			"@types/react-native",
			"typescript",
		]

		fs.writeFile(appts, AppJS, (err) => {
			if (err) throw err;
			fs.unlink(appjs, (err) => { })
			let installExpoLibs = []
			let installDevLibs = []
			expoLib.forEach((exlib) => {
				if (fs.existsSync("../../node_modules/" + exlib)) {
					console.log(exlib + " is Exist, Skipped")
				} else {
					console.log("⚙⚙⚙ INSTALLING ... " + exlib)
					installExpoLibs.push(exlib)
				}
			})
			devLibs.forEach((devlib) => {
				if (fs.existsSync("../../node_modules/" + devlib)) {
					console.log(devlib + " is Exist, Skipped")
				} else {
					console.log("⚙⚙⚙ INSTALLING ... " + devlib)
					installDevLibs.push(devlib)
				}
			})
			if (!fs.existsSync(DIR + 'modules'))
				fs.mkdirSync(DIR + 'modules')
			let cmd = "cd ../../ "
			if (installDevLibs.length > 0)
				cmd += "&& npm install --save-dev " + installDevLibs.join(" ") + " "
			if (installExpoLibs.length > 0)
				cmd += "&& expo install " + installExpoLibs.join(" ")
			execSync(cmd, { stdio: ['inherit', 'inherit', 'inherit'] })
			console.log('App.js has been replace to App.tsx');
			if (fs.existsSync('../@expo/vector-icons')) {
				let esoftplayIcon = ''
				fs.readdir('../@expo/vector-icons/build', (err, files) => {
					const dfiles = files.filter((file) => file.includes('d.ts'))
					dfiles.map((dfile, i) => {
						const rdfile = fs.readFileSync('../@expo/vector-icons/build/' + dfile, { encoding: 'utf8' })
						const names = (/import\("\.\/createIconSet"\)\.Icon<((.*))>;/g).exec(rdfile);
						if (names && names[1].includes('|')) {
							esoftplayIcon += 'export type ' + dfile.replace('.d.ts', 'Types') + ' = ' + names[1] + '\n';
						}
					})
					fs.writeFileSync('../@expo/vector-icons/build/esoftplay_icons.ts', esoftplayIcon)
				})
			} else {
				console.log("@expo/vector-icons not installed")
			}
			console.log('Please wait until processes has finished...');
		});
	}
} else {
	console.log(packjson + " not found!!")
}
// packjson scripts
// "preuninstall": "cd ../../ && node ./node_modules/.bin/esoftplay stop",
// "postuninstall": "node ./bin/build.js uninstall",