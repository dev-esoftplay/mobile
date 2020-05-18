import React from 'react';
import { Platform, AsyncStorage, Alert } from 'react-native';
import { LibCurl, LibUtils } from 'esoftplay';
import Constants from 'expo-constants';
let config = require('../../config.json');
let pack = require('../../package.json');
let app = require('../../app.json');

const defaultErrorHandler = ErrorUtils.getGlobalHandler()
const myErrorHandler = (e: any, isFatal: any) => {
  setError()
  defaultErrorHandler(e, isFatal)
}

export function setError(error?: any) {
  let routes = LibUtils.getReduxState('user_index')
  const user = LibUtils.getReduxState("user_class")
  let lastIndex = routes.routes.length - 1
  let _e: any = {}
  _e['user'] = user
  _e['error'] = error
  _e['routes'] = routes.routes[lastIndex].routeName
  AsyncStorage.setItem(config.config.domain + 'error', JSON.stringify(_e))
}

export function reportApiError(fetch: any, error: any) {
  config.config && config.config.errorReport && config.config.errorReport.telegramIds && config.config.errorReport.telegramIds.forEach((id: string) => {
    const user = LibUtils.getReduxState("user_class")
    let post = {
      text: JSON.stringify({
        slug: "#" + app.expo.slug,
        user_id: user && (user.id || user.user_id) || '-',
        fetch,
        error,
        app: Constants.appOwnership,
        publish_id: config.config.hasOwnProperty("publish_id") ? config.config.publish_id : "-",
        device: Platform.OS + ' - ' + Constants.deviceName
      }, undefined, 2),
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
      let msg = {
        slug: "#" + app.expo.slug,
        name: app.expo.name + ' - sdk' + pack.dependencies.expo,
        domain: config.config.domain + config.config.uri,
        module: _e.routes,
        package: (Platform.OS == 'ios' ? app.expo.ios.bundleIdentifier : app.expo.android.package) + ' - v' + (Platform.OS == 'ios' ? app.expo.ios.buildNumber : app.expo.android.versionCode),
        device: Platform.OS + ' - ' + Constants.deviceName,
        error: adder && adder.exp && adder.exp.lastErrors || '-',
        errorApi: _e.error,
        publish_id: config.config.hasOwnProperty("publish_id") ? config.config.publish_id : "-",
        user_id: _e.user && (_e.user.id || _e.user.user_id) || '-'
      }
      config.config && config.config.errorReport && config.config.errorReport.telegramIds && config.config.errorReport.telegramIds.forEach((id: string) => {
        let post = {
          text: JSON.stringify(msg, undefined, 2),
          chat_id: id,
          disable_web_page_preview: true
        }
        if (msg.error == '-') {
          msg.error = 'uncaught fatal error'
        }
        new LibCurl().custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
      });
      AsyncStorage.removeItem(config.config.domain + 'error')
    }
  })
}
ErrorUtils.setGlobalHandler(myErrorHandler)