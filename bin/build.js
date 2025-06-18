#!/usr/bin/env node
// @ts-check
const { execSync } = require('child_process');
const fs = require('fs');
const DIR = "../../"
const packjson = DIR + "package.json"
const appjson = DIR + "app.json"
const easjson = DIR + "eas.json"
const confjson = DIR + "config.json"
const conflivejson = DIR + "config.live.json"
const gitignore = DIR + ".gitignore"
const babelconfig = DIR + "babel.config.js"
const tsconfig = DIR + "tsconfig.json"
const appjs = DIR + "App.js"
const appts = DIR + "App.tsx"
const pathJSTimer = DIR + "node_modules/react-native/Libraries/Core/Timers/JSTimers.js"
const lowercasePrompt = 'if (/^[a-z]/.test(component.name)) {'
const pathLowercasePrompt = DIR + 'node_modules/@react-navigation/core/src/useNavigationBuilder.tsx'

if (fs.existsSync(packjson)) {
	let txt = fs.readFileSync(packjson, 'utf8');
	let $package
	try {
		$package = typeof txt == 'string' ? JSON.parse(txt) : txt
	} catch (error) { }
	let args = process.argv.slice(2);

	/* ADD SCRIPTS.PRESTART AND SCRIPTS.POSTSTOP */

	if (args[0] == "install") {
		$package.scripts.start = "esp start && bunx expo start --dev-client"
		$package.trustedDependencies = [
			"esoftplay",
			"esoftplay-android-print",
			"esoftplay-chatting",
			"esoftplay-firestore",
			"esoftplay-content",
			"esoftplay-lib-print",
			"esoftplay-event",
			"esoftplay-log",
			"esoftplay-market",
			"esoftplay-ppob",
			"esoftplay-web",
			"esoftplay-web-pwa"
		]
		fs.writeFile(packjson, JSON.stringify($package, null, 2), (err) => {
			if (err) throw err;
			console.log('package.json has been updated');
		});
	}

	/* Update app.json */
	if (args[0] == "install") {
		let $config = {}
		if (fs.existsSync(confjson))
			try {
				let conf = fs.readFileSync(confjson, 'utf8') || {}
				$config = typeof conf == 'string' ? JSON.parse(conf) : conf
			} catch (error) { }
		if (!$config.hasOwnProperty('config')) {
			$config.config = {
				"domain": "domain.com",
				"errorReport": {
					"telegramIds": [
						"-1001212227631",
					]
				},
				"isDebug": 0,
				"group_id": 4,
				"experienceId": "@username/slug",
				"salt": "CHANGE_INTO_YOUR_OWN_SALT",
				"home": {
					"public": "main/index",
					"member": "main/index"
				}
			}
		}
		fs.writeFile(confjson, JSON.stringify($config, null, 2), (err) => {
			if (err) throw err;
			console.log('config.json has been created');
		});
		if (!fs.existsSync(conflivejson)) {
			fs.writeFile(conflivejson, JSON.stringify($config, null, 2), (err) => {
				if (err) throw err;
				console.log('config.live.json has been created');
			});
		}

		let $appjson = {}
		if (fs.existsSync(appjson))
			try {
				let appj = fs.readFileSync(appjson, 'utf8') || {}
				$appjson = typeof appj == 'string' ? JSON.parse(appj) : appj;
			} catch (error) { }
		if (!$appjson?.expo?.hasOwnProperty?.('runtimeVersion')) {
			$appjson.expo.runtimeVersion = "1"
			$appjson.expo.android = {
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
				],
				"infoPlist": {
					"LSApplicationQueriesSchemes": [
						"itms-apps"
					]
				}
			}
			$appjson.expo.plugins = [
				"./raw/plugins/heapSize",
				"./raw/plugins/fcmIcon",
				"./raw/plugins/noDarkAndroid",
				"./raw/plugins/withAndroidVerifiedLinksWorkaround",
			]
			
			execSync("mkdir -p ./raw && cp -r ./node_modules/esoftplay/assets/plugins ./raw")
			fs.writeFile(appjson, JSON.stringify($appjson, null, 2), (err) => {
				if (err) throw err;
				console.log('app.json has been updated');
			});
		}
		/* Fix Code android timers */
		if (fs.existsSync(pathJSTimer)) {
			let JSTimers = fs.readFileSync(pathJSTimer, { encoding: 'utf8' })
			JSTimers = JSTimers.replace('const MAX_TIMER_DURATION_MS = 60 * 1000;', 'const MAX_TIMER_DURATION_MS = 10000 * 1000;')
			fs.writeFileSync(pathJSTimer, JSTimers)
		}

		/* hide prompt lowercase */
		if (fs.existsSync(pathLowercasePrompt)) {
			console.log('Fixing lowercase prompt')
			let useNavigationBuilder = fs.readFileSync(pathLowercasePrompt, { encoding: 'utf8' })
			useNavigationBuilder = useNavigationBuilder.replace(lowercasePrompt, lowercasePrompt + '\nreturn;')
			fs.writeFileSync(pathLowercasePrompt, useNavigationBuilder)
		} else {
			console.log('Path not exists')
		}

		const easconfg = `{
	"cli": {
		"version": ">= 0.52.0"
	},
	"build": {
		"development": {
			"bun": "1.1.0",
			"developmentClient": true,
			"distribution": "internal",
			"ios": {
				"simulator": true
			},
			"channel": "default"
		},
		"development_build": {
			"bun": "1.1.0",
			"developmentClient": true,
			"distribution": "internal",
			"channel": "default"
		},
		"preview": {
			"bun": "1.1.0",
			"distribution": "internal",
			"ios": {
				"simulator": true
			},
			"channel": "default"
		},
		"preview_build": {
			"bun": "1.1.0",
			"distribution": "internal",
			"android": {
				"buildType": "apk"
			},
			"channel": "default"
		},
		"production": {
			"bun": "1.1.0",
			"channel": "default"
		}
	},
	"submit": {
		"production": {}
	}
}`

		fs.writeFile(easjson, easconfg, (err) => {
			if (err) throw err;
			console.log('eas.json has been updated');
		})

		const babelconf = `module.exports = function (api) {
	api.cache(true);
	let plugins = []
	plugins.push("react-native-reanimated/plugin")
	return {
		presets: ["babel-preset-expo"],
		plugins
	};
};

`
		fs.writeFile(babelconfig, babelconf, (err) => {
			if (err) throw err;
			console.log('babel.config.js has been updated');
		})
		/* Update App.js */
		const TSconfig = `{\n\
	"compilerOptions": {\n\
		"allowSyntheticDefaultImports": true,\n\
		"experimentalDecorators": true,\n\
		"resolveJsonModule": true, \n\
		"forceConsistentCasingInFileNames": true,\n\
		"importHelpers": true,\n\
		"jsx": "react-native",\n\
		"lib": [\n\
			"es2017"\n\
		],\n\
		"module": "ES2020",\n\
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
.expo*/
index.d.ts
config.json
config.debug.json
config.live.json
node_modules/
dist/
code-signing/
certificate.pem
web-build/
npm-debug.*
package-lock.json
assets/esoftplaymodules/
assets/preload_api/
assets/preload_assets/
bun.lockb
bun.lock
yarn.lock
yarn-error.log
					
			`
		fs.writeFile(gitignore, GitIgnore, (err) => {
			if (err) throw err;
			console.log('.gitignore has been created');
		});

		const AppJS = `import { LibNotification } from 'esoftplay/cache/lib/notification/import';
import { UserIndex } from 'esoftplay/cache/user/index/import';
import * as Notifications from 'expo-notifications';
import { enableFreeze, enableScreens } from 'react-native-screens';

enableFreeze()
enableScreens()

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x));
Notifications.addNotificationReceivedListener(x => LibNotification.onAction(x));

export default UserIndex`;
		let expoLib = [
			'@expo/vector-icons',
			'@react-native-async-storage/async-storage',
			'@react-native-masked-view/masked-view',
			'@react-native-community/netinfo',
			'@react-navigation/native-stack',
			'@react-navigation/native',
			'@react-navigation/stack',
			'@shopify/flash-list',
			'buffer',
			'expo-application',
			'expo-camera',
			'expo-clipboard',
			'expo-constants',
			'expo-document-picker',
			'expo-dev-client',
			'expo-file-system',
			'expo-font',
			'expo-image',
			'expo-image-manipulator',
			'expo-image-picker',
			'expo-linear-gradient',
			'expo-media-library',
			'expo-notifications',
			'expo-status-bar',
			'expo-splash-screen',
			'expo-secure-store',
			// 'expo-sqlite',
			'expo-updates',
			'immhelper',
			'dayjs',
			'react-fast-compare',
			'react-native-gesture-handler',
			'react-native-awesome-gallery',
			// 'react-native-fast-image',
			'react-native-keyboard-controller',
			'react-native-mmkv',
			'react-native-pan-pinch-view',
			'react-native-reanimated',
			'react-native-safe-area-context',
			'react-native-screens',
			'react-native-webview',
			'shorthash',
			'usestable'
		]
		if ($config.config.hasOwnProperty('excludePackages')) {
			if ($config.config.excludePackages) {
				const excludePackages = $config.config.excludePackages
				expoLib = expoLib.filter((item) => !excludePackages?.includes?.(item))
			}
		}
		let devLibs = [
			"@babel/core",
			"@types/react",
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
					if (exlib == '@expo/vector-icons') {
						installExpoLibs.push(exlib)
					}
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
			if (installDevLibs.length > 0) {
				// console.log(installDevLibs)
				cmd += "&& bun add " + installDevLibs.join(" ") + " --dev "
			}
			if (installExpoLibs.length > 0) {
				// console.log(installExpoLibs)
				cmd += "&& bunx expo install " + installExpoLibs.join(" ")
			}
			console.log((JSON.stringify({ cmd }, undefined, 2)))
			execSync(cmd + "|| true")
			// execSync("cd ../../ && bun install --verbose || true")
			execSync("cd ../../ && bun ./node_modules/esoftplay/bin/router.js || true")
			execSync("cd ../../ && bun ./node_modules/esoftplay/bin/locale.js || true")
			// execSync("cd ../../ && eas update:configure || true")
			console.log('App.js has been replace to App.tsx');
			// if (appjson)
			// /* bugfix AsyncStorage @firebase, remove this section if firebase has update the AsyncStorage */
			if (fs.existsSync('../@firebase/app/dist/index.rn.cjs.js')) {
				let firebaseText = fs.readFileSync('../@firebase/app/dist/index.rn.cjs.js', 'utf8')
				firebaseText = firebaseText.replace("var AsyncStorage = require('react-native').AsyncStorage;", "var AsyncStorage = require('@react-native-async-storage/async-storage').default;")
				fs.writeFileSync('../@firebase/app/dist/index.rn.cjs.js', firebaseText)
			}
			// /* end AsyncStorage @firebase section */
			if (fs.existsSync('../@expo/vector-icons')) {
				let esoftplayIcon = ''
				fs.readdir('../@expo/vector-icons/build', (err, files) => {
					const dfiles = files.filter((file) => file.includes('d.ts'))
					dfiles.map((dfile, i) => {
						const rdfile = fs.readFileSync('../@expo/vector-icons/build/' + dfile, { encoding: 'utf8' })
						const names = (/import\("\.\/createIconSet"\)\.Icon<((.*))\,.*>/g).exec(rdfile);
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
// "preuninstall": "cd ../../ && bun ./node_modules/.bin/esoftplay stop",
// "postuninstall": "bun ./bin/build.js uninstall",