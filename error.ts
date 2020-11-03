import React from 'react';
import { Platform, AsyncStorage, Alert } from 'react-native';
import { LibCurl, LibUtils } from 'esoftplay';
import Constants from 'expo-constants';
let config = require('../../config.json');
let pack = require('../../package.json');
let app = require('../../app.json');

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
    _e['error'] = JSON.stringify(error, undefined, 2).replace(/[\[\]\{\}\"]+/g, '')
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
      'fetch: ' + String(JSON.stringify(fetch, undefined, 2)).replace(/[\[\]\{\}\"]+/g, ''),
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
        'error: \n' + String(JSON.stringify(adder?.exp?.lastErrors, undefined, 2)).replace(/[\[\]\{\}\"]+/g, ''),
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
