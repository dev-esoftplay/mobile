// noPage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { esp, LibCrypt, LibCurl, LibNotification, useGlobalReturn, UserClass, UserData } from 'esoftplay';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import useGlobalState from '../../global';
import moment from "../../moment";

const state = useGlobalState?.(null, { persistKey: "user" })

export default class m {
  static state(): useGlobalReturn<any> {
    return state
  }
  static create(user: any): Promise<void> {
    return new Promise((r, j) => {
      state?.set?.(user)
      if (esp.config('notification') == 1) {
        UserClass.pushToken()
      }
      r(user)
    })
  }

  static load(callback?: (user?: any | null) => void): Promise<any> {
    return new Promise((r, j) => {
      if (callback) callback(state?.get?.())
      r((state?.get?.()))
    })
  }

  static isLogin(callback: (user?: any | null) => void): Promise<any> {
    return new Promise((r, j) => {
      eclass.load().then((user) => {
        r(user);
        if (callback) callback(user);
      }).catch((nouser) => {
        r(null);
        if (callback) callback(null);
      })
    })
  }

  static delete(): Promise<void> {
    return new Promise(async (r) => {
      Notifications.setBadgeCountAsync(0)
      state.reset()
      await AsyncStorage.removeItem("user_notification");
      new UserData().deleteAll()
      if (esp.config('notification') == 1) {
        UserClass.pushToken()
      }
      r()
    })
  }

  static pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (Constants.appOwnership == 'expo' && !esp.isDebug('')) {
        resolve(undefined)
        return
      }
      LibNotification.requestPermission(async (token) => {
        if (token && token.includes("ExponentPushToken")) {
          const config = esp.config();
          var post: any = {
            user_id: 0,
            group_id: esp.config('group_id'),
            username: "",
            token: token,
            push_id: "",
            is_app: Constants.appOwnership == 'expo' ? 0 : 1,
            os: Platform.OS,
            device: Constants.deviceName,
            secretkey: new LibCrypt().encode(config.salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
          }
          UserClass.load(async (user) => {
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