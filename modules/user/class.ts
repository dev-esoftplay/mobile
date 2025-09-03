// noPage
// withObject
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import moment from "esoftplay/moment";
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const state = useGlobalState(null, { persistKey: "user", loadOnInit: true })
const topics = useGlobalState([], { persistKey: "user_topics", loadOnInit: true })

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
      if (!isEqual(oldDt, user) && esp.config().notification == 1) {
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
          try {
            let juser = JSON.parse(user)
            if (callback) callback(state?.get?.() || juser)
            r((state?.get?.() || juser))
          } catch (error) {
            if (callback) callback(null)
            r(null)
          }
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
        topics.get().forEach((topic) => {
          if (topic != 'userAll')
            getMessaging().unsubscribeFromTopic(topic)
        })
        r(null);
        if (callback) callback(null);
      })
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#delete) untuk melihat dokumentasi*/
  delete(): Promise<void> {
    return new Promise(async (r) => {
      topics.get().forEach((topic) => {
        if (topic != 'userAll')
          getMessaging().unsubscribeFromTopic(topic)
      })
      await Notifications.setBadgeCountAsync(0)
      await AsyncStorage.removeItem("user_notification");
      esp.mod("user/data").deleteAll()
      if (esp.config('notification') == 1) {
        esp.mod("user/class").pushToken()
      }
      setTimeout(() => {
        state.reset()
        r()
      }, 0)
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#sendToken) untuk melihat dokumentasi*/
  async sendToken(token: string) {
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
      esp.mod("user/class").load(async (_user) => {
        let user = LibObject.assign({}, _user)()
        if (user) {
          user["user_id"] = user.id
          Object.keys(user).forEach((userfield) => {
            Object.keys(post).forEach((postfield) => {
              if (postfield == userfield && postfield != "os" && postfield != "token" && postfield != "secretkey" && postfield != "push_id" && postfield != "device") {
                post[postfield] = user[userfield]
              }
            })
          })
        } else {
          topics.get().forEach((topic) => {
            if (topic != 'userAll')
              getMessaging().unsubscribeFromTopic(topic)
          })
        }
        var push_id = await AsyncStorage.getItem("push_id");
        if (push_id) post["push_id"] = push_id
        const LibCurl = esp.mod("lib/curl")
        AsyncStorage.setItem("token", String(token))
        new LibCurl(config.protocol + "://" + config.domain + config.uri + "user/push-token", post,
          (res, msg) => {
            AsyncStorage.setItem("push_id", String(res.push_id));
            topics.set(res.topics)
            AsyncStorage.setItem("token", String(token))
            topics.get().forEach((topic) => {
              getMessaging().subscribeToTopic(topic)
            })
            return (res)
          }, (msg) => {
            return (msg.message)
          })
      })
    }
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/class.md#pushToken) untuk melihat dokumentasi*/
  pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (Constants.appOwnership == 'expo' && !esp.isDebug('')) {
        resolve(undefined)
        return
      }
      esp.mod("lib/notification").requestPermission(async (token) => {
        resolve(await this.sendToken(token))
      })
    })
  }
}