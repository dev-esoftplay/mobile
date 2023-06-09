#!/usr/bin/env node
// @ts-nocheck
/* EXECUTED ON `ESP START` TO BUILD FILE CACHES */
const fs = require('fs');
var checks = ['./node_modules/esoftplay/modules/', './modules/', './templates/'];
var pathAsset = "./assets";
var tmpDir = "./node_modules/esoftplay/cache/";
var typesDir = "./"
var replacer = new RegExp(/(?:\-|\.(?:ios|android))?\.(?:jsx|js|ts|tsx)$/);
var Text = "";
const rngh = "./node_modules/react-native-gesture-handler/react-native-gesture-handler.d.ts"

// const curPackjson = require('../package.json')
// const mainPackjson = require('../../../package.json')

// function getNestedObjectValue(obj, keys) {
//   if (keys.length > 0) {
//     var key = keys.shift();
//     if (key in obj) {
//       return getNestedObjectValue(obj[key], keys);
//     } else {
//       return null;
//     }
//   } else {
//     return obj;
//   }
// }


// const prjVersion = getNestedObjectValue(mainPackjson, ['dependencies', 'esoftplay'])
// if (prjVersion && prjVersion.includes(curPackjson.version)) {
//   try {
//     console.log("\x1b[31m", "VERSI esoftplay tidak SESUAI " + mainPackjson.dependencies.esoftplay + " != " + curPackjson.version + " ✘", "\x1b[0m")
//   } catch (error) { }
// }

if (fs.existsSync(rngh)) {
  fs.unlink(rngh, (err) => { })
}
/* CREATE DIRECTORY CACHE && types IF NOT EXISTS */
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir);
}

/* FETCH ALL SCRIPTS */
var Modules = {}; // Object semua module/task yang bisa dipanggil
var HookModules = []
var Reducers = {}; // Object semua reducer yang akan dikumpulkan
var HookReducers = []
var UseLibs = []
var SuffixHooksProperty = ('Property').trim()
var Persistor = {};
var Extender = {};
var NavsExclude = {};
var NavsOrientation = {};
var grabClass = null;
var delReducer = true;
var countLoop = 0; // jumlah file yang telah dihitung
var countRead = 0; // jumlah file yang telah di baca
var tmpTask = {}; // template ModuleTaks yang akan dimasukkan ke index.d.ts
var tmpExp = ["LibCrypt"]; // nama2 class yang tidak perlu dibuat
var Nav5 = (importer, navs) => {
  return (`
// @ts-nocheck
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
\nimport { _global } from "esoftplay";\n
${importer}
import { Platform } from 'react-native';
const Stack = createNativeStackNavigator();
const config = require('../../../config.json')
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';

export default function m(props): any {
	const { user, initialState, handler } = props
	const econf = config.config
	const appOrientation = econf?.orientation ? String(econf.orientation) : 'portrait'
	return (
		<NavigationContainer
			ref={(r) => LibNavigation.setRef(r)}
      initialState={initialState}
      onReady={() => { _global.NavsIsReady = true }}
      onStateChange={handler} >
      <Stack.Navigator
        headerMode="none"
        
        initialRouteName={(user?.id || user?.user_id) ? econf.home.member : econf.home.public}
        screenOptions={{ orientation: appOrientation, headerShown: false, contentStyle: { backgroundColor: 'white' }, animation: Platform.OS == 'ios' ? 'default' : 'none', stackPresentation: 'push' }}>
`+ navs + `
      </Stack.Navigator>
    </NavigationContainer>
  )
}
`)
}

checks.forEach(modules => {
  if (fs.existsSync(modules)) {
    fs.readdirSync(modules).forEach(module => {
      if (typeof Modules[module] == "undefined") {
        Modules[module] = {};
      }
      if (fs.statSync(modules + module).isDirectory()) {
        fs.readdirSync(modules + module).forEach(file => {
          if ((new RegExp("\.ts|.tsx|.js$")).test(file)) {
            var name = file.replace(replacer, '');
            var path = modules + module + "/" + name;
            var clsName = module + " " + name;
            clsName = clsName.toLowerCase().replace(/\b[a-z]/g, function (a) { return a.toUpperCase(); });
            clsName = clsName.replace(/\s/g, "");
            Modules[module][name] = path;
            if (typeof tmpTask[clsName] == "undefined") {
              tmpTask[clsName] = {
                "interface": [],
                "type": [],
                "var": {},
                "class": "",
                "function": {},
                "hooks": "",
                "namespaces": ""
              };
            }
            countLoop++;
            fs.readFile(modules + module + "/" + file, "utf8", function (err, data) {
              if (err) {
                return console.log(err)
              } else {
                var isIndexed = (tmpExp.indexOf(clsName) > -1) ? false : true;
                var isHooks = false
                var isUseLibs = false
                /* REGEX HOOKS */
                if ((/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))noPage/).exec(data)) {
                  NavsExclude[module + '/' + file.slice(0, file.lastIndexOf('.'))] = true
                } else {
                  NavsExclude[module + '/' + file.slice(0, file.lastIndexOf('.'))] = false
                }
                if (m = (/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))orientation:([a-zAZ_]+)/).exec(data)) {
                  NavsOrientation[module + '/' + file.slice(0, file.lastIndexOf('.'))] = m?.[1]
                }
                if (isIndexed) {
                  if (n = (/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))useLibs/).exec(data)) {
                    isUseLibs = true
                    tmpTask[clsName]['class'] = ""
                    tmpTask[clsName]['function'] = {}
                    UseLibs.push(module + "/" + name) /* get export default */
                    if (m = (/\n(?:export\sdefault|\s{2}return)\sfunction\s(([a-zA-Z0-9]+).*)\{\n/).exec(data)) {
                      tmpTask[clsName]['uselibs'] = ' function ' + m[1].replace(m[2], clsName).trim() + ";"
                      tmpTask[clsName]['namespaces'] = " namespace " + clsName.trim() + SuffixHooksProperty
                    }
                    /* get exported funtion */
                    if (f = data.match(/\nexport\s(?!default)(function\s([a-zA-Z0-9]+).*)\s\{\n/g)) {
                      for (let i = 0; i < f.length; i++) {
                        const _f = (/\nexport\s(?!default)(function\s([a-zA-Z0-9]+).*)\s\{\n/g).exec(f[i]);
                        tmpTask[clsName]['function'][_f[2]] = _f[1] + ';'
                      }
                    }
                    if (m = data.match(/\n{0,}\s{0,}export\s+(type\s+[a-zA-Z0-9_]+\s\=.*\n)/g)) {
                      for (let i = 0; i < m.length; i++) {
                        tmpTask[clsName]["type"].push(m[i].replace('export ', '').trim());
                      }
                    }
                    /* get exported const / var / let */
                    if (f = data.match(/\nexport\s(?!default)(?:((const|let|var)\s([a-zA-Z0-9]+):\s{0,}[a-zA-Z]+))/g)) {
                      for (let i = 0; i < f.length; i++) {
                        const _f = (/\nexport\s(?!default)(?:((const|let|var)\s([a-zA-Z0-9]+):\s{0,}[a-zA-Z]+))/g).exec(f[i]);
                        tmpTask[clsName]['var'][_f[3]] = _f[1] + ';'
                      }
                    }

                  }
                }

                if (isIndexed) {
                  if (n = (/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))withHooks/).exec(data)) {
                    // console.log('masmun');
                    isHooks = true
                    tmpTask[clsName]['class'] = ""
                    tmpTask[clsName]['function'] = {}
                    HookModules.push(module + "/" + name) /* get export default */
                    if (m = (/\n(?:export\sdefault|\s{2}return)\sfunction\s(([a-zA-Z0-9]+).*)\{\n/).exec(data)) {
                      tmpTask[clsName]['hooks'] = ' function ' + m[1].replace(m[2], clsName).trim() + ";"
                      tmpTask[clsName]['namespaces'] = " namespace " + clsName.trim() + SuffixHooksProperty
                    }
                    /* get exported funtion */
                    if (f = data.match(/\nexport\s(?!default)(function\s([a-zA-Z0-9]+).*)\s\{\n/g)) {
                      for (let i = 0; i < f.length; i++) {
                        const _f = (/\nexport\s(?!default)(function\s([a-zA-Z0-9]+).*)\s\{\n/g).exec(f[i]);
                        tmpTask[clsName]['function'][_f[2]] = _f[1] + ';'
                      }
                    }
                    if (m = data.match(/\n{0,}\s{0,}export\s+(type\s+[a-zA-Z0-9_]+\s\=.*\n)/g)) {
                      for (let i = 0; i < m.length; i++) {
                        tmpTask[clsName]["type"].push(m[i].replace('export ', '').trim());
                      }
                    }
                    /* get exported const / var / let */
                    if (f = data.match(/\nexport\s(?!default)(?:((const|let|var)\s([a-zA-Z0-9]+):\s{0,}[a-zA-Z]+))/g)) {
                      for (let i = 0; i < f.length; i++) {
                        const _f = (/\nexport\s(?!default)(?:((const|let|var)\s([a-zA-Z0-9]+):\s{0,}[a-zA-Z]+))/g).exec(f[i]);
                        tmpTask[clsName]['var'][_f[3]] = _f[1] + ';'
                      }
                    }

                  }
                }
                /* REGEX INTERFACE */
                if (isIndexed) {
                  /* check jika class tersebut nge replace bukan nge extends maka hapus semua interface bawaan dari supernya */
                  if (tmpTask[clsName].interface.length > 0) {
                    if (!data.includes('esoftplay/modules/')) {
                      tmpTask[clsName]["interface"] = [];
                    }
                  }
                  if (m = data.match(/\n\s{0,}export\s+(interface\s+[a-zA-Z0-9_]+.*\{[^\}]+\})/g)) {
                    for (var i = 0; i < m.length; i++) {
                      tmpTask[clsName]["interface"].push(m[i].replace('export ', '').trim());
                    }
                  }
                }

                /* REGEX TYPE */
                if (isIndexed) {
                  if (tmpTask[clsName].interface.length > 0) {
                    if (!data.includes('esoftplay/modules/')) {
                      tmpTask[clsName]["type"] = [];
                    }
                  }
                  if (m = data.match(/\n{0,}\s{0,}export\s+(type\s+[a-zA-Z0-9_]+\s\=.*\n)/g)) {
                    for (let i = 0; i < m.length; i++) {
                      tmpTask[clsName]["type"].push(m[i].replace('export ', '').trim());
                    }
                  }
                }

                /* REGEX CLASS NAME */
                if (!isHooks && !isUseLibs)
                  if (m = /\n\s{0,}(?:export\s+default\s+|return\s+)?(class\s+([^\s]+)[^\{]+)/.exec(data)) {
                    if (tmpTask[clsName]["class"] == "") {
                      tmpTask[clsName]["class"] = m[1].replace(m[2], clsName).trim();

                      /* tambahkan fungsi Crypt */
                      if (clsName === 'LibCrypt') {
                        tmpTask[clsName]["function"]['encode'] = 'encode(text: string): string;';
                        tmpTask[clsName]["function"]['decode'] = 'decode(text: string): string;';
                      }
                    }
                  }

                if (isIndexed) {
                  var r = /\n{0,}(\s+)(static\s[a-zA-Z0-9_]+:\s{0,}.*)=.*;{0,}\n/g
                  if (s = r.exec(data)) {
                    if (m = data.match(r)) {
                      /* check jika class tersebut nge replace bukan nge extends maka hapus semua static var bawaan dari supernya */
                      if (Object.keys(tmpTask[clsName].var).length > 0) {
                        if (!data.includes('esoftplay/modules/') && clsName != 'LibStyle') {
                          tmpTask[clsName]["var"] = {};
                        }
                      }
                      for (var i = 0; i < m.length; i++) {
                        if (S = m[i].match(/\n{0,}(\s+)(static\s[a-zA-Z0-9_]+:\s{0,}.*)=.*;{0,}\n/)) {
                          if (S[1] === s[1].replace(new RegExp('\n', 'g'), '')) {
                            var a = S[2].trim() + ";"
                            tmpTask[clsName]["var"][S[2]] = a;
                          }
                        }
                      }
                    }
                  }
                  /* REGEX All Functions */
                  if (!isHooks && !isUseLibs) {
                    var r = /\n(\s+)((?:(?:static|public|private|protected|public async|private async|protected async|async)\s+)?[a-zA-Z0-9_]{3,}\s{0,}(?:<S>|)(?:=\s{0,})?\([^{\n]+)/g; // 1=spaces 2=FunctionObject
                    if (s = r.exec(data)) {
                      if (m = data.match(r)) {
                        /* check jika class tersebut nge replace bukan nge extends maka hapus semua fungsi bawaan dari supernya */
                        if (Object.keys(tmpTask[clsName].function).length > 0) {
                          if (!data.includes('esoftplay/modules/') && clsName != 'LibStyle') {
                            tmpTask[clsName]["function"] = {};
                          }
                        }
                        for (var i = 0; i < m.length; i++) {
                          if (S = m[i].match(/\n([^\na-zA-Z0-9_]+)((?:(?:static|public|private|protected|public async|private async|protected async|async)\s+)?[a-zA-Z0-9_]{3,})/)) {
                            if (S[1] === s[1].replace(new RegExp('\n', 'g'), '')) {
                              var a = m[i].trim().replace('async ', '') + ";"
                              tmpTask[clsName]["function"][S[2]] = a;
                            }
                          }
                        }
                      }
                    }
                  }
                }

                var key = module + "_" + name;
                if ((new RegExp(/\n\s+static\s+reducer\s{0,}[\=\(]/g)).test(data)) { // is contains 'reducer'
                  Reducers[key] = path;
                  if ((new RegExp(/\n\s+static\s+persist\s{0,}=\s{0,}true/g)).test(data)) {
                    Persistor[key] = path
                  }
                } else if ((new RegExp(/\nexport\sfunction\s+reducer\s{0,}[\=\(]/g)).test(data)) {
                  Reducers[key] = path;
                  HookReducers.push(key)
                  if ((new RegExp(/\nconst\s+persist\s{0,}=\s{0,}true/g)).test(data)) {
                    Persistor[key] = path
                  }
                } else if (!isHooks && !isUseLibs) { // not contained 'reducer'
                  grabClass = data.match(new RegExp(/\n\s{0,}export\s+default\s+connect\\([^\\)]+\\)\\(\s{0,}(.*?)\s{0,}\\)/g));
                  delReducer = true;
                  if (grabClass) { // find MainClass
                    Extender = data.match(new RegExp(/\n\s{0,}class\s+" + grabClass[1] + "\s+extends\s+([^\s]+)/g));
                    if (Extender) { // find ParentClass
                      if (Extender[1] != "Component") { // ParentClass is not Component
                        if (typeof Reducers[key] != "undefined") { // Change Value only if already exists
                          Reducers[key] = path
                          delReducer = false;
                        }
                      }
                    }
                  }
                  if (delReducer && typeof Reducers[key] != "undefined") {
                    delete Reducers[key];
                  }
                }
              }
              countRead++;
            })
          }
        })
      }
    });
  }
});

/* CREATE ASSETS LIST */
var assets = [];
var noFile = [".DS_Store", "Thumbs.db"];
function listDir(path) {
  fs.readdirSync(path).forEach(found => {
    var obj = path + "/" + found;
    var stat = fs.statSync(obj);
    if (stat.isDirectory()) {
      listDir(obj);
    } else {
      found = found.replace(replacer, "");
      if (found != "" && noFile.indexOf(found) == -1) {
        obj = path.substr(2) + "/" + found;
        if (assets.indexOf(obj) == -1) {
          assets.push(obj)
        }
      }
    }
  });
}
if (!fs.existsSync(pathAsset)) {
  fs.mkdirSync(pathAsset);
}
listDir(pathAsset);
var Assets = "";
var pLength = pathAsset.length - 1;
assets.forEach(File => {
  Assets += "\t\tcase \"" + File.substr(pLength) + "\":\n" +
    "\t\t\tOut = require(\"../../../" + File + "\");\n" +
    "\t\t\tbreak;\n";
});
Text = 'function assets(File) {' + "\n\t" +
  'var Out = {}' + "\n\t" +
  'switch (File) {' + "\n" +
  Assets + "\t" +
  '}' + "\n\t" +
  'return Out;' + "\n" +
  '}' + "\n" +
  'module.exports = assets;';
if (isChange(tmpDir + "assets.js", Text))
  fs.writeFile(tmpDir + "assets.js", Text, { flag: 'w' }, function (err) {
    if (err) {
      return console.log(err);
    }
  });

/* CREATE INDEX.D.TS */
function createIndex() {
  var PreText = ''
  var Text = `
import { Component } from 'react';
import { AntDesignTypes, EntypoTypes, EvilIconsTypes, FeatherTypes, FontAwesomeTypes, FontistoTypes, FoundationTypes, IoniconsTypes, MaterialCommunityIconsTypes, MaterialIconsTypes, OcticonsTypes, SimpleLineIconsTypes, ZocialTypes, } from '@expo/vector-icons/build/esoftplay_icons'

declare module "esoftplay" {
  var _global: any;
  function useGlobalState<S>(initialState?: S, option?: useGlobalOption): useGlobalReturn<S>;
  function usePersistState<S>(key: string, initialState?: S | (() => S)): [S, (a: S | ((b: S )=> S)) => S | undefined, (a?: (x: S) => void) => void, () => void];
  function useSafeState<S>(initialState?: S | (() => S)): [S, (a: S | ((b: S )=> S)) => S | undefined];
  function applyStyle<T>(style: T): T;
  function usePersistState<S>(key: string, initialState?: S | (() => S)): [S, (a: S) => void, (a?: (x: S)=> void) => void, () => void];
  namespace esp {
    function appjson(): any;
    function assets(path: string): any;
    function dispatch(action: any): any;
    function config(param?: string, ...params: string[]): any;
    function _config(): string | number | boolean;
    function mod<T extends AllRoutes>(module: T): ModType<T>;
    function modProp<T extends AllRoutes>(module: T): ModPropType<T>;
    function reducer(): any;
    function versionName(): string;
    function navigations(): any;
    function isDebug(message: string): boolean;
    function lang(moduleTask: string, langName: string, ...string: string[]): string;
    function langId(): string;
    function home(): any;
    function log(message?: any, ...optionalParams: any[]): void;
    function routes(): any;
    const logColor : {
      reset: string,
      black: string,
      red: string,
      green: string,
      yellow: string,
      blue: string,
      magenta: string,
      cyan: string,
      white: string,
      backgroundBlack: string,
      backgroundRed: string,
      backgroundGreen: string,
      backgroundYellow: string,
      backgroundBlue: string,
      backgroundMagenta: string,
      backgroundCyan: string,
      backgroundWhite: string,
    }
  }
  
  interface useGlobalReturn<T> {
    useState: () => [T, (newState: T) => void, () => void],
    get: (param?: string, ...params: string[]) => T,
    set: (x: T) => void,
    reset: () => void,
    connect: (props: useGlobalConnect<T>) => any,
    useSelector: (selector: (state: T) => any) => any;
  }
  
  interface useGlobalOption {
    persistKey?: string,
    inFile?: boolean,
    listener?: (data: any) => void,
    isUserData?: boolean
  }
  interface useGlobalConnect<T> {
    render: (props: T) => any,
  }`;
  for (clsName in tmpTask) {
    let ItemText = ""
    if (clsName == "LibIcon") {
      ItemText += "import { EvilIconsTypes, AntDesignTypes, EvilIconsTypes, FeatherTypes, FontAwesomeTypes, FontistoTypes, FoundationTypes, MaterialIconsTypes, EntypoTypes, OcticonsTypes, ZocialTypes, SimpleLineIconsTypes, IoniconsTypes, MaterialCommunityIconsTypes } from '@expo/vector-icons/build/esoftplay_icons';\n"
    }
    if (clsName === 'LibCrypt') {
      tmpTask[clsName]["class"] = "class LibCrypt"
      tmpTask[clsName]["function"]['encode'] = 'encode(text: string): string;';
      tmpTask[clsName]["function"]['decode'] = 'decode(text: string): string;';
    }
    if (tmpTask[clsName]["class"]) {

      if (clsName !== "LibComponent")
        ItemText += "import { LibComponent } from 'esoftplay/cache/lib/component/import';\nimport { LibNavigationRoutes, useGlobalReturn } from 'esoftplay';\n"
      else if (clsName === "LibComponent") {
        ItemText += "import { Component } from 'react';\n"
      }

      // ItemText += "\n";
      for (var i = 0; i < tmpTask[clsName]["type"].length; i++) {
        ItemText += "\n  " + tmpTask[clsName]["type"][i].replace(/\n/g, "\n  ");
      }
      for (var i = 0; i < tmpTask[clsName]["interface"].length; i++) {
        ItemText += "\n  " + tmpTask[clsName]["interface"][i].replace(/\n/g, "\n  ");
      }
      ItemText += "\n  export " + tmpTask[clsName]["class"] + " {";
      var isFilled = false;
      for (fun in tmpTask[clsName]["var"]) {
        ItemText += "\n     " + tmpTask[clsName]["var"][fun];
      }
      for (fun in tmpTask[clsName]["function"]) {
        ItemText += "\n     " + tmpTask[clsName]["function"][fun];
        isFilled = true;
      }
      if (isFilled) {
        ItemText += "\n  ";
      }
      // ItemText += "}\n";
      ItemText += "}";
    } else if (tmpTask[clsName]["hooks"]) {
      for (var i = 0; i < tmpTask[clsName]["interface"].length; i++) {
        ItemText += "\n  export " + tmpTask[clsName]["interface"][i].replace(/\n/g, "\n  ");
      }
      ItemText += "\n export " + tmpTask[clsName]["hooks"];
      for (var i = 0; i < tmpTask[clsName]["type"].length; i++) {
        ItemText += "\n    export " + tmpTask[clsName]["type"][i].replace(/\n/g, "\n  ");
      }
      var isFilled = false;
      ItemText += "\n export " + tmpTask[clsName]["namespaces"] + " {";
      for (fun in tmpTask[clsName]["var"]) {
        ItemText += "\n    export " + tmpTask[clsName]["var"][fun];
      }
      for (fun in tmpTask[clsName]["function"]) {
        ItemText += "\n    export " + tmpTask[clsName]["function"][fun];
        isFilled = true;
      }
      if (isFilled) {
        ItemText += "\n  ";
      }
      ItemText += "}";
    } else if (tmpTask[clsName]["uselibs"]) {
      for (var i = 0; i < tmpTask[clsName]["interface"].length; i++) {
        ItemText += "\n  export " + tmpTask[clsName]["interface"][i].replace(/\n/g, "\n  ");
      }
      ItemText += "\n export " + tmpTask[clsName]["uselibs"];
      for (var i = 0; i < tmpTask[clsName]["type"].length; i++) {
        ItemText += "\n  export " + tmpTask[clsName]["type"][i].replace(/\n/g, "\n  ");
      }
      var isFilled = false;
      ItemText += "\n export " + tmpTask[clsName]["namespaces"] + " {";
      for (fun in tmpTask[clsName]["var"]) {
        ItemText += "\n    export " + tmpTask[clsName]["var"][fun];
      }
      for (fun in tmpTask[clsName]["function"]) {
        ItemText += "\n    export " + tmpTask[clsName]["function"][fun];
        isFilled = true;
      }
      if (isFilled) {
        ItemText += "\n  ";
      }
      ItemText += "}";
    }
    const [module, task] = clsName.split(/(?=[A-Z])/)
    const nav = module?.toLowerCase() + '/' + task?.toLowerCase()

    if (module && !fs.existsSync(tmpDir + module?.toLowerCase()))
      fs.mkdirSync(tmpDir + module.toLowerCase());

    if (!fs.existsSync(tmpDir + nav))
      fs.mkdirSync(tmpDir + nav)

    PreText += "import '" + tmpDir + nav + "/import.d';\n"
    if (isChange(tmpDir + nav + '/import.d.ts', ItemText)) {
      fs.writeFile(tmpDir + nav + '/import.d.ts', ItemText, { flag: 'w' }, function (err) {
        if (err) {
          return console.log(err);
        }
      });
    }
  }
  Text += "\n\ttype LibNavigationRoutes = \"" + Navigations.join("\" |\n\t\t\t \"") + "\"\n"
  Text += "\n\ttype AllRoutes = \"" + AllRoutes.join("\" |\n\t\t\t \"") + "\"\n"
  Text += "\n\ttype ModType<T> =" + AllRoutes.map(v => {
    const Words = v.split("/")
    return `\t\tT extends "${v}" ? typeof ${ucword(Words[0]) + ucword(Words[1])} :`
  }).join("\n") + "\nnever;\n"
  Text += "\n\ttype ModPropType<T> =" + AllRoutes.map(v => {
    const Words = v.split("/")
    return `\t\tT extends "${v}" ? typeof ${ucword(Words[0]) + ucword(Words[1]) + "Property"} :`
  }).join("\n") + "\nnever;\n"
  Text += "}\n"
  Text = PreText + Text
  if (isChange(typesDir + "index.d.ts", Text)) {
    fs.writeFile(typesDir + "index.d.ts", Text, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    })
  }
}

function isChange(path, compare) {
  let hasChanged = true
  let old = fs.existsSync(path) ? fs.readFileSync(path, { encoding: 'utf8' }) : ""
  hasChanged = old.length != compare.length
  if (hasChanged) {
    console.log(path, 'CHANGED', old.length, compare.length)
  }
  return hasChanged
}

/* CREATE REDUCER LIST */
function createReducer() {
  if (countRead >= countLoop) {
    createRouter()
    createIndex();
  } else {
    setTimeout(() => {
      createReducer();
    }, 100);
  }
}
createReducer()

/* === */
function ucword(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
/* CREATE ROUTER LIST */
var Navigations = [];
var AllRoutes = []

function createRouter() {
  var Task = "";
  var TaskProperty = "";
  var nav = "";
  var staticImport = []

  // staticImport.push("var isEqual = require('react-fast-compare');\n")
  staticImport.push("export function applyStyle(style){ return style };\n")
  staticImport.push("export { default as useGlobalState } from '../../../node_modules/esoftplay/global';\n")
  staticImport.push("export { default as usePersistState } from '../../../node_modules/esoftplay/persist';\n")
  staticImport.push("export { default as useGlobalSubscribe } from '../../../node_modules/esoftplay/subscribe';\n")
  staticImport.push("export { default as useSafeState } from '../../../node_modules/esoftplay/state';\n")
  staticImport.push("export { default as useLazyState } from '../../../node_modules/esoftplay/lazy';\n")
  staticImport.push("export { default as esp } from '../../../node_modules/esoftplay/esp';\n")
  // staticImport.push("export { default as createCache } from '../../../node_modules/esoftplay/_cache';\n")
  staticImport.push("export { default as _global } from '../../../node_modules/esoftplay/_global';\n")
  staticImport.push("import { stable } from 'usestable';\n")

  for (const module in Modules) {
    for (const task in Modules[module]) {
      nav = module + '/' + task;
      if (NavsExclude[nav] == false) {
        Navigations.push(nav);
      }
      AllRoutes.push(nav)
      let fileExt = 'js'
      Task += "\t\t" + 'case "' + nav + '":' + "\n\t\t\t" + 'Out = require("../../.' + Modules[module][task] + '")?.default' + "\n\t\t\t" + 'break;' + "\n";
      TaskProperty += "\t\t" + 'case "' + nav + '":' + "\n\t\t\t" + 'Out = require("../../.' + Modules[module][task] + '")' + "\n\t\t\t" + 'break;' + "\n";
      /* ADD ROUTER EACH FILE FOR STATIC IMPORT */
      var item = `import { stable } from 'usestable';\n`
      if (HookModules.includes(nav)) {
        // fileExt = 'tsx'
        item += "" +
          "import React from 'react'\n" +
          "const _" + ucword(module) + ucword(task) + " = React.lazy(() => import('../../../../." + Modules[module][task] + "')); \n" +
          "import * as " + ucword(module) + ucword(task) + SuffixHooksProperty + " from '../../../../." + Modules[module][task] + "';\n" +
          "const UpdatedComponent = (OriginalComponent) => { function NewComponent(props) { return ( <React.Suspense><OriginalComponent {...props} /></React.Suspense> ) } return NewComponent; };\n" +
          "const " + ucword(module) + ucword(task) + " = stable(UpdatedComponent(_" + ucword(module) + ucword(task) + ")); \n" +
          "export { " + ucword(module) + ucword(task) + SuffixHooksProperty + ", " + ucword(module) + ucword(task) + " };\n"
      } else if (UseLibs.includes(nav)) {
        item += "" +
          "import { default as _" + ucword(module) + ucword(task) + " } from '../../../../." + Modules[module][task] + "';\n" +
          "import * as " + ucword(module) + ucword(task) + SuffixHooksProperty + " from '../../../../." + Modules[module][task] + "';\n" +
          "const " + ucword(module) + ucword(task) + " = _" + ucword(module) + ucword(task) + "; \n" +
          "export { " + ucword(module) + ucword(task) + SuffixHooksProperty + ", " + ucword(module) + ucword(task) + " };\n"
      } else {
        item += "import { default as _" + ucword(module) + ucword(task) + " } from '../../../../." + Modules[module][task] + "';\n"
        item += "export { _" + ucword(module) + ucword(task) + " as " + ucword(module) + ucword(task) + " };\n"
      }

      if (!fs.existsSync(tmpDir + module))
        fs.mkdirSync(tmpDir + module);

      if (!fs.existsSync(tmpDir + nav))
        fs.mkdirSync(tmpDir + nav)

      if (isChange(tmpDir + nav + "/import." + fileExt, item)) {
        fs.writeFile(tmpDir + nav + '/import.' + fileExt, item, { flag: 'w' }, function (err) {
          if (err) {
            return console.log(err);
          }
        });
      }

      // if (module == 'lib' && task == 'component') {
      //   staticImport.splice(2, 0, item)
      // } else if (module == 'lib' && task == 'style') {
      //   staticImport.splice(4, 0, item)
      // } else if (module == 'lib' && task == 'worker') {
      //   staticImport.splice(4, 0, item)
      // } else if (module == 'lib' && task == 'navigation') {
      //   staticImport.splice(4, 0, item)
      // } else if (task == 'style') {
      //   staticImport.splice(9, 0, item)
      // } else if (task == 'scrollpicker') {
      //   staticImport.splice(10, 0, item)
      // } else {
      //   staticImport.push(item);
      // }
    }
  }

  const x = staticImport.join('')
  if (isChange(tmpDir + 'index.js', x))
    fs.writeFile(tmpDir + 'index.js', x, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });

  let Props = 'function properties(modtask) {' + "\n\t" +
    'var Out = {}' + "\n\t" +
    'switch (modtask) {' + "\n" +
    TaskProperty + "\t" +
    '}' + "\n\t" +
    'return Out;' + "\n" +
    '}' + "\n" +
    'module.exports = properties;';
  if (isChange(tmpDir + "properties.js", Props)) {
    fs.writeFile(tmpDir + "properties.js", Props, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }

  Text = 'function routers(modtask) {' + "\n\t" +
    'var Out = {}' + "\n\t" +
    'switch (modtask) {' + "\n" +
    Task + "\t" +
    '}' + "\n\t" +
    'return Out;' + "\n" +
    '}' + "\n" +
    'module.exports = routers;';
  if (isChange(tmpDir + "routers.js", Text)) {
    fs.writeFile(tmpDir + "routers.js", Text, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }
  /* CREATE NAVIGATION LIST */
  Text = "export default [\"" + Navigations.join('", "') + "\"]";
  fs.writeFile(tmpDir + "navigations.js", Text, { flag: 'w' }, function (err) {
    if (err) {
      return console.log(err);
    }
  });
  let importer = []
  let screens = []

  Navigations.forEach((nav) => {
    const orientation = NavsOrientation[nav]
    const [module, task] = nav.split('/')
    const comp = ucword(module) + ucword(task)
    importer.push(`import { ${comp}
      } from ${'"esoftplay/cache/' + module + '/' + task + '/import"'} `)
    if (orientation)
      screens.push("\t\t\t\t" + "<Stack.Screen name={\"" + nav + "\"} options={{ orientation: '" + orientation + "' }} component={" + comp + "} />")
    else
      screens.push("\t\t\t\t" + "<Stack.Screen name={\"" + nav + "\"} component={" + comp + "} />")
  })

  let N = Nav5(importer.join("\n"), screens.join("\n"))
  if (isChange(tmpDir + 'navs.tsx', N))
    fs.writeFile(tmpDir + "navs.tsx", N, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });
}
