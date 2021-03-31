// 

import React from "react";
import { Component } from "react"
import { View } from "react-native";
import { Badge, Text } from "native-base"
import { esp, UserNotification, LibComponent } from "esoftplay";
import { TouchableOpacity } from "react-native";

export interface UserNotifbadgeProps {
  data: any[],
  onPress: () => void
}

export interface UserNotifbadgeState {

}


export default class Enotifbadge extends LibComponent<UserNotifbadgeProps, UserNotifbadgeState> {

  props: UserNotifbadgeProps
  constructor(props: UserNotifbadgeProps) {
    super(props)
    this.props = props
  }

  componentDidMount(): void {
    super.componentDidMount()
    UserNotification.user_notification_loadData()
  }

  render(): any {
    const { data } = this.props
    const counter = data.filter((item: any) => item.status != 2).length
    if (counter == 0) { return null }
    return (
      <View style={{ position: "absolute", top: 5, right: 5 }} >
        <TouchableOpacity onPress={() => this.props.onPress()} >
          <Badge style={{ transform: [{ scale: 0.7 }] }} >
            <Text>{counter}</Text>
          </Badge>
        </TouchableOpacity>
      </View>
    );
  }
}
