#!/usr/bin/env node
//@ts-check
/* EXECUTED ON `ESP START` TO BUILD FILE CACHES */
const fs = require('fs');
var checks = ['./node_modules/esoftplay/modules/', './modules/', './templates/'];
var pathAsset = "./assets";
var tmpDir = "./node_modules/esoftplay/cache/";
var typesDir = "./"
var replacer = new RegExp(/(?:\-|\.(?:ios|android))?\.(?:jsx|js|ts|tsx)$/);
var Text = "";

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
var UseLibs = []
var SuffixHooksProperty = ('Property').trim()
var NavsExclude = {};
var NavsOrientation = {};
var countLoop = 0; // jumlah file yang telah dihitung
var countRead = 0; // jumlah file yang telah di baca

var Nav5 = (importer, navs) => {
  return (`
// @ts-nocheck
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${importer}
import { Platform } from 'react-native';
const Stack = createNativeStackNavigator();
const config = require('../../../config.json')
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';
import { memo } from 'react';

function m(props): any {
  const userEmail = UserClass.state().useSelector((s) => s?.email)
  const econf = config.config
  const appOrientation = econf?.orientation ? String(econf.orientation) : 'portrait'

  return (
    <NavigationContainer
      ref={(r) => LibNavigation.setRef(r)}
      onReady={() => { LibNavigation.setIsReady(true) }}
      onStateChange={UserRoutes.state().set} >
      <Stack.Navigator
        headerMode="none"
        initialRouteName={userEmail ? econf.home.member : econf.home.public}
        screenOptions={{ orientation: appOrientation, headerShown: false, contentStyle: { backgroundColor: 'white' }, animation: Platform.OS == 'ios' ? 'default' : 'none', stackPresentation: 'push' }}>
`+ navs + `
      </Stack.Navigator>
    </NavigationContainer>
  )
}
export default memo(m)
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
            countLoop++
            fs.readFile(modules + module + "/" + file, "utf8", function (err, data) {
              if (err) {
                return console.log(err)
              } else {
                if ((/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))noPage/).exec(data)) {
                  NavsExclude[module + '/' + file.slice(0, file.lastIndexOf('.'))] = true
                } else {
                  NavsExclude[module + '/' + file.slice(0, file.lastIndexOf('.'))] = false
                }
                const m = (/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))orientation:([a-zAZ_]+)/).exec(data)
                if (m) {
                  NavsOrientation[module + '/' + file.slice(0, file.lastIndexOf('.'))] = m?.[1]
                }
                if ((/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))withObject/).exec(data)) {
                  UseLibs.push(module + "/" + name)
                }
                if ((/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))useLibs/).exec(data)) {
                  UseLibs.push(module + "/" + name)
                }
                if ((/\n?(?:(?:\/\/\s{0,})|(?:\/\*\s{0,}))withHooks/).exec(data)) {
                  HookModules.push(module + "/" + name)
                }
              }
              countRead++;
              createReducer()
            })
          }
        });
      }
    })
  }
})

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
  let importer = []
  AllRoutes.forEach((nav) => {
    const [module, task] = nav.split('/')
    const comp = ucword(module) + ucword(task)
    importer.push(`import { ${comp} } from ${'"esoftplay/cache/' + module + '/' + task + '/import"'} `)
  })
  var PreText = ''
  var Text = `
import { Component } from 'react';
import { AntDesignTypes, EntypoTypes, EvilIconsTypes, FeatherTypes, FontAwesomeTypes, FontistoTypes, FoundationTypes, IoniconsTypes, MaterialCommunityIconsTypes, MaterialIconsTypes, OcticonsTypes, SimpleLineIconsTypes, ZocialTypes, } from '@expo/vector-icons/build/esoftplay_icons'
${importer.join('\n')}
declare module "esoftplay" {
  function applyStyle<T>(style: T): T;
  `;
  Text += "\n\ttype LibNavigationRoutes = \"" + Navigations.join("\" |\n\t\t\t \"") + "\"\n"
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
  }
}
/* === */
function ucword(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
/* CREATE ROUTER LIST */
var Navigations = [];
var AllRoutes = []

function createRouter() {
  var Task = "";
  var dTask = "";
  var dImportArgs = "";
  var dArgs = "";
  var dImportTask = "";
  var TaskProperty = "";
  var dTaskProperty = "";
  var dImportTaskProperty = "";
  var nav = "";
  var staticImport = []

  staticImport.push("export function applyStyle(style){ return style };\n")
  staticImport.push("export { default as useGlobalState } from '../../../node_modules/esoftplay/global';\n")
  staticImport.push("export { default as usePersistState } from '../../../node_modules/esoftplay/persist';\n")
  staticImport.push("export { default as useGlobalSubscriber } from '../../../node_modules/esoftplay/subscribe';\n")
  staticImport.push("export { default as useSafeState } from '../../../node_modules/esoftplay/state';\n")
  staticImport.push("export { default as useLazyState } from '../../../node_modules/esoftplay/lazy';\n")
  staticImport.push("export { default as esp } from '../../../node_modules/esoftplay/esp';\n")
  staticImport.push("export { default as _global } from '../../../node_modules/esoftplay/_global';\n")

  for (const module in Modules) {
    for (const task in Modules[module]) {
      nav = module + '/' + task;
      if (NavsExclude[nav] == false) {
        Navigations.push(nav);
      }
      AllRoutes.push(nav)
      Task += "\t\t" + 'case "' + nav + '":' + "\n\t\t\t" + 'Out = require("../../.' + Modules[module][task] + '")?.default' + "\n\t\t\t" + 'break;' + "\n";
      dImportTask += `import ${ucword(module) + ucword(task)} from '../../.${Modules[module][task]}';\n`;
      dTask += `"${nav}": typeof ${ucword(module) + ucword(task)};\n\t`;

      TaskProperty += "\t\t" + 'case "' + nav + '":' + "\n\t\t\t" + 'Out = require("../../.' + Modules[module][task] + '")' + "\n\t\t\t" + 'break;' + "\n";
      dImportTaskProperty += `import * as ${ucword(module) + ucword(task) + 'Property'} from '../../.${Modules[module][task]}';\n`;
      dTaskProperty += `"${nav}": typeof ${ucword(module) + ucword(task) + "Property"};\n\t`;

      if (NavsExclude[nav] == false) {
        dImportArgs += `import { ${ucword(module) + ucword(task) + 'Args }'} from '../../.${Modules[module][task]}';\n`;
        dArgs += `"${nav}": ${ucword(module) + ucword(task) + "Args"};\n\t`;
      }

      /* ADD ROUTER EACH FILE FOR STATIC IMPORT */
      var item = `import { stable } from 'usestable';\n`
      var deItem = ``
      if (nav == 'lib/crypt') {
        deItem = `
export class LibCrypt {
  encode(text: string): string;
  decode(text: string): string;
}
        `
      } else {
        deItem = `
export { default as ${ucword(module) + ucword(task)} } from '../../../../.${Modules[module][task]}';
export * as ${ucword(module) + ucword(task) + SuffixHooksProperty} from '../../../../.${Modules[module][task]}';`
      }
      if (HookModules.includes(nav)) {
        item += "" +
          "import React from 'react'\n" +
          "const _" + ucword(module) + ucword(task) + " = React.lazy(() => import('../../../../." + Modules[module][task] + "')); \n" +
          "import * as " + ucword(module) + ucword(task) + SuffixHooksProperty + " from '../../../../." + Modules[module][task] + "';\n" +
          "const UpdatedComponent = (OriginalComponent) => { function " + ucword(module) + ucword(task) + "Component(props) { return ( <React.Suspense><OriginalComponent {...props} /></React.Suspense> ) } return " + ucword(module) + ucword(task) + "Component; };\n" +
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

      if (!nav.includes('.')) {
        if (!fs.existsSync(tmpDir + module))
          fs.mkdirSync(tmpDir + module);

        if (!fs.existsSync(tmpDir + nav))
          fs.mkdirSync(tmpDir + nav)

        if (isChange(tmpDir + nav + '/import.d.ts', deItem)) {
          fs.writeFile(tmpDir + nav + '/import.d.ts', deItem, { flag: 'w' }, function (err) {
            if (err) {
              return console.log(err);
            }
          });
        }

        if (isChange(tmpDir + nav + "/import.js", item)) {
          fs.writeFile(tmpDir + nav + '/import.js', item, { flag: 'w' }, function (err) {
            if (err) {
              return console.log(err);
            }
          });
        }
      }
    }
  }

  const x = staticImport.join('')
  if (isChange(tmpDir + 'index.js', x))
    fs.writeFile(tmpDir + 'index.js', x, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });

  let dProps = `\n${dImportTaskProperty}
    export interface EspRouterPropertyInterface {
      ${dTaskProperty}
    }`
  if (isChange(tmpDir + "properties.d.ts", dProps)) {
    fs.writeFile(tmpDir + "properties.d.ts", dProps, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }
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

  let Text = `\n${dImportTask}
export interface EspRouterInterface {
  ${dTask}
}`
  if (isChange(tmpDir + "routers.d.ts", Text)) {
    fs.writeFile(tmpDir + "routers.d.ts", Text, { flag: 'w' }, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }

  Text = `\n${dImportArgs}
export interface EspArgsInterface {
  ${dArgs}
}`
  if (isChange(tmpDir + "args.d.ts", Text)) {
    fs.writeFile(tmpDir + "args.d.ts", Text, { flag: 'w' }, function (err) {
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
    importer.push(`import { ${comp} } from ${'"esoftplay/cache/' + module + '/' + task + '/import"'} `)
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