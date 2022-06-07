import { esp, LibLocale, UserRoutes } from 'esoftplay';
import Constants from 'expo-constants';
import { LogBox, Platform } from 'react-native';
import 'react-native-reanimated';
import _assets from './cache/assets';
import navs from './cache/navigations';
import routers from './cache/routers';
import './oneplusfixfont';
const ignoreWarns = [
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation",
  "ViewPropTypes will be removed",
  "AsyncStorage has been extracted from react-native",
  "EventEmitter.removeListener",
  "Got a component with the name 'm'",
  "Did not receive response to shouldStartLoad in time",
  "startLoadWithResult invoked with invalid lockldentifier:",
];

const err = console.error;
console.error = (...arg) => {
  for (let i = 0; i < ignoreWarns.length; i++) {
      if (arg[0].startsWith(ignoreWarns[i])) return;
  }
  err(...arg);
};

const warn = console.warn;
console.warn = (...arg) => {
  for (let i = 0; i < ignoreWarns.length; i++) {
      if (arg[0].startsWith(ignoreWarns[i])) return;
  }
  warn(...arg);
};
LogBox.ignoreLogs(ignoreWarns);
let app = require('../../app.json');
let conf = require('../../config.json');
let lconf
try {
  lconf = require('../../config.live.json');
} catch (error) {

}

export default (() => {
  function mergeDeep(target, ...sources) {
    target = Object(target);
    for (let source of sources) {
      source = Object(source);
      for (let key in source) {
        if (source.hasOwnProperty(key)) {
          if (source[key] && typeof source[key] === 'object') {
            target[key] = mergeDeep(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  }
  app = mergeDeep(app, conf)

  function appjson(): any {
    return app
  }

  function assets(path: string): any {
    return _assets(path)
  }

  function versionName(): string {
    return (Platform.OS == 'android' ? Constants.manifest.android.versionCode : Constants.manifest.ios.buildNumber) + '-' + config('publish_id')
  }

  function config(param?: string, ...params: string[]): any {
    let out: any = _config();
    if (param) {
      var _params = [param, ...params]
      if (_params.length > 0)
        for (let i = 0; i < _params.length; i++) {
          const key = _params[i];
          if (out?.hasOwnProperty?.(key)) {
            out = out[key];
          } else {
            out = {};
          }
        }
    }
    return out;
  }

  function isDebug(message: string): boolean {
    if (!lconf) {
      return false
    }
    return conf.config.domain != lconf.config.domain
  }

  function readDeepObj(obj: any) {
    return function (param?: string, ...params: string[]): any {
      let out: any = obj
      if (param) {
        var _params = [param, ...params]
        if (_params.length > 0)
          for (let i = 0; i < _params.length; i++) {
            out = out?.[_params[i]];
            if (out == undefined) {
              break;
            }
          }
      }
      return out;
    }
  }

  function lang(moduleTask: string, langName: string, ...stringToBe: string[]): string {
    let string = esp.assets("locale/" + langId() + ".json")?.[moduleTask]?.[langName]
    if (!string) {
      string = esp.assets("locale/id.json")[moduleTask][langName]
    }
    function sprintf(string: string, index: number) {
      if (stringToBe[index] != undefined) {
        string = string.replace("%s", stringToBe[index])
        if (string.includes("%s")) {
          return sprintf(string, index + 1)
        }
      }
      return string
    }
    if (string.includes("%s")) {
      string = sprintf(string, 0)
    }
    return string
  }

  function langId(): string {
    return LibLocale.state().get()
  }

  function mod(path: string): any {
    var modtast = path.split("/");
    if (modtast[1] == "") {
      modtast[1] = "index";
    }
    return routers(modtast.join("/"));
  }

  function _config(): string {
    var msg = ''
    if (!app.hasOwnProperty('config')) {
      msg = "tidak ada config"
    } else if (!app.config.hasOwnProperty('domain') || app.config.domain.length == 0) {
      msg = "config tidak ada domain"
    } else if (!app.config.hasOwnProperty('salt') || app.config.salt.length == 0) {
      msg = "config tidak ada salt"
    }
    if (msg != '') {
      let error = new Error(msg);
      throw error;
    }

    var config = {
      // default config
      timezone: "Asia/Jakarta",
      protocol: "http",
      uri: "/",
      api: "api",
      data: "data",
      home: {
        member: "content/index",
        public: "content/index"
      },
      group_id: 0,
      langIds: ["id", "en"],
      theme: ["light", "dark"],
      comment_login: 1,
      notification: 0,
      isDebug: __DEV__ ? 1 : 0,
      ...app.config
    }
    if (!config.hasOwnProperty('url') || config.url.length == 0) {
      config.url = config.protocol + "://" + config.api + "." + config.domain + config.uri;
    }
    if (!config.hasOwnProperty('content') || config.content.length == 0) {
      config.content = config.protocol + "://" + config.data + "." + config.domain + config.uri;
    }
    config.webviewOpen = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1" /> <link href="' + config.content + 'user/editor_css" rel="stylesheet" /> <script type="text/javascript">var _ROOT="' + config.uri + '";var _URL="' + config.content + '";function _Bbc(a,b){var c="BS3load_func";if(!window[c+"i"]){window[c+"i"]=0};window[c+"i"]++;if(!b){b=c+"i"+window[c+"i"]};if(!window[c]){window[c]=b}else{window[c]+=","+b}window[b]=a;if(typeof BS3!="undefined"){window[b](BS3)}};</script> <style type="text/css">body {padding: 0 20px;}</style></head> <body>';
    config.webviewClose = '<script src="' + config.content + 'templates/admin/bootstrap/js/bootstrap.min.js"></script> </body> </html>';
    return config;
  }

  function navigations(): string[] {
    return navs;
  }
  function home(): any {
    return mod('user/index');
  }
  function routes(): any {
    return UserRoutes.state().get();
  }
  function log(message?: any, ...optionalParams: any[]) {
    if (config("isDebug") == 1) {
      console.log(message, ...optionalParams);
    }
  }
  return { appjson, log, home, isDebug, navigations, langId, lang, config, assets, routes, mod, versionName }
})()

// var a = esp.assets("bacground")     // mengambil file dari folder images
// var b = esp.config("data", "name")  // mengambil value dari config (bisa ditentukan di app.json)
// var c = esp.mod("module/task")      // mengeksekusi module/task
// var e = esp.home()                  // mengkesekusi module/task untuk halaman pertama
// var f = esp.log("pesan")            // log yang tampil jika di app.json -> isDebug == 1
// var g = esp.routes()                // mengambil history status navigasi yang sedang berjalan
