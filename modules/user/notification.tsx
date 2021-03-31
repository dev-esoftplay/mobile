//

import React from "react";
import { TouchableOpacity, View } from "react-native";
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
  LibStatusbar,
  LibObject,
  useGlobalState,
  UserClass,
  useGlobalReturn
} from "esoftplay";
//@ts-ignore
import moment from "moment/min/moment-with-locales"
import { Text, Button, Icon } from "native-base";

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

const state = useGlobalState(initState, { persistKey: 'user_notification' })

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
    var _uri = protocol + "://" + domain + uri + "user/push-notif"
    const data = state.get().data
    const user = UserClass.state().get()
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
      }, 1
    )
  }

  static user_notification_parseData(res: any[], uri: string): void {
    if (res.length > 0) {
      const urls = state.get().urls
      if (urls && urls.indexOf(uri) < 0) {
        let { data, urls, unread } = state.get()
        state.set({
          data: [...res.reverse(), ...data],
          urls: [uri, ...urls],
          unread: unread + res.filter((row) => row.status != 2).length
        })
      }
    }
  }

  static user_notification_setRead(id: string | number): void {
    let { data, unread, urls } = state.get()
    const index = data.findIndex((row) => row.id == String(id))
    if (index > -1)
      state.set({
        urls,
        data: LibObject.set(data, 2)(index, 'status'),
        unread: unread > 0 ? unread - 1 : 0
      })
  }

  componentDidMount(): void {
    super.componentDidMount()
    moment.locale(esp.langId());
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
                <Button transparent
                  style={{ width: 50, height: 50, alignItems: "center", margin: 0 }}
                  onPress={() => goBack()}>
                  <Icon
                    style={{ color: colorAccent }}
                    name="md-arrow-back" />
                </Button>
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