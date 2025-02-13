// noPage
// withObject
import AsyncStorage from '@react-native-async-storage/async-storage';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import moment from "esoftplay/moment";
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const state = useGlobalState(null, { persistKey: "user", loadOnInit: true })

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md) untuk melihat dokumentasi*/
export default {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#state) untuk melihat dokumentasi*/
  state(): useGlobalReturn<any> {
    return state
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#create) untuk melihat dokumentasi*/
  create(user: any): Promise<void> {
    return new Promise((r, j) => {
      const oldDt = state.get()
      state?.set?.(user)
      const isEqual = require('react-fast-compare');
      if (!isEqual(oldDt, user) && esp.config('notification') == 1) {
        esp.mod("user/class").pushToken()
      }
      r(user)
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#load) untuk melihat dokumentasi*/
  load(callback?: (user?: any | null) => void): Promise<any> {
    return new Promise(async (r, j) => {
      AsyncStorage.getItem('user').then((user) => {
        if (user) {
          let juser = JSON.parse(user)
          if (callback) callback(state?.get?.() || juser)
          r((state?.get?.() || juser))
        } else {
          if (callback) callback(null)
          r(null)
        }
      })

    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#isLogin) untuk melihat dokumentasi*/
  isLogin(callback: (user?: any | null) => void): Promise<any> {
    return new Promise((r, j) => {
      this.load().then((user) => {
        r(user);
        if (callback) callback(user);
      }).catch((nouser) => {
        r(null);
        if (callback) callback(null);
      })
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#delete) untuk melihat dokumentasi*/
  delete(): Promise<void> {
    return new Promise(async (r) => {
      Notifications.setBadgeCountAsync(0)
      state.reset()
      await AsyncStorage.removeItem("user_notification");
      esp.mod("user/data").deleteAll()
      if (esp.config('notification') == 1) {
        esp.mod("user/class").pushToken()
      }
      r()
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#pushToken) untuk melihat dokumentasi*/
  pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (Constants.appOwnership == 'expo' && !esp.isDebug('')) {
        resolve(undefined)
        return
      }
      esp.mod("lib/notification").requestPermission(async (token) => {
        if (token) {
          const config = esp.config();
          const LibCrypt = esp.mod("lib/crypt")
          var post: any = {
            user_id: 0,
            group_id: esp.config('group_id'),
            username: "",
            token: token,
            push_id: "",
            is_app: Constants.appOwnership == 'expo' ? 0 : 1,
            os: Platform.OS,
            installation_id: await esp.mod("lib/utils").getInstallationID(),
            device: Constants.deviceName,
            secretkey: new LibCrypt().encode(config.salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
          }
          esp.mod("user/class").load(async (user) => {
            if (user) {
              user["user_id"] = user.id
              Object.keys(user).forEach((userfield) => {
                Object.keys(post).forEach((postfield) => {
                  if (postfield == userfield && postfield != "os" && postfield != "token" && postfield != "secretkey" && postfield != "push_id" && postfield != "device") {
                    post[postfield] = user[userfield]
                  }
                })
              })
            }
            var push_id = await AsyncStorage.getItem("push_id");
            if (push_id) post["push_id"] = push_id
            const LibCurl = esp.mod("lib/curl")
            new LibCurl(config.protocol + "://" + config.domain + config.uri + "user/push-token", post,
              (res, msg) => {
                AsyncStorage.setItem("push_id", String(Number.isInteger(parseInt(res)) ? res : push_id));
                AsyncStorage.setItem("token", String(token))
                resolve(res)
              }, (msg) => {
                resolve(msg.message)
              })
          })
        }
      })
    })
  }
}