#!/usr/bin/env node
/* EXECUTED ON `ESP START` TO BUILD FILE CACHES */
const fs = require('fs');
var checks = ['./node_modules/esoftplay/modules/', './modules/', './templates/'];
var pathAsset = "./assets";
var tmpDir = "./node_modules/esoftplay/cache/";
var typesDir = "./"
var replacer = new RegExp(/(?:\-|\.(?:ios|android))?\.(?:jsx|js|ts|tsx)$/);
var Text = "";
const rngh = "./node_modules/react-native-gesture-handler/react-native-gesture-handler.d.ts"
// const isEqual = require('react-fast-compare');

console.log("DICALL")
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
var grabClass = null;
var delReducer = true;
var countLoop = 0; // jumlah file yang telah dihitung
var countRead = 0; // jumlah file yang telah di baca
var tmpTask = {}; // template ModuleTaks yang akan dimasukkan ke index.d.ts
var tmpExp = ["LibCrypt"]; // nama2 class yang tidak perlu dibuat
var Nav5 = (importer, navs) => {
  return (`
// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
\nimport { `+ importer + `, esp, _global } from "esoftplay";\n
const Stack = createNativeStackNavigator();

export default function m(props): any{
  const { user, initialState, handler } = props
  const econf = esp.config()
  return(
    <NavigationContainer
      ref={(r) => LibNavigation.setRef(r)}
      initialState={initialState}
      onReady={() => { _global.NavsIsReady = true }}
      onStateChange={handler} >
      <Stack.Navigator
        headerMode="none"
        initialRouteName={(user?.id || user?.user_id) ? econf.home.member : econf.home.public}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' }, stackAnimation: 'default', stackPresentation: 'push' }}>
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
                // console.log(isIndexed, clsName);
                var isHooks = false
                var isUseLibs = false
                /* REGEX HOOKS */

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
                      if (clsName == 'LibCrypt') {
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
                    var r = /\n(\s+)((?:(?:static|public|private|async)\s+)?[a-zA-Z0-9_]{3,}\s{0,}(?:<S>|)(?:=\s{0,})?\([^{\n]+)/g; // 1=spaces 2=FunctionObject
                    if (s = r.exec(data)) {
                      if (m = data.match(r)) {
                        /* check jika class tersebut nge replace bukan nge extends maka hapus semua fungsi bawaan dari supernya */
                        if (Object.keys(tmpTask[clsName].function).length > 0) {
                          if (!data.includes('esoftplay/modules/') && clsName != 'LibStyle') {
                            tmpTask[clsName]["function"] = {};
                          }
                        }
                        for (var i = 0; i < m.length; i++) {
                          if (S = m[i].match(/\n([^\na-zA-Z0-9_]+)((?:(?:static|public|private|async)\s+)?[a-zA-Z0-9_]{3,})/)) {
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

  var Text = `import { Component, ComponentClass, Ref, ComponentType } from 'react';
  import { AntDesignTypes, EntypoTypes, EvilIconsTypes, FeatherTypes, FontAwesomeTypes, FontistoTypes, FoundationTypes, IoniconsTypes, MaterialCommunityIconsTypes, MaterialIconsTypes, OcticonsTypes, SimpleLineIconsTypes, ZocialTypes, } from '@expo/vector-icons/build/esoftplay_icons'

  declare module esoftplay {
    var _global: any;
    function useGlobalState<S>(initialState?: S, option?: useGlobalOption): useGlobalReturn<S>;
    function usePersistState<S>(key: string, initialState?: S | (() => S)): [S, (a: S | ((b: S )=> S)) => S | undefined, (a?: (x: S) => void) => void, () => void];
    function applyStyle(style: any): any;
    function usePersistState<S>(key: string, initialState?: S | (() => S)): [S, (a: S) => void, (a?: (x: S)=> void) => void, () => void];
    namespace esp {
      function appjson(): any;
      function assets(path: string): any;
      function dispatch(action: any): any;
      function config(param?: string, ...params: string[]): any;
      function _config(): string | number | boolean;
      function mod(path: string): any;
      function reducer(): any;
      function versionName(): string;
      function navigations(): any;
      function isDebug(): boolean;
      function lang(moduleTask: string, langName: string, ...string: string[]): string;
      function langId(): string;
      function home(): any;
      function log(message?: any, ...optionalParams: any[]): void;
      function routes(): any;
    }
    
    interface useGlobalReturn<T> {
      useState: () => [T, (newState: T | ((a:T) => T)) => T | undefined, () => void],
      get: () => T,
      set: (x: T) => void,
      reset: () => void,
      connect: (props: useGlobalConnect<T>) => any,
      useSelector: (selector: (state: T) => any) => any;
    }
    interface useGlobalOption {
      persistKey?: string,
      listener?: (data: any) => void,
      isUserData?: boolean
    }
    interface useGlobalConnect<T> {
      render: (props: T) => any,
    }
    interface createCacheOption {
      persistKey?: string,
      listener?: (s:any)=> void
    }
    interface createCacheReturn<S> {
      useCache: () => [S, (newCache: S) => void, () => void],
      get: () => any,
      set: (x: S) => void
    }
    class LibCrypt {
      encode(string: string): string
      decode(string: string): string
    }
    function createCache<S>(initialCache?: S, option?: createCacheOption): createCacheReturn<S>;`;
  for (clsName in tmpTask) {
    if (tmpTask[clsName]["class"]) {
      // Text += "\n";
      for (var i = 0; i < tmpTask[clsName]["type"].length; i++) {
        Text += "\n  " + tmpTask[clsName]["type"][i].replace(/\n/g, "\n  ");
      }
      for (var i = 0; i < tmpTask[clsName]["interface"].length; i++) {
        Text += "\n  " + tmpTask[clsName]["interface"][i].replace(/\n/g, "\n  ");
      }
      Text += "\n  " + tmpTask[clsName]["class"] + " {";
      var isFilled = false;
      for (fun in tmpTask[clsName]["var"]) {
        Text += "\n    " + tmpTask[clsName]["var"][fun];
      }
      for (fun in tmpTask[clsName]["function"]) {
        Text += "\n    " + tmpTask[clsName]["function"][fun];
        isFilled = true;
      }
      if (isFilled) {
        Text += "\n  ";
      }
      // Text += "}\n";
      Text += "}";
    } else if (tmpTask[clsName]["hooks"]) {
      for (var i = 0; i < tmpTask[clsName]["interface"].length; i++) {
        Text += "\n  " + tmpTask[clsName]["interface"][i].replace(/\n/g, "\n  ");
      }
      Text += "\n " + tmpTask[clsName]["hooks"];
      for (var i = 0; i < tmpTask[clsName]["type"].length; i++) {
        Text += "\n    " + tmpTask[clsName]["type"][i].replace(/\n/g, "\n  ");
      }
      var isFilled = false;
      Text += "\n " + tmpTask[clsName]["namespaces"] + " {";
      for (fun in tmpTask[clsName]["var"]) {
        Text += "\n    " + tmpTask[clsName]["var"][fun];
      }
      for (fun in tmpTask[clsName]["function"]) {
        Text += "\n    " + tmpTask[clsName]["function"][fun];
        isFilled = true;
      }
      if (isFilled) {
        Text += "\n  ";
      }
      Text += "}";
    } else if (tmpTask[clsName]["uselibs"]) {
      for (var i = 0; i < tmpTask[clsName]["interface"].length; i++) {
        Text += "\n  " + tmpTask[clsName]["interface"][i].replace(/\n/g, "\n  ");
      }
      Text += "\n " + tmpTask[clsName]["uselibs"];
      for (var i = 0; i < tmpTask[clsName]["type"].length; i++) {
        Text += "\n  " + tmpTask[clsName]["type"][i].replace(/\n/g, "\n  ");
      }
      var isFilled = false;
      Text += "\n " + tmpTask[clsName]["namespaces"] + " {";
      for (fun in tmpTask[clsName]["var"]) {
        Text += "\n    " + tmpTask[clsName]["var"][fun];
      }
      for (fun in tmpTask[clsName]["function"]) {
        Text += "\n    " + tmpTask[clsName]["function"][fun];
        isFilled = true;
      }
      if (isFilled) {
        Text += "\n  ";
      }
      Text += "}";
    }
  }
  Text += "\n\ttype LibNavigationRoutes = \"" + Navigations.join("\" | \"") + "\"\n"
  Text += "}"

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
  let old = fs.existsSync(path) && fs.readFileSync(path)
  hasChanged = old.toString().length != compare.length
  if (hasChanged) {
    console.log(path, 'CHANGED')
  }
  return hasChanged
}

/* CREATE REDUCER LIST */
function createReducer() {
  if (countRead >= countLoop) {
    // var CodeImporter = "";
    // var CodeReducer = "";
    // for (const key in Reducers) {
    //   if (HookReducers.includes(key)) {
    //     CodeImporter += "\nimport * as " + key + " from '../../." + Reducers[key] + "';";
    //   } else {
    //     CodeImporter += "\nimport " + key + " from '../../." + Reducers[key] + "';";
    //   }
    //   CodeReducer += "\n\t" + key + ": " + key + ".reducer,";
    // }
    // if (CodeReducer != "") {
    //   CodeReducer = CodeReducer.substr(0, CodeReducer.length - 1);
    // }
    // Text = "import { combineReducers } from 'redux'" +
    //   "\nimport { persistReducer } from 'redux-persist'" +
    //   "\nimport AsyncStorage from '@react-native-async-storage/async-storage'" + CodeImporter +
    //   "\n\nconst combiner = combineReducers({" + CodeReducer +
    //   "\n})\n\n" +
    //   "\nconst persistConfig = {" +
    //   "\n\tkey: 'root'," +
    //   "\n\tstorage: AsyncStorage," +
    //   "\n\twhitelist: ['" + Object.keys(Persistor).join('\',\'') + "']" +
    //   "\n}" +
    //   "\nconst reducers = (state, action) => {" +
    //   "\n\tif (action.type === 'user_class_delete') {" +
    //   "\n\t\tstate = undefined" +
    //   "\n\t}" +
    //   "\n\treturn combiner(state, action)" +
    //   "\n	}" +
    //   "\nexport default persistReducer(persistConfig, reducers)";
    // if (isChange(tmpDir + "reducers.js", Text)) {
    //   fs.writeFile(tmpDir + "reducers.js", Text, { flag: 'w' }, function (err) {
    //     if (err) {
    //       return console.log(err);
    //     }
    //   })
    // }
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

function createRouter() {
  var Task = "";
  var nav = "";
  var staticImport = []

  staticImport.push("const isEqual = require('react-fast-compare');\n")
  staticImport.push("export function applyStyle(style){ return style };\n")
  staticImport.push("export { default as useGlobalState } from '../../../node_modules/esoftplay/global';\n")
  staticImport.push("export { default as usePersistState } from '../../../node_modules/esoftplay/persist';\n")
  staticImport.push("export { default as useSafeState } from '../../../node_modules/esoftplay/state';\n")
  staticImport.push("export { default as esp } from '../../../node_modules/esoftplay/esp';\n")
  for (const module in Modules) {
    for (const task in Modules[module]) {
      nav = module + '/' + task;
      Navigations.push(nav);
      Task += "\t\t" + 'case "' + nav + '":' + "\n\t\t\t" + 'Out = require("../../.' + Modules[module][task] + '").default' + "\n\t\t\t" + 'break;' + "\n";
      /* ADD ROUTER EACH FILE FOR STATIC IMPORT */
      var item = "import { default as _" + ucword(module) + ucword(task) + " } from '../../." + Modules[module][task] + "';\n"
      if (HookModules.includes(nav)) {
        item += "" +
          "import * as " + ucword(module) + ucword(task) + SuffixHooksProperty + " from '../../." + Modules[module][task] + "';\n" +
          "const " + ucword(module) + ucword(task) + " = React.memo(_" + ucword(module) + ucword(task) + ", isEqual); \n" +
          // "const " + ucword(module) + ucword(task) + " = _" + ucword(module) + ucword(task) + "; \n" +
          "export { " + ucword(module) + ucword(task) + SuffixHooksProperty + ", " + ucword(module) + ucword(task) + " };\n"
      } else if (UseLibs.includes(nav)) {
        item += "" +
          "import * as " + ucword(module) + ucword(task) + SuffixHooksProperty + " from '../../." + Modules[module][task] + "';\n" +
          "const " + ucword(module) + ucword(task) + " = _" + ucword(module) + ucword(task) + "; \n" +
          "export { " + ucword(module) + ucword(task) + SuffixHooksProperty + ", " + ucword(module) + ucword(task) + " };\n"
      } else {
        item += "export { _" + ucword(module) + ucword(task) + " as " + ucword(module) + ucword(task) + " };\n"
      }
      if (module == 'lib' && task == 'component') {
        staticImport.splice(0, 0, item)
      } else if (module == 'lib' && task == 'style') {
        staticImport.splice(0, 0, item)
      } else if (module == 'lib' && task == 'sqlite') {
        staticImport.splice(1, 0, item)
      } else if (module == 'lib' && task == 'worker_data') {
        staticImport.splice(2, 0, item)
      } else if (module == 'lib' && task == 'worker') {
        staticImport.splice(2, 0, item)
      } else if (module == 'lib' && task == 'navigation') {
        staticImport.splice(2, 0, item)
      } else {
        staticImport.push(item);
      }
    }
  }
  staticImport.splice(0, 0, "export { default as createCache } from '../../../node_modules/esoftplay/_cache';\n")
  staticImport.splice(0, 0, "export { default as _global } from '../../../node_modules/esoftplay/_global';\n")
  staticImport.splice(0, 0, "import React from 'react';\n")
  const x = staticImport.join('')
  if (isChange(tmpDir + 'index.js', x))
    fs.writeFile(tmpDir + 'index.js', x, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });

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
      const [module, task] = nav.split('/')
      const comp = ucword(module) + ucword(task)
      importer.push(comp)
      screens.push("\t\t\t\t<Stack.Screen name={\"" + nav + "\"} component={" + comp + "} />")
    })

    let N = Nav5(importer.join(", "), screens.join("\n"))

    fs.writeFile(tmpDir + "navs.tsx", N, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }
}
