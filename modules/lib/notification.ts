
// noPage
import { useGlobalReturn } from 'esoftplay';
import _global from 'esoftplay/_global';
import { LibCrypt } from 'esoftplay/cache/lib/crypt/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserNotification } from 'esoftplay/cache/user/notification/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import moment from 'esoftplay/moment';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from "react-native";
/*
{
  to: // exp token
  data:{
    action: // [route, dialog,  ]
    module: // routeName of ReactNavigation
    params:
    title:
    message:
  }
  title:
  body:
  sound:
  param:
  ttl:
  expiration:
  priority:
  badge:
} */


Notifications.setNotificationHandler({
  handleNotification: async (notif) => {
    return ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX
    })
  },
});

const lastUrlState = useGlobalState<any>(undefined)

function mainUrl(): string {
  const { protocol, domain, uri } = esp.config()
  return protocol + "://" + domain + uri;
}

function readAll(ids: (string | number)[]) {
  let url = mainUrl() + "user/push-read";
  const { salt } = esp.config()
  let post: any = {
    notif_id: ids.join(','),
    user_id: "",
    secretkey: new LibCrypt().encode(salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
  }
  new LibCurl(url, post)
}

function splitArray(array: any[], maxLength: number): any[] {
  const parts = maxLength // items per chunk
  const splitedArray = array.reduce((resultArray: any, item, index) => {
    const chunkIndex = Math.floor(index / parts)
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [])
  return splitedArray
}

export default class m {

  static state(): useGlobalReturn<any> {
    return lastUrlState
  }

  static loadData(isFirst?: boolean): void {
    // console.log('LOADDATA', isFirst)
    let _uri = mainUrl() + "user/push-notif/desc"
    let lastUrl = lastUrlState.get()
    if (isFirst) {
      lastUrl = undefined
    }
    if (lastUrl == -1) {
      return
    }
    if (lastUrl && !isFirst) {
      _uri = lastUrl
    }
    const user = UserClass.state().get()
    if (!user?.id) {
      Notifications.setBadgeCountAsync(0)
    }
    const { salt } = esp.config()
    let post: any = {
      user_id: "",
      secretkey: new LibCrypt().encode(salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
    }
    if (user) {
      post["user_id"] = user.id || user.user_id
      post["group_id"] = user.group_id || esp.config('group_id')
    }

    // console.log(esp.logColor.cyan, 'curl: ' + _uri, esp.logColor.reset)
    new LibCurl(_uri, post,
      (res: any) => {
        // console.log(esp.logColor.green, 'next: ' + res.next, '\n length: ' + res?.list?.length, res.list[0].message, esp.logColor.reset)
        if (res?.list?.length > 0) {
          let urls: string[] = UserNotification.state().get().urls
          if (isFirst) {
            urls = []
          }
          // console.log(urls)
          if (urls && urls.indexOf(_uri) < 0) {
            let { data, unread } = UserNotification.state().get()
            // console.log(nUnread+" => nUnread")
            let nUnread
            if (isFirst) {
              nUnread = res.list.filter((row) => row.status != 2).length
              UserNotification.state().set({
                data: res.list,
                urls: [],
                unread: nUnread
              })
            } else {
              nUnread = unread + res.list.filter((row) => row.status != 2).length
              data.push(...res.list)
              UserNotification.state().set({
                data: data,
                urls: [_uri, ...urls],
                unread: nUnread
              })
            }
            Notifications.setBadgeCountAsync(nUnread)
          }
        }
        if (res.next) {
          // console.log(res.next)
          lastUrlState.set(res.next)
        } else {
          // console.log(-1)
          lastUrlState.set(-1)
        }
      }, (msg) => {

      }
    )
  }

  static add(id: number, user_id: number, group_id: number, title: string, message: string, params: string, status: 0 | 1 | 2, created?: string, updated?: string): void {
    const item = { id, user_id, group_id, title, message, params, status, created, updated }
    let data = UserNotification.state().get().data
    data.unshift(item)
    UserNotification.state().set({
      ...UserNotification.state().get(),
      data: data
    })
  }

  static drop(): void {
    UserNotification.state().reset()
  }

  static markRead(id?: string | number, ..._ids: (string | number)[]): void {
    // console.log("markRead")
    let { data, unread, urls } = UserNotification.state().get()
    let nUnread = unread > 0 ? unread - 1 : 0
    let ids = [id, ..._ids]
    // console.log(ids)
    ids.forEach((id) => {
      const index = data.findIndex((row) => String(row.id) == String(id))
      if (index > -1) {
        data = LibObject.set(data, 2)(index, 'status')
        nUnread = unread > 0 ? unread - 1 : 0
      }
    })
    // console.log(JSON.stringify(data))
    UserNotification.state().set({
      urls,
      data: data,
      unread: nUnread
    })
    Notifications.setBadgeCountAsync(nUnread)
    const idsToPush = splitArray(ids, 200)
    idsToPush.forEach((ids) => {
      readAll(ids)
    })
  }


  static onAction(notification: any): void {
    m.loadData(true)
    const data = m.getData(notification)
    function doOpen(data: any) {
      if (!_global.NavsIsReady) {
        setTimeout(() => {
          doOpen(data)
        }, 300);
        return
      } else {
        setTimeout(() => {
          m.openPushNotif(data)
        }, 0)
      }
    }
    doOpen(data)
  }

  static getData(x: any): any {
    return x?.notification?.request?.content?.data
  }

  static listen(dataRef: any): void {
    if (esp.config('notification') == 1) {
      if (Platform.OS == 'android')
        Notifications.setNotificationChannelAsync(
          'android',
          {
            sound: 'default',
            enableLights: true,
            description: esp.lang("lib/notification", "permission"),
            name: esp.appjson().expo.name,
            importance: Notifications.AndroidImportance.MAX,
            showBadge: true,
            enableVibrate: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
          }
        )
      UserClass.pushToken();
      dataRef.receive = Notifications.addNotificationReceivedListener(() => { })
    }
  }

  static requestPermission(callback?: (token: any) => void): Promise<any> {
    return new Promise(async (r) => {
      let settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        settings = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
          android: {}
        });
      }

      let defaultToken = setTimeout(() => {
        if (callback)
          callback('undetermined')
      }, 15000);
      //@ts-ignore
      if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        let expoToken
        let experienceId = esp.config('experienceId')
        if (Constants.isDevice) {
          if (String(experienceId).includes('/')) {
            expoToken = await Notifications.getExpoPushTokenAsync({ experienceId })
          } else {
            expoToken = await Notifications.getExpoPushTokenAsync()
          }
        }
        if (expoToken) {
          clearTimeout(defaultToken)
          r(expoToken.data);
          if (callback) callback(expoToken.data);
        }
      }
    })
  }


  static openPushNotif(data: any): void {
    if (!data) return
    if (typeof data == 'string')
      data = JSON.parse(data)
    m.markRead(data.id)
    let param = data;
    if (param.action)
      switch (param.action) {
        case "alert":
          let hasLink = param?.params?.url
          let btns: any = []
          if (hasLink) {
            btns.push({ text: "OK", onPress: () => Linking.openURL(param.params.url) })
          } else {
            btns.push({ text: "OK", onPress: () => { }, style: "cancel" })
          }
          setTimeout(() => {
            Alert.alert(
              param.title,
              param.message,
              btns, { cancelable: false }
            )
          }, 10)
          break;
        case "default":
          if (param.module && param.module != "") {
            if (!String(param.module).includes("/")) param.module = param.module + "/index"
            setTimeout(() => {
              LibNavigation.navigate(param.module, param.params)
            }, 10)
          }
          break;
        default:
          break;
      }
  }

  static openNotif(data: any): void {
    m.markRead(data.id)
    let param = JSON.parse(data.params)
    switch (param.action) {
      case "alert":
        let hasLink = param.arguments.hasOwnProperty("url") && param.arguments.url != ""
        let btns: any = []
        if (hasLink) {
          btns.push({ text: "OK", onPress: () => Linking.openURL(param.arguments.url) })
        } else {
          btns.push({ text: "OK", onPress: () => { }, style: "cancel" })
        }
        setTimeout(() => {
          Alert.alert(
            data.title,
            data.message,
            btns,
            { cancelable: false }
          )
        }, 10)
        break;
      case "default":
        if (param.module != "") {
          if (!String(param.module).includes("/")) param.module = param.module + "/index"
          setTimeout(() => {
            LibNavigation.navigate(param.module, param.arguments)
          }, 10)
        }
        break;
      default:
        break;
    }
  }
}