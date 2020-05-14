//

import React from "react";
import { TouchableOpacity, View, StatusBar } from "react-native";
import {
  esp,
  LibCrypt,
  LibCurl,
  LibList,
  LibComponent,
  LibNotification,
  LibStyle,
  LibUtils,
  UserNotification_item,
} from "esoftplay";
import { Notifications } from 'expo'
import { connect } from "react-redux"
import moment from "moment/min/moment-with-locales"
import update from "immutability-helper"
import { Text, Button, Icon } from "native-base";

export interface UserNotificationProps {
  navigation: any,
  data: any[]
}

export interface UserNotificationState {

}


class m extends LibComponent<UserNotificationProps, UserNotificationState> {

  props: UserNotificationProps

  static persist = true
  static reducer(state: any, action: any): any {
    if (!state)
      state = {
        data: [],
        urls: []
      };
    switch (action.type) {
      case "user_notification_reset":
        return {
          ...state,
          data: [],
          urls: []
        }
      case "user_notification_parseData":
        let unreadedCount = [...state.data, ...action.payload.data].filter((item: any) => item.status != 2).length
        Notifications.setBadgeNumberAsync(unreadedCount)
        return {
          ...state,
          data: [...state.data, ...action.payload.data],
          urls: [...state.urls, action.payload.url]
        }
      case "user_notification_setRead":
        var data: any[] = state.data
        var index = data.findIndex((item: any) => item.id == action.payload)
        var query = {
          [index]: {
            status: { $set: 2 }
          }
        }
        return {
          ...state,
          data: update(data, query)
        }
      case "user_notification_add":
        return {
          ...state,
          data: [...state.data, action.payload]
        }
      default:
        return state
    }
  }


  static add(id: number, user_id: number, group_id: number, title: string, message: string, params: string, status: 0 | 1 | 2, created?: string, updated?: string): void {
    esp.dispatch({
      type: "user_notification_add",
      payload: { id, user_id, group_id, title, message, params, status, created, updated }
    })
  }

  static drop(): void {
    esp.dispatch({
      type: "user_notification_reset",
      payload: []
    })
  }

  static user_notification_loadData(): void {
    const { protocol, domain, uri, salt } = esp.config()
    var _uri = protocol + "://" + domain + uri + "user/push-notif"
    const data = LibUtils.getReduxState('user_notification', 'data')
    const user = LibUtils.getReduxState('user_class')
    if (data && data.length > 0) {
      const lastData = data[data.length - 1]
      if (lastData.id)
        _uri += "?last_id=" + lastData.id || 0
    }
    let post: any = {
      user_id: "",
      secretkey: new LibCrypt().encode(salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
    }
    if (user) {
      post["user_id"] = user.id || user.user_id
      post["group_id"] = esp.config('group_id')
    }
    let unreadedCount = data.filter((item: any) => item.status != 2).length
    Notifications.setBadgeNumberAsync(unreadedCount)
    m.user_notification_fetchData(_uri, post);
  }

  static user_notification_fetchData(uri: string, post: any): void {
    new LibCurl(uri, post,
      (res: any) => {
        m.user_notification_parseData(res.list, uri)
        if (res.next != "") {
          m.user_notification_fetchData(res.next, post)
        }
      }, () => {

      }
    )
  }

  static user_notification_parseData(res: any, uri: string): void {
    if (res.length > 0) {
      const urls = LibUtils.getReduxState('user_notification', 'urls')
      if (urls && urls.indexOf(uri) < 0) {
        esp.dispatch({
          type: "user_notification_parseData",
          payload: {
            data: res,
            url: uri
          }
        })
      }
    }
  }

  static user_notification_setRead(id: string | number): void {
    esp.dispatch({
      type: "user_notification_setRead",
      payload: id
    })
  }

  static mapStateToProps(state: any): Object {
    return {
      data: state.user_notification.data
    }
  }

  constructor(props: UserNotificationProps) {
    super(props)
    this.props = props
  }

  componentDidMount(): void {
    super.componentDidMount()
    moment.locale(esp.langId());
    m.user_notification_loadData()
  }

  render(): any {
    const { colorPrimary, colorAccent, STATUSBAR_HEIGHT } = LibStyle;
    const { goBack } = this.props.navigation
    const data = [...this.props.data].reverse()
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar barStyle={"light-content"} />
        <View
          style={{ flexDirection: "row", height: (STATUSBAR_HEIGHT) + 50, paddingTop: STATUSBAR_HEIGHT, paddingHorizontal: 0, alignItems: "center", backgroundColor: colorPrimary }}>
          <Button transparent
            style={{ width: 50, height: 50, alignItems: "center", margin: 0 }}
            onPress={() => goBack()}>
            <Icon
              style={{ color: colorAccent }}
              name="md-arrow-back" />
          </Button>
          <Text
            style={{
              marginHorizontal: 10,
              fontSize: 18,
              textAlign: "left",
              flex: 1,
              color: colorAccent
            }}>Notifikasi</Text>
        </View>
        <LibList
          data={data}
          onRefresh={() => m.user_notification_loadData()}
          renderItem={(item: any) => (
            <TouchableOpacity onPress={() => LibNotification.openNotif(item)} >
              <UserNotification_item {...item} />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

export default connect(m.mapStateToProps)(m);