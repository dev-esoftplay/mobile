//
import { useGlobalReturn } from 'esoftplay';
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibList } from 'esoftplay/cache/lib/list/import';
import { LibNotification } from 'esoftplay/cache/lib/notification/import';
import { LibStatusbar } from 'esoftplay/cache/lib/statusbar/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { UserNotification_item } from 'esoftplay/cache/user/notification_item/import';
import useGlobalState from 'esoftplay/global';
import React from 'react';


import { Pressable, Text, TouchableOpacity, View } from "react-native";
//@ts-ignore
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

const state = useGlobalState<any>(initState, { persistKey: "user_notification_data", isUserData: true })
class m extends LibComponent<UserNotificationProps, UserNotificationState> {

  static state(): useGlobalReturn<any> {
    return state
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
                onRefresh={() => LibNotification.loadData(true)}
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