//
import React from "react"
import { AsyncStorage } from 'react-native';
import { Notifications } from 'expo'
import { LibNotification, esp, UserClass, LibCrypt, LibCurl } from "esoftplay";
import moment from "moment";
import Constants from 'expo-constants';

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
          esp.dispatch({ type: "user_class_create", payload: JSON.parse(user) });
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
      Notifications.setBadgeNumberAsync(0)
      esp.dispatch({ type: "user_class_delete" });
      AsyncStorage.removeItem("user");
      if (esp.config('notification') == 1) {
        UserClass.pushToken()
      }
      r()
    })
  }

  static pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      LibNotification.requestPermission(async (token) => {
        if (token && token.includes("ExponentPushToken")) {
          const config = esp.config();
          var post: any = {
            user_id: 0,
            group_id: esp.config('group_id'),
            username: "",
            token: token,
            push_id: "",
            device: Constants.deviceName,
            secretkey: new LibCrypt().encode(config.salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
          }
          UserClass.load(async (user) => {
            if (user) {
              user["user_id"] = user.id
              Object.keys(user).forEach((userfield) => {
                Object.keys(post).forEach((postfield) => {
                  if (postfield == userfield && postfield != "token" && postfield != "secretkey" && postfield != "push_id" && postfield != "device" && postfield != 'group_id') {
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
                resolve(msg)
              })
          })
        }
      })
    })
  }

}