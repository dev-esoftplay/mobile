
// noPage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthorizationStatus, getMessaging, onTokenRefresh, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { LibCrypt } from 'esoftplay/cache/lib/crypt/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibNotification } from 'esoftplay/cache/lib/notification/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserNotification } from 'esoftplay/cache/user/notification/import';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import moment from 'esoftplay/moment';
import { createTimeout } from 'esoftplay/timeout';
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


// const url = useGlobalState()
// Set up the notification handler for the app
const lastUrlState = useGlobalState<any>(undefined)

// Set up the notification handler for the app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

function rebuildNotificationData(data: any) {
  const out: { title: string, body: string, data: any } = { title: '', body: '', data: null }
  if (Platform.OS == 'android') {
    if (data.notification) {
      if (data.notification?.request?.content) {
        out.title = data.notification?.request?.content?.title
        out.body = data.notification?.request?.content?.body
        out.data = { ...data.notification?.request?.content?.data, title: out.title, body: out.body }
      } else if (data.notification?.title) {
        out.title = data.notification?.title
        out.body = data.notification?.body
        out.data = { ...data?.data, title: out.title, body: out.body }
      }
    }
  } else if (Platform.OS == 'ios') {
    if (data.notification?.request?.content) {
      out.title = data.notification?.request?.content?.title
      out.body = data.notification?.request?.content?.body
      if (data.notification?.request?.trigger?.payload) {
        let rawData = data.notification?.request?.trigger?.payload
        delete rawData["aps"]
        delete rawData["google.c.sender.id"]
        delete rawData["gcm.message_id"]
        delete rawData["google.c.fid"]
        delete rawData["google.c.a.e"]
        out.data = { ...rawData, title: out.title, body: out.body }
      } else {
        out.data = { ...data.notification?.request?.content?.data, title: out.title, body: out.body }
      }
    } else if (data?.notification?.title) {
      out.title = data.notification?.title
      out.body = data.notification?.body
      out.data = { ...data?.data, title: out.title, body: out.body }
    }
  }
  return out
}


function checkNotifStorage(title?: string) {
  AsyncStorage.getItem('remoteMessage').then((v) => {
    try {
      if (v) {
        LibNotification.onAction(JSON.parse(v), title)
        AsyncStorage.removeItem("remoteMessage")
      }
    } catch (error) {

    }
  })
}

// Handle push notifications when the app is in the background
setBackgroundMessageHandler(getMessaging(), async (remoteMessage: any) => {
  // handlePushNotification(remoteMessage)
  AsyncStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
  // if (remoteMessage) {
  // }
  // setTimeout(() => {
  //   checkNotifStorage("setBackgroundMessageHandler")
  // }, 500);
});

onTokenRefresh(getMessaging(), (token) => {
  AsyncStorage.getItem("token").then((old) => {
    if (old != token) {
      UserClass.sendToken(token)
    }
  })
})



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
    secretkey: new LibCrypt().encode(salt + "|" + moment().serverFormat("YYYY-MM-DD hh:mm:ss"))
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


export interface notificationTrigger {
  delayInMinutes: number,
  repeats?: boolean
}

export interface notificationContent {
  title: string,
  message: string,
  module?: string,
  url?: string
  arguments?: any
}


const handlePushNotification = async (remoteMessage: any) => {
  const notification = {
    title: remoteMessage?.notification?.title,
    body: remoteMessage?.notification?.body,
    data: { ...remoteMessage.data, messageId: remoteMessage?.messageId }, // optional data payload
  };
  if (remoteMessage) {
    AsyncStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
  }
  await Notifications.scheduleNotificationAsync({ content: notification, trigger: null });
};


export default {
  state(): useGlobalReturn<any> {
    return lastUrlState
  },
  effect() {
    // Listen for push notifications when the app is in the foreground
    // const uns = AppState.addEventListener('focus', () => {
    // })
    setTimeout(() => {
      checkNotifStorage()
    }, 500);

    let unMessage = getMessaging().onMessage(handlePushNotification);
    // Handle user opening the app from a notification (when the app is in the background)
    let unonNotificationOpenedApp = getMessaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage) {
        AsyncStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
      }
      setTimeout(() => {
        checkNotifStorage("onNotificationOpenedApp")
      }, 500);
    });

    // Check if the app was opened from a notification (when the app was completely quit)
    getMessaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        AsyncStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
      }
      setTimeout(() => {
        checkNotifStorage("getInitialNotification")
      }, 500);
    });

    return () => {
      unMessage()
      unonNotificationOpenedApp()
      // uns.remove()
    }
  },
  loadData(isFirst?: boolean): void {
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
      secretkey: new LibCrypt().encode(salt + "|" + moment().serverFormat("YYYY-MM-DD hh:mm:ss"))
    }
    if (user) {
      post["user_id"] = user.id || user.user_id
      post["group_id"] = user.group_id || esp.config('group_id')
    }

    new LibCurl(_uri, post,
      (res: any) => {
        if (res?.list?.length > 0) {
          let urls: string[] = UserNotification.state().get().urls
          if (isFirst) {
            urls = []
          }
          if (urls && urls.indexOf(_uri) < 0) {
            let { data, unread } = UserNotification.state().get()
            let nUnread
            if (isFirst) {
              nUnread = res.list.filter((row: any) => row.status != 2).length
              UserNotification.state().set({
                data: res.list,
                urls: [],
                unread: nUnread
              })

            } else {
              nUnread = unread + res.list.filter((row: any) => row.status != 2).length
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
          lastUrlState.set(res.next)
        } else {
          lastUrlState.set(-1)
        }
      }, (msg) => {

      }
    )
  },
  add(id: number, user_id: number, group_id: number, title: string, message: string, params: string, status: 0 | 1 | 2, created?: string, updated?: string): void {
    const item = { id, user_id, group_id, title, message, params, status, created, updated }
    let data = UserNotification.state().get().data
    data.unshift(item)
    UserNotification.state().set({
      ...UserNotification.state().get(),
      data: data
    })
  },
  drop(): void {
    UserNotification.state().reset()
  },
  markRead(id?: string | number, ..._ids: (string | number)[]): void {
    let { data, unread, urls } = UserNotification.state().get()
    let nUnread = unread > 0 ? unread - 1 : 0
    let ids = [id, ..._ids]
    ids.forEach((id) => {
      const index = data.findIndex((row: any) => String(row.id) == String(id))
      if (index > -1) {
        data = LibObject.set(data, 2)(index, 'status')
        nUnread = unread > 0 ? unread - 1 : 0
      }
    })
    UserNotification.state().set({
      urls,
      data: data,
      unread: nUnread
    })
    Notifications.setBadgeCountAsync(nUnread)
    const idsToPush = splitArray(ids, 20)
    idsToPush.forEach((ids) => {
      readAll(ids)
    })
  }
  ,
  onAction(notification: any, title?: string): void {
    this.loadData(true)
    const data = this.getData(notification)
    // Alert.alert(title || 'default', JSON.stringify(data?.data, undefined, 2))
    const timeout1 = createTimeout()
    const timeout2 = createTimeout()
    const doOpen = (data: any) => {
      if (!LibNavigation.getIsReady()) {
        timeout1.set(() => {
          doOpen(data)
          timeout1.clear()
        }, 300);
        return
      } else {
        timeout2.set(() => {
          this.openPushNotif(data?.data)
          timeout2.clear()
        }, 300)
      }
    }
    doOpen(data)
  },
  getData(x: any): any {
    return rebuildNotificationData(x)
  },
  listen(dataRef: any): void {
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
  },
  requestPermission(callback?: (token: any) => void): Promise<any> {
    return new Promise(async (r) => {
      let settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        settings = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowCriticalAlerts: true
          },
          android: {}
        });
      }
      const authStatus = await getMessaging().requestPermission();
      const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        await getMessaging().registerDeviceForRemoteMessages()
        getMessaging()
          .getToken()
          .then(
            token => {
              callback?.(token)
            }
          )
          .catch(() => {
            callback?.(null)
          })
      } else {
        callback?.(null)
      }
    })
  },
  cancelLocalNotification(notif_id: string) {
    Notifications.cancelScheduledNotificationAsync(notif_id)
  },
  setLocalNotification(action: "alert" | "default" | "update", content: notificationContent, trigger: notificationTrigger, callback?: (notif_id: string) => void): void {
    const triggerSeconds = Number(trigger?.delayInMinutes) * 60
    const _trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      repeats: !!trigger?.repeats,
    }
    const params = { status: 3, url: content?.url, ...content?.arguments }
    Notifications.scheduleNotificationAsync({
      content: {
        title: content?.title,
        body: content?.message,
        data: {
          action: action,
          module: content.module,
          title: content?.title,
          message: content?.message,
          params,
        },
      },
      trigger: _trigger,
    }).then((notifId) => {
      // console.log("BERHASIL", r)
      callback?.(notifId)
    }).catch((r) => {
      // console.log("GAGAL", r)
    })
  },
  openPushNotif(data: any): void {
    if (!data) return
    if (typeof data == 'string')
      data = JSON.parse(data)
    this.markRead(data?.id)
    const _arguments = data.arguments ? ((typeof data.arguments == 'string') ? JSON.parse(data.arguments) : data.arguments) : data
    if (data.action)
      switch (data.action) {
        case "alert":
          const timeout = createTimeout()
          let hasLink = _arguments?.url
          let btns: any = []
          if (hasLink) {
            btns.push({ text: "OK", onPress: () => Linking.openURL(_arguments.url) })
          } else {
            btns.push({ text: "OK", onPress: () => { }, style: "cancel" })
          }
          timeout.set(() => {
            Alert.alert(
              data.title,
              data.message,
              btns,
              { cancelable: false }
            )
            timeout.clear()
          }, 10)
          break;
        case "default":
          if (data.module && data.module != "") {
            const timeout1 = createTimeout()
            if (!String(data.module).includes("/")) data.module = data.module + "/index"
            timeout1.set(() => {
              LibNavigation.navigate(data.module, _arguments)
              timeout1.clear()
            }, 10)
          }
          break;
        case "update":
          const timeout2 = createTimeout()
          const update = esp.modProp('lib/updater')
          timeout2.set(() => {
            update?.check?.()
            timeout2.clear()
          }, 50);
          break;
        default:
          break;
      }
  },
  openNotif(data: any): void {
    this.markRead(data.id)
    let param = JSON.parse(data.params)
    const timeout1 = createTimeout()
    const timeout2 = createTimeout()
    const _arguments = param.arguments ? ((typeof param.arguments == 'string') ? JSON.parse(param.arguments) : param.arguments) : param
    switch (param.action) {
      case "alert":
        let hasLink = _arguments.hasOwnProperty("url") && _arguments.url != ""
        let btns: any = []
        if (hasLink) {
          btns.push({ text: "OK", onPress: () => Linking.openURL(_arguments.url) })
        } else {
          btns.push({ text: "OK", onPress: () => { }, style: "cancel" })
        }
        timeout1.set(() => {
          Alert.alert(
            data.title,
            data.message,
            btns,
            { cancelable: false }
          )
          timeout1.clear()
        }, 10)
        break;
      case "default":
        if (param.module != "") {
          if (!String(param.module).includes("/")) param.module = param.module + "/index"
          timeout2.set(() => {
            LibNavigation.navigate(param.module, _arguments)
            timeout2.clear()
          }, 10)
        }
        break;
      default:
        break;
    }
  }
}