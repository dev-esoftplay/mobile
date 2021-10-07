// noPage

import React from "react";
import { LibComponent, useGlobalState, useGlobalReturn } from "esoftplay";
import { Animated, Text } from "react-native";
import NetInfo from '@react-native-community/netinfo';

export interface LibNet_statusProps {
  isOnline?: boolean
}
export interface LibNet_statusState {
  zeroHeight: any
}

const state = useGlobalState({ isOnline: true })

class net_status extends LibComponent<LibNet_statusProps, LibNet_statusState> {
  static state(): useGlobalReturn<any> {
    return state
  }

  static setOnline(isOnline: boolean): void {
    state.set({ isOnline: isOnline })
  }

  timeout
  unsubscribe: any
  constructor(props: LibNet_statusProps) {
    super(props)
    this.state = { zeroHeight: 1 }
    this.onChangeConnectivityStatus = this.onChangeConnectivityStatus.bind(this)
    this.unsubscribe = undefined
  }

  componentDidMount(): void {
    super.componentDidMount()
    this.unsubscribe = NetInfo.addEventListener(state => {
      this.onChangeConnectivityStatus(state.isConnected)
    });
  }

  componentWillUnmount(): void {
    super.componentWillUnmount()
    this.unsubscribe()
  }

  onChangeConnectivityStatus(isConnected: boolean): void {
    net_status.setOnline(isConnected)
    if (isConnected) {
      this.timeout = setTimeout(() => {
        this.setState({ zeroHeight: 1 })
      }, 1500)
    } else {
      this.setState({ zeroHeight: 2 })
      clearTimeout(this.timeout)
    }
  }

  render(): any {
    const { zeroHeight } = this.state
    return (
      <state.connect
        render={(props) => {
          const { isOnline } = props
          const text = isOnline ? "Device is Online" : "Device is Offline"
          const color = isOnline ? "green" : "red"
          return (
            <Animated.View style={{ height: zeroHeight == 1 ? 0 : 'auto', backgroundColor: color, width: "100%" }} >
              <Text style={{ margin: 3, color: "white", textAlign: "center" }} >{text}</Text>
            </Animated.View>
          )
        }}
      />

    )
  }
}

export default net_status
