
// withHooks
// noPage
import esp from 'esoftplay/esp';
import React, { useRef } from 'react';
import { Text, View } from 'react-native';


export interface UserNotification_itemProps {
  created: string,
  id: number,
  message: string,
  notif_id: number,
  params: string,
  return: string,
  status: number,
  title: string,
  updated: string,
  user_id: number,
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/notification_item.md) untuk melihat dokumentasi*/
export default function m(props: UserNotification_itemProps): any {
	const LibStyle = useRef(esp.mod("lib/style")).current
	const LibUtils = useRef(esp.mod("lib/utils")).current

  return (
    <View style={[{ padding: 16, flexDirection: "row", backgroundColor: "white", marginBottom: 3, marginHorizontal: 0, width: LibStyle.width }, LibStyle.elevation(1.5)]} >
      <View style={{}} >
        <Text style={{ color: props.status == 2 ? "#999" : LibStyle.colorPrimary, marginBottom: 8 }} >{props.title}</Text>
        <Text ellipsizeMode="tail" numberOfLines={2} >{props.message}</Text>
        <Text style={{ fontSize: 9, marginTop: 5 }} >{LibUtils.moment(props.updated).fromNow()}</Text>
      </View>
    </View>
  )
}