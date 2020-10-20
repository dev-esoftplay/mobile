import React from 'react';
import { Platform, AsyncStorage, Alert } from 'react-native';
import { LibCurl, LibUtils } from 'esoftplay';
import Constants from 'expo-constants';
let config = require('../../config.json');
let pack = require('../../package.json');
let app = require('../../app.json');

let spacing = "  ";

function getType(obj) {
  let type = typeof obj;
  if (obj instanceof Array) {
    return 'array';
  } else if (type == 'string') {
    return 'string';
  } else if (type == 'boolean') {
    return 'boolean';
  } else if (type == 'number') {
    return 'number';
  } else if (type == 'undefined' || obj === null) {
    return 'null';
  } else {
    return 'hash';
  }
}

function convert(obj, ret) {
  let type = getType(obj);

  switch (type) {
    case 'array':
      convertArray(obj, ret);
      break;
    case 'hash':
      convertHash(obj, ret);
      break;
    case 'string':
      convertString(obj, ret);
      break;
    case 'null':
      ret.push('null');
      break;
    case 'number':
      ret.push(obj.toString());
      break;
    case 'boolean':
      ret.push(obj ? 'true' : 'false');
      break;
  }
}

function convertArray(obj, ret) {
  if (obj.length === 0) {
    ret.push('[]');
  }
  for (let i = 0; i < obj.length; i++) {

    let ele = obj[i];
    let recurse = [];
    convert(ele, recurse);

    for (let j = 0; j < recurse.length; j++) {
      ret.push((j == 0 ? "- " : spacing) + recurse[j]);
    }
  }
}

function convertHash(obj, ret) {
  for (let k in obj) {
    let recurse = [];
    if (obj.hasOwnProperty(k)) {
      let ele = obj[k];
      convert(ele, recurse);
      let type = getType(ele);
      if (type == 'string' || type == 'null' || type == 'number' || type == 'boolean') {
        ret.push(normalizeString(k) + ': ' + recurse[0]);
      } else {
        ret.push(normalizeString(k) + ': ');
        for (let i = 0; i < recurse.length; i++) {
          ret.push(spacing + recurse[i]);
        }
      }
    }
  }
}

function normalizeString(str) {
  if (str.match(/^[\w]+$/)) {
    return str;
  } else {
    return '"' + escape(str).replace(/%u/g, '\\u').replace(/%U/g, '\\U').replace(/%/g, '\\x') + '"';
  }
}

function convertString(obj, ret) {
  ret.push(normalizeString(obj));
}

const json2yaml = function (obj) {
  if (typeof obj == 'string') {
    obj = JSON.parse(obj);
  }

  let ret = [];
  convert(obj, ret);
  return ret.join("\n");
};

const defaultErrorHandler = ErrorUtils.getGlobalHandler()

const myErrorHandler = (e: any, isFatal: any) => {
  setError(e)
  defaultErrorHandler(e, isFatal)
}

export function setError(error?: any) {
  let routes = LibUtils.getReduxState('user_index')
  const user = LibUtils.getReduxState("user_class")
  let lastIndex = routes?.routes?.length - 1 || -1
  if (lastIndex >= 0) {
    let _e: any = {}
    _e['user'] = user
    _e['error'] = json2yaml(error)
    _e['routes'] = routes?.routes?.[lastIndex]?.name
    AsyncStorage.setItem(config?.config?.domain + 'error', JSON.stringify(_e))
  }
}

export function reportApiError(fetch: any, error: any) {
  config?.config?.errorReport?.telegramIds?.forEach?.((id: string) => {
    const user = LibUtils.getReduxState("user_class")
    const msg = [
      'slug: ' + "#" + app.expo.slug,
      'dev: ' + Platform.OS + ' - ' + Constants.deviceName,
      'app/pub_id: ' + Constants.appOwnership + '/' + (config?.config?.publish_id || '-'),
      'user_id: ' + user?.id || user?.user_id || '-',
      'username: ' + user?.username || '-',
      'publish_id: ' + config?.config?.publish_id || "-",
      'fetch: ' + json2yaml(fetch),
      'error: ' + error
    ].join('\n')
    let post = {
      text: msg,
      chat_id: id,
      disable_web_page_preview: true
    }
    new LibCurl().custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
  })
}

export function getError(adder: any) {
  AsyncStorage.getItem(config.config.domain + 'error').then((e: any) => {
    if (e) {
      let _e = JSON.parse(e)
      let msg = [
        'slug: ' + "#" + app.expo.slug,
        'name: ' + app.expo.name + ' - sdk' + pack.dependencies.expo,
        'domain: ' + config.config.domain + config.config.uri,
        'package: ' + (Platform.OS == 'ios' ? app.expo.ios.bundleIdentifier : app.expo.android.package) + ' - v' + (Platform.OS == 'ios' ? app.expo.ios.buildNumber : app.expo.android.versionCode),
        'device: ' + Platform.OS + ' | ' + Constants.deviceName,
        'publish_id: ' + config?.config?.publish_id || "-",
        'user_id: ' + _e?.user?.id || _e?.user?.user_id || '-',
        'username: ' + _e?.user?.username || '-',
        'module: ' + _e.routes,
        'error: \n' + json2yaml(adder?.exp?.lastErrors),
      ].join('\n')
      config?.config?.errorReport?.telegramIds?.forEach?.((id: string) => {
        let post = {
          text: msg,
          chat_id: id,
          disable_web_page_preview: true
        }
        new LibCurl().custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
      });
      AsyncStorage.removeItem(config.config.domain + 'error')
    }
  })
}
ErrorUtils.setGlobalHandler(myErrorHandler)
