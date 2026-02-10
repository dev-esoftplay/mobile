//noPage
import { appjson, packagejson } from 'esoftplay/bin/files';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibNavigationProperty } from 'esoftplay/cache/lib/navigation/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import esp from 'esoftplay/esp';
import FastStorage from 'esoftplay/mmkv';
import { default as UserRoutes } from 'esoftplay/modules/user/routes';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
const { expoConfig } = Constants;

function getTime() {
  const adjustedDate = new Date().getTime() + 7 * 60 * 60000; // Add offset in milliseconds
  const isoStringWithGMTPlus7 = new Date(adjustedDate).toISOString();
  return isoStringWithGMTPlus7.replace('T', ' ').replace(/\.[0-9]+Z/g, "")
}
const defaultErrorHandler = ErrorUtils?.getGlobalHandler?.()

const myErrorHandler = (e: any, isFatal: any) => {
  if (!__DEV__)
    setError(e)
  defaultErrorHandler?.(e, isFatal)
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/error.md#setError) untuk melihat dokumentasi*/
export function setError(error?: any) {
  const config = esp?.config?.();
  const routes = UserRoutes?.state()?.get?.();
  const user = UserClass?.state()?.get?.();
  const routesName = routes?.routes?.map((x) => x.name)

  const _e = {
    user,
    error: String(error),
    routes: routesName,
    args: LibNavigationProperty.lastArgs.get(),
    time: getTime()
  };
  try {
    FastStorage.setItem(`${config?.domain}error`, JSON.stringify(_e));
    cleanCache()
  } catch (e) {
    console.error(e);
  }
}


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/error.md#reportApiError) untuk melihat dokumentasi*/
export function reportApiError(fetch: any, error: any) {
  let routes = UserRoutes?.state?.()?.get?.()
  let lastIndex = routes?.routes?.length - 1 ?? 0
  const user = UserClass?.state?.()?.get?.()
  let config = esp?.config?.()
  let msg = [
    'slug: ' + "#" + expoConfig?.slug,
    'error: ' + error,
    '\n\n\ndev: ' + Platform.OS + ' - ' + Constants.deviceName,
    'time: ' + getTime(),
    'runtimeVersion:' + appjson.expo.runtimeVersion,
    'app/pub_id: ' + Constants.appOwnership + '/' + (config?.publish_id || '-'),
    'user_id: ' + user?.id || user?.user_id || '-',
    'username: ' + user?.username || '-',
    'module:' + routes?.routes?.[lastIndex]?.name,
    'fetch: ' + String(JSON.stringify(fetch || {}, undefined, 2)).replace(/[\[\]\{\}\"]+/g, ''),
  ].join('\n')

  if (__DEV__) {
    let post = {
      text: msg,
      chat_id: '-1001737180019',
      disable_web_page_preview: true
    }
    new LibCurl()?.custom?.('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
  } else {
    const telegramIds = config?.errorReport?.telegramIds || {}
    Object.values(telegramIds).forEach?.(id => {
      let post = {
        text: msg,
        chat_id: id,
        disable_web_page_preview: true
      }
      new LibCurl()?.custom?.('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
    });
  }
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/error.md#sendTm) untuk melihat dokumentasi*/
export function sendTm(message: string, chat_id?: string, bot?: string, res?: (result: any) => void): void {
  let _chatids: string[] = []
  if (chat_id) {
    _chatids = [chat_id]
  } else {
    let config = esp?.config?.()
    _chatids = Object.values(config?.errorReport?.telegramIds)
  }
  _chatids.forEach((cid: string) => {
    let post = {
      text: message,
      chat_id: cid,
      disable_web_page_preview: true
    }
    const _bot = bot || "923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4"
    new LibCurl()?.custom?.(`https://api.telegram.org/bot${_bot}/sendMessage`, post, res)
  })
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/error.md#getError) untuk melihat dokumentasi*/
export function getError() {
  let config = esp?.config?.()
  FastStorage.getItem(config?.domain + 'error').then((e: any) => {
    if (e) {
      cleanCache()
      let _e = JSON.parse(e)
      let msg = [
        'slug: ' + "#" + expoConfig?.slug,
        'error: \n' + _e.error,
        '\n\nname: ' + expoConfig?.name + ' - sdk' + packagejson?.dependencies?.expo,
        'time: \n' + _e?.time,
        'domain: ' + config.domain + config.uri,
        'runtimeVersion:' + appjson.expo.runtimeVersion,
        'package: ' + (Application.nativeBuildVersion) + ' - v' + (Platform.OS == 'ios' ? appjson.expo.ios.buildNumber : appjson.expo.android.versionCode),
        'device: ' + Platform.OS + ' | ' + Constants.deviceName,
        'native/pub_id: ' + expoConfig?.sdkVersion + '/' + (config?.publish_id || '-'),
        'user_id: ' + _e?.user?.id || _e?.user?.user_id || '-',
        'username: ' + _e?.user?.username || '-',
        'module: ' + _e.routes,
      ].join('\n')
      // config?.errorReport?.telegramIds?.forEach?.((id: string) => {
      if (msg.includes(`Invariant Violation: "main" has not been registered. This can happen if`)) {
        // remove error that unsolved
      } else if (msg.includes(`deleteAdsCache`)) {
        // remove error that unsolved
      } else if (msg.includes(`SyntaxError: JSON Parse error: Unexpected token:`)) {
        // remove error that unsolved
      } else if (msg.includes(`FirebaseError: [code=invalid-argument]`)) {
        let post = {
          text: msg,
          chat_id: '-1001737180019',
          disable_web_page_preview: true
        }
        new LibCurl()?.custom?.('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
      } else {
        const telegramIds = config?.errorReport?.telegramIds || {}
        Object.values(telegramIds).forEach?.(id => {
          let post = {
            text: msg,
            chat_id: id,
            disable_web_page_preview: true
          }
          new LibCurl()?.custom?.('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
        });
      }

      FastStorage.removeItem(config.domain + 'error')
    }
  })
}

function cleanCache() {
  try {
    // try remove cache after errors
    if (FileSystem.cacheDirectory) {
      FileSystem.deleteAsync(FileSystem.cacheDirectory, { idempotent: true });
    }
  } catch (error) { }
}
ErrorUtils.setGlobalHandler(myErrorHandler)
