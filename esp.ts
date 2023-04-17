import { LibLocale } from 'esoftplay/cache/lib/locale/import';
import { LogBox, Platform } from 'react-native';
import 'react-native-reanimated';
import './oneplusfixfont';

const ignoreWarns = [
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation",
  "ViewPropTypes will be removed",
  "AsyncStorage has been extracted from react-native",
  "EventEmitter.removeListener",
  "Got a component with the name 'm'",
  "Did not receive response to shouldStartLoad in time",
  "startLoadWithResult invoked with invalid lockldentifier",
];

const err = console.error;
console.error = (...arg) => {
  for (let i = 0; i < ignoreWarns.length; i++) {
    if (arg?.[0]?.startsWith?.(ignoreWarns[i])) return;
  }
  err(...arg);
};

const warn = console.warn;
console.warn = (...arg) => {
  for (let i = 0; i < ignoreWarns.length; i++) {
    if (arg?.[0]?.startsWith?.(ignoreWarns[i])) return;
  }
  warn(...arg);
};
LogBox.ignoreLogs(ignoreWarns);

let app = require('../../app.json');
let conf = require('../../config.json');
if (!__DEV__) {
  if (Platform.OS == 'web') {
    conf.config.domain = window.location.hostname
  }
}
let lconf: any
try {
  lconf = require('../../config.live.json');
} catch (error) {

}
if (conf?.config?.isDebug == 0)
  LogBox.ignoreAllLogs();

const esp = {
  mergeDeep(target: any, ...sources: any[]) {
    target = Object(target);
    for (const source of sources) {
      const sourceObj = Object(source);
      for (const [key, value] of Object.entries(sourceObj)) {
        if (value ?? null !== null) {
          if (value !== null && typeof value === "object") {
            target[key] = esp.mergeDeep(target[key] ?? {}, value);
          } else {
            target[key] = value;
          }
        }
      }
    }
    return target;
  },
  appjson(): any {
    return esp.mergeDeep(app, conf)
  },
  assets(path: string): any {
    const _assets = require('./cache/assets')
    return _assets(path)
  },
  versionName(): string {
    const Platform = require('react-native').Platform
    const Constants = require('expo-constants').default
    return (Platform.OS == 'android' ? Constants?.manifest?.android?.versionCode : Constants?.manifest?.ios?.buildNumber) + '-' + esp.config('publish_id')
  },
  config(param?: string, ...params: string[]): any {
    let out: any = esp._config();
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
  },
  isDebug(message: string): boolean {
    if (!lconf) {
      return false
    }
    return conf.config.domain != lconf.config.domain
  },
  readDeepObj(obj: any) {
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
  },
  lang(moduleTask: string, langName: string, ...stringToBe: string[]): string {
    let string = LibLocale.stateLang().get()?.[esp.langId()]?.[moduleTask]?.[langName]
    if (!string) {
      string = esp.assets("locale/id.json")[moduleTask][langName]
    }
    function sprintf(string: string, index: number): string {
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
  },
  langId(): string {
    const LibLocale = esp.mod('lib/locale');
    return LibLocale.state().get()
  },
  mod(path: string): any {
    var modtast = path.split("/");
    if (modtast[1] == "") {
      modtast[1] = "index";
    }
    const routers = require('./cache/routers')
    return routers(modtast.join("/"));
  },
  modProp(path: string): any {
    var modtast = path.split("/");
    if (modtast[1] == "") {
      modtast[1] = "index";
    }
    const properties = require('./cache/properties')
    return properties(modtast.join("/"));
  },
  _config(): string {
    app = esp.mergeDeep(app, conf)
    var msg = ''
    if (!app.hasOwnProperty('config')) {
      msg = "tidak ada config"
    } else if (!app.config.hasOwnProperty('domain') || app.config.domain.length == 0) {
      msg = "config tidak ada domain"
    } else if (!app.config.hasOwnProperty('salt') || app.config.salt.length == 0) {
      msg = "config tidak ada salt"
    } else if (!app.config.hasOwnProperty("experienceId") || app.config.experienceId.length == 0){
      msg = "config experienceId harus diisi dengan @esoftplay/[slug]"
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
      ...conf.config
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
  },
  navigations(): string[] {
    const navs = require('./cache/navs').default
    return navs;
  },
  home(): any {
    return esp.mod('user/index');
  },
  routes(): any {
    const UserRoutes = esp.mod('user/routes');
    return UserRoutes.state().get();
  },
  log(message?: any, ...optionalParams: any[]) {
    if (esp.config("isDebug") == 1) {
      let out = [message]
      if (optionalParams)
        out.push(...optionalParams)
      out.forEach((x) => {
        if (x != undefined)
          console.log(JSON.stringify(x, undefined, 2), "\x1b[0m");
        else
          console.log(x, "\x1b[0m")
      })
    }
  },
  logColor: {
    reset: "\x1b[0m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    backgroundBlack: "\x1b[40m",
    backgroundRed: "\x1b[41m",
    backgroundGreen: "\x1b[42m",
    backgroundYellow: "\x1b[43m",
    backgroundBlue: "\x1b[44m",
    backgroundMagenta: "\x1b[45m",
    backgroundCyan: "\x1b[46m",
    backgroundWhite: "\x1b[47m",
  }
}

export default esp

// var a = esp.assets("bacground")     // mengambil file dari folder images
// var b = esp.config("data", "name")  // mengambil value dari config (bisa ditentukan di app.json)
// var c = esp.mod("module/task")      // mengeksekusi module/task
// var e = esp.home()                  // mengkesekusi module/task untuk halaman pertama
// var f = esp.log("pesan")            // log yang tampil jika di app.json -> isDebug == 1
// var g = esp.routes()                // mengambil history status navigasi yang sedang berjalan
