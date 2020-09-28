import React from 'react';
import _assets from './cache/assets';
import reducers from './cache/reducers';
import navs from './cache/navigations';
import routers from './cache/routers';
import { connect as _connect } from 'react-redux';
import { _global, esp } from 'esoftplay';
let app = require('../../app.json');
let conf = require('../../config.json');
let lconf = require('../../config.live.json');

export default (() => {
  function mergeDeep(target: any, source: any): any {
    const isObject = (obj) => obj && typeof obj === 'object';
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  }
  app = mergeDeep(app, conf)

  function appjson(): any {
    return app
  }

  function assets(path: string): any {
    return _assets(path)
  }

  function config(param?: string, ...params: string[]): any {
    let out: any = _config();
    if (param) {
      var _params = [param, ...params]
      if (_params.length > 0)
        for (let i = 0; i < _params.length; i++) {
          const key = _params[i];
          if (out.hasOwnProperty(key)) {
            out = out[key];
          } else {
            out = {};
          }
        }
    }
    return out;
  }

  function isDebug(): boolean {
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
            const key = _params[i];
            if (out.hasOwnProperty(key)) {
              out = out[key];
            } else {
              out = undefined;
            }
          }
      }
      return out;
    }
  }

  function lang(moduleTask: string, langName: string, ...stringToBe: string[]): string {
    let string = readDeepObj(esp.assets("locale/" + langId() + ".json"))(moduleTask, langName)
    if (!string) {
      string = readDeepObj(esp.assets("locale/id.json"))(moduleTask, langName)
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
    const _store: any = _global.store.getState()
    return _store.lib_locale.lang_id
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
      msg = "app.json tidak ada config"
    } else if (!app.config.hasOwnProperty('domain') || app.config.domain.length == 0) {
      msg = "app.json di config tidak ada domain"
    } else if (!app.config.hasOwnProperty('salt') || app.config.salt.length == 0) {
      msg = "app.json di config tidak ada salt"
    }
    if (msg != '') {
      let error = new Error(msg);
      throw error;
    }

    var config = app.config;
    if (!config.hasOwnProperty('timezone') || config.timezone.length == 0) {
      config.timezone = 'Asia/Jakarta';
    }
    if (!config.hasOwnProperty('protocol') || config.protocol.length == 0) {
      config.protocol = 'http';
    }
    if (!config.hasOwnProperty('uri') || config.uri.length == 0) {
      config.uri = "/";
    }
    if (!config.hasOwnProperty('api') || config.api.length == 0) {
      config.api = "api";
    }
    if (!config.hasOwnProperty('data') || config.data.length == 0) {
      config.data = "data";
    }
    if (!config.hasOwnProperty('url') || config.url.length == 0) {
      config.url = config.protocol + "://" + config.api + "." + config.domain + config.uri;
    }
    if (!config.hasOwnProperty('content') || config.content.length == 0) {
      config.content = config.protocol + "://" + config.data + "." + config.domain + config.uri;
    }
    if (config.hasOwnProperty('home') && config.home.length != 0) {
      if (!config.home.hasOwnProperty('member') || config.home.member.length == 0) {
        config.home.member = "content/index";
      }
      if (!config.home.hasOwnProperty('public') || config.home.public.length == 0) {
        config.home.public = "content/index";
      }
    } else {
      config.home = {};
      config.home.member = "content/index";
      config.home.public = "content/index";
    }
    if (!config.hasOwnProperty('api') || config.api.length == 0) {
      config.api = "api";
    }
    if (!config.hasOwnProperty('group_id')) {
      config.group_id = '0'
    }
    if (!config.hasOwnProperty('langIds')) {
      config.langIds = ["id", "en"];
    }
    if (!config.hasOwnProperty('theme')) {
      config.theme = ['light', 'dark']
    }
    if (!config.hasOwnProperty('comment_login')) {
      config.comment_login = 1;
    }
    if (!config.hasOwnProperty('notification')) {
      config.notification = 0;
    }
    if (!config.hasOwnProperty("isDebug")) {
      config.isDebug = __DEV__ ? 1 : 0;
    }

    config.webviewOpen = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1" /> <link href="' + config.content + 'user/editor_css" rel="stylesheet" /> <script type="text/javascript">var _ROOT="' + config.uri + '";var _URL="' + config.content + '";function _Bbc(a,b){var c="BS3load_func";if(!window[c+"i"]){window[c+"i"]=0};window[c+"i"]++;if(!b){b=c+"i"+window[c+"i"]};if(!window[c]){window[c]=b}else{window[c]+=","+b}window[b]=a;if(typeof BS3!="undefined"){window[b](BS3)}};</script> <style type="text/css">body {padding: 0 20px;}</style></head> <body>';
    config.webviewClose = '<script src="' + config.content + 'templates/admin/bootstrap/js/bootstrap.min.js"></script> </body> </html>';
    return config;
  }
  function reducer(): any {
    return reducers;
  }
  function navigations(): string[] {
    return navs;
  }
  function home(): any {
    return mod('user/index');
  }
  function routes(): any {
    var _store: any = _global.store.getState();
    return _store.user_index;
  }
  function dispatch(action: any): void {
    _global.store.dispatch(action)
  }
  function connect(mapStateToProps: any, cls: any): any {
    return _connect(mapStateToProps)(cls)
  }
  function log(message?: any, ...optionalParams: any[]) {
    if (config("isDebug") == 1) {
      console.log(message, ...optionalParams);
    }
  }
  return { appjson, connect, dispatch, log, home, isDebug, navigations, reducer, langId, lang, config, assets, routes, mod }
})()

// var a = esp.assets("bacground")     // mengambil file dari folder images
// var b = esp.config("data", "name")  // mengambil value dari config (bisa ditentukan di app.json)
// var c = esp.mod("module/task")      // mengeksekusi module/task
// var d = esp.reducers()              // mengambil semua reducer
// var e = esp.home()                  // mengkesekusi module/task untuk halaman pertama
// var f = esp.log("pesan")            // log yang tampil jika di app.json -> isDebug == 1
// var g = esp.routes()                // mengambil history status navigasi yang sedang berjalan
