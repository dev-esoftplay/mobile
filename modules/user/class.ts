//
import React from "react"
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications'
import { LibNotification, esp, UserClass, LibCrypt, LibCurl, UserData } from "esoftplay";
import moment from "moment";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-community/async-storage'

export default class eclass {

  static reducer(state: any, action: any): any {
    if (!state) state = null
    switch (action.type) {
      case "user_class_create":
        return action.payload
        break;
      case "user_class_delete":
        return null
        break;
      default:
        return state
    }
  }

  static create(user: any): Promise<void> {
    return new Promise((r, j) => {
      esp.dispatch({ type: "user_class_create", payload: user });
      AsyncStorage.setItem("user", JSON.stringify(user))
      if (esp.config('notification') == 1) {
        UserClass.pushToken()
      }
      r();
    })
  }

  static load(callback?: (user?: any | null) => void): Promise<any> {
    return new Promise((r, j) => {
      AsyncStorage.getItem("user").then((user: any) => {
        if (user) {
          r(JSON.parse(user));
          esp.dispatch({
            type: "user_class_create",
            payload: JSON.parse(user)
          });
          if (callback) callback(JSON.parse(user))
        } else {
          j()
          if (callback) callback(null)
        }
      })
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

  static delete(): Promise<any> {
    return new Promise((r) => {
      Notifications.setBadgeCountAsync(0)
      esp.dispatch({ type: "user_class_delete" });
      AsyncStorage.removeItem("user");
      AsyncStorage.removeItem("user_notification");
      new UserData().deleteAll()
      if (esp.config('notification') == 1) {
        UserClass.pushToken()
      }
      r()
    })
  }

  static pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (Constants.appOwnership == 'expo' && !esp.isDebug()) {
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
                    if (postfield == 'group_id') {
                      if (!esp.config('group_id'))
                        post[postfield] = user[userfield]
                    } else {
                      post[postfield] = user[userfield]
                    }
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
                resolve(msg)
              })
          })
        }
      })
    })
  }

}