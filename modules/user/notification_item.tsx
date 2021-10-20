// noPage

import { LibStyle, LibUtils } from 'esoftplay';
import React from 'react';
import { Text, View } from 'react-native';


export interface UserNotificationProps {
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
export default function m(props: UserNotificationProps): any {
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