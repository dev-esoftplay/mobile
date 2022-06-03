import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibCurl, UserClass } from 'esoftplay';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import esp from './esp';
import { default as UserRoutes } from './modules/user/routes';
let pack = require('../../package.json');
let app = require('../../app.json');
const { manifest } = Constants;


// const defaultErrorHandler = ErrorUtils?.getGlobalHandler?.()

const myErrorHandler = (e: any, isFatal: any) => {
  if (!manifest?.packagerOpts)
    setError(e)
  // defaultErrorHandler?.(e, isFatal)
}

export function setError(error?: any) {
  let config = esp.config()
  let routes = UserRoutes.state().get()
  const user = UserClass.state().get()
  let lastIndex = routes?.routes?.length - 1 ?? 0
  let _e: any = {}
  _e['user'] = user
  _e['error'] = String(error)
  _e['routes'] = routes?.routes?.[lastIndex]?.name
  AsyncStorage.setItem(config?.domain + 'error', JSON.stringify(_e))
}

export function reportApiError(fetch: any, error: any) {

  const user = UserClass.state().get()
  let config = esp.config()
  let msg = [
    'slug: ' + "#" + manifest?.slug,
    'dev: ' + Platform.OS + ' - ' + Constants.deviceName,
    'app/pub_id: ' + Constants.appOwnership + '/' + (config?.publish_id || '-'),
    'user_id: ' + user?.id || user?.user_id || '-',
    'username: ' + user?.username || '-',
    'fetch: ' + String(JSON.stringify(fetch || {}, undefined, 2)).replace(/[\[\]\{\}\"]+/g, ''),
    'error: ' + error
  ].join('\n')

  if (manifest?.packagerOpts) {
    let post = {
      text: msg,
      chat_id: '-626800023',
      disable_web_page_preview: true
    }
    new LibCurl().custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
  } else {
    let post = {
      text: msg,
      chat_id: "-1001212227631",
      disable_web_page_preview: true
    }
    new LibCurl().custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
  }
}

export function getError() {
  let config = esp.config()
  AsyncStorage.getItem(config?.domain + 'error').then((e: any) => {
    if (e) {
      let _e = JSON.parse(e)
      let msg = [
        'slug: ' + "#" + manifest?.slug,
        'name: ' + manifest?.name + ' - sdk' + pack?.dependencies?.expo,
        'domain: ' + config.domain + config.uri,
        'package: ' + (Platform.OS == 'ios' ? manifest?.ios?.bundleIdentifier : manifest?.android?.package) + ' - v' + (Platform.OS == 'ios' ? app.expo.ios.buildNumber : app.expo.android.versionCode),
        'device: ' + Platform.OS + ' | ' + Constants.deviceName,
        'native/pub_id: ' + manifest?.sdkVersion + '/' + (config?.publish_id || '-'),
        'user_id: ' + _e?.user?.id || _e?.user?.user_id || '-',
        'username: ' + _e?.user?.username || '-',
        'module: ' + _e.routes,
        'error: \n' + _e.error,
      ].join('\n')
      // config?.errorReport?.telegramIds?.forEach?.((id: string) => {
      if (msg.includes(`Invariant Violation: "main" has not been registered. This can happen if`)) {
        // remove error that unsolved
      } else {
        let post = {
          text: msg,
          chat_id: "-1001212227631",
          disable_web_page_preview: true
        }
        new LibCurl().custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
      }
      // });
      AsyncStorage.removeItem(config.domain + 'error')
    }
  })
}
ErrorUtils.setGlobalHandler(myErrorHandler)
