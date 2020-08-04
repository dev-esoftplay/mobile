//
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions'
import { Platform, Alert, Linking, Keyboard } from "react-native";
import { esp, UserNotification, LibCurl, LibCrypt, LibNavigation } from "esoftplay";
import moment from 'moment';
import Constants from 'expo-constants';
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
    UserNotification.user_notification_loadData();
    return ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX
    })
  },
});

export default class m {

  static listen(callback?: (obj: any) => void): void {
    Notifications.addNotificationReceivedListener((x) => onReceive(x))
    Notifications.addNotificationResponseReceivedListener(x => onAction(x))

    function getData(x: any) {
      if (Platform.OS == 'ios') {
        return x.notification.request.content.data.body
      } else if (Platform.OS == 'android') {
        return x.notification.request.content.data
      }
      return x
    }

    function onReceive(notification: any) {
      UserNotification.user_notification_loadData()
    }

    function onAction(notification: any) {
      UserNotification.user_notification_loadData()
      const data = getData(notification)
      m.openPushNotif(data)
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
        if (Constants.isDevice)
          expoToken = await Notifications.getExpoPushTokenAsync()
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
    const crypt = new LibCrypt();
    const salt = esp.config("salt");
    const config = esp.config();
    let uri = config.protocol + "://" + config.domain + config.uri + "user/push-read"
    new LibCurl(uri, {
      notif_id: data.id,
      secretkey: crypt.encode(salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
    }, () => {
      UserNotification.user_notification_loadData();
    }, () => {

    })
    let param = data;
    if (param.action)
      switch (param.action) {
        case "alert":
          let hasLink = param.params && param.params.hasOwnProperty("url") && param.params.url != ""
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
          }, 2)
          break;
        case "default":
          if (param.module && param.module != "") {
            if (!String(param.module).includes("/")) param.module = param.module + "/index"
            setTimeout(() => {
              LibNavigation.navigate(param.module, param.params)
            }, 2)
          }
          break;
        default:
          break;
      }
  }

  static openNotif(data: any): void {
    const salt = esp.config("salt");
    const config = esp.config();
    let uri = config.protocol + "://" + config.domain + config.uri + "user/push-read"
    new LibCurl(uri, {
      notif_id: data.id,
      secretkey: new LibCrypt().encode(salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
    }, () => {
      UserNotification.user_notification_setRead(data.id)
    }, () => {
      // esp.log(msg)
    }, 1)
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
        }, 2)
        break;
      case "default":
        if (param.module != "") {
          if (!String(param.module).includes("/")) param.module = param.module + "/index"
          setTimeout(() => {
            LibNavigation.navigate(param.module, param.arguments)
          }, 2)
        }
        break;
      default:
        break;
    }
  }


}