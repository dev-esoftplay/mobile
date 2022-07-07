//

import { LibComponent, LibIcon, LibList, LibNotification, LibStatusbar, LibStyle, useGlobalReturn, useGlobalState, UserNotification_item } from "esoftplay";
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