//

import React from "react";
import { Pressable, TouchableOpacity, View, Text } from "react-native";
import {
  esp,
  LibCrypt,
  LibCurl,
  LibList,
  LibComponent,
  LibNotification,
  LibStyle,
  UserNotification_item,
  LibStatusbar,
  LibObject,
  useGlobalState,
  UserClass,
  useGlobalReturn,
  LibIcon,
  LibUtils,
} from "esoftplay";
//@ts-ignore
import moment from "../../moment"
import * as Notifications from 'expo-notifications';
import { fastFilter } from "../../fast";
export interface UserNotificationProps {
  navigation: any,
  data: any[]
}

export interface UserNotificationState {

}

const initState = {
  data: [],
  urls: [],
  unread: 0
};

const state = useGlobalState(initState, { persistKey: 'user_notification', isUserData: true })

class m extends LibComponent<UserNotificationProps, UserNotificationState> {

  static state(): useGlobalReturn<any> {
    return state
  }

  static add(id: number, user_id: number, group_id: number, title: string, message: string, params: string, status: 0 | 1 | 2, created?: string, updated?: string): void {
    const item = { id, user_id, group_id, title, message, params, status, created, updated }
    let data = state.get().data
    data.unshift(item)
    state.set({
      ...state.get(),
      data: data
    })
  }

  static drop(): void {
    state.set(initState)
  }

  static user_notification_loadData(): void {
    const { protocol, domain, uri, salt } = esp.config()
    let _uri = protocol + "://" + domain + uri + "user/push-notif"
    let data = state.get().data
    const user = UserClass.state().get()
    if (!user?.id) {
      Notifications.setBadgeCountAsync(0)
    }
    /* hapus yang lebih lama dari 3 bulan */
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    const created = LibUtils.moment(String(d.getDate())).format('YYYY-MM-DD HH:mm:ss')
    let cdata = fastFilter(data, (row) => row.created > created)
    if (cdata.length != data.length) {
      /* jika data tidak sama artinya ada yang expired > 3 bulan */
      state.set(LibObject.set(state.get(), cdata)('data'))
    }
    if (data && data.length > 0) {
      const lastData = data[0]
      if (lastData.id)
        _uri += "?last_id=" + lastData.id || 0
    }
    let post: any = {
      user_id: "",
      secretkey: new LibCrypt().encode(salt + "|" + moment().format("YYYY-MM-DD hh:mm:ss"))
    }
    if (user) {
      post["user_id"] = user.id || user.user_id
      post["group_id"] = user.group_id || esp.config('group_id')
    }
    m.user_notification_fetchData(_uri, post);
  }

  static user_notification_fetchData(uri: string, post: any): void {
    new LibCurl(uri, post,
      (res: any) => {
        m.user_notification_parseData(res.list, uri)
        if (res.next != "") {
          m.user_notification_fetchData(res.next, post)
        }
      }, (msg) => {
      }
    )
  }

  static user_notification_parseData(res: any[], uri: string): void {
    if (res.length > 0) {
      const urls = state.get().urls
      if (urls && urls.indexOf(uri) < 0) {
        let { data, urls, unread } = state.get()
        const nUnread = unread + fastFilter(res, (row) => row.status != 2).length
        state.set({
          data: [...res.reverse(), ...data],
          urls: [uri, ...urls],
          unread: nUnread
        })
        Notifications.setBadgeCountAsync(nUnread)
      }
    }
  }

  static user_notification_setRead(id: string | number): void {
    let { data, unread, urls } = state.get()
    const index = data.findIndex((row) => row.id == String(id))
    if (index > -1) {
      const nUnread = unread > 0 ? unread - 1 : 0
      state.set({
        urls,
        data: LibObject.set(data, 2)(index, 'status'),
        unread: nUnread
      })
      Notifications.setBadgeCountAsync(nUnread)
    }
  }

  componentDidMount(): void {
    super.componentDidMount()
    moment().locale(esp.langId());
    m.user_notification_loadData()
  }

  render(): any {
    const { colorPrimary, colorAccent, STATUSBAR_HEIGHT } = LibStyle;
    const { goBack } = this.props.navigation
    return (
      <state.connect
        render={(props) => {
          const data = props.data
          return (
            <View style={{ flex: 1, backgroundColor: "white" }}>
              <LibStatusbar style={"light"} />
              <View
                style={{ flexDirection: "row", height: (STATUSBAR_HEIGHT) + 50, paddingTop: STATUSBAR_HEIGHT, paddingHorizontal: 0, alignItems: "center", backgroundColor: colorPrimary }}>
                <Pressable
                  style={{ width: 50, height: 50, alignItems: "center", margin: 0 }}
                  onPress={() => goBack()}>
                  <LibIcon.Ionicons
                    style={{ color: colorAccent }}
                    name="md-arrow-back" />
                </Pressable>
                <Text style={{ marginHorizontal: 10, fontSize: 18, textAlign: "left", flex: 1, color: colorAccent }}>Notifikasi</Text>
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
          )
        }}
      />

    );
  }
}

export default m