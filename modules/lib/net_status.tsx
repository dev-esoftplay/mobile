import React from "react";
import { LibComponent, esp } from "esoftplay";
import { Animated, Text } from "react-native";
import NetInfo from '@react-native-community/netinfo';
import { connect } from "react-redux";

export interface LibNet_statusProps {
  isOnline?: boolean
}
export interface LibNet_statusState {
  animHeight: any
}


class net_status extends LibComponent<LibNet_statusProps, LibNet_statusState> {
  static reducer(state: any, action: any): any {
    if (!state) {
      state = {
        isOnline: true
      }
    }

    switch (action.type) {
      case "lib_net_status_online":
        return {
          isOnline: true
        }
        break;
      case "lib_net_status_offline":
        return {
          isOnline: false
        }
        break;
      default:
        return state
    }
  }

  static setOnline(isOnline: boolean): void {
    esp.dispatch({ type: isOnline ? "lib_net_status_online" : "lib_net_status_offline" })
  }

  static mapStateToProps(state: any): any {
    return {
      isOnline: state.lib_net_status.isOnline
    }
  }

  timeout
  unsubscribe: any
  constructor(props: LibNet_statusProps) {
    super(props)
    this.state = { animHeight: 1 }
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
        this.setState({ animHeight: 1 })
      }, 1500)
    } else {
      this.setState({ animHeight: 2 })
      clearTimeout(this.timeout)
    }
  }

  render(): any {
    const { animHeight } = this.state
    const { isOnline } = this.props
    const text = isOnline ? "Device is Online" : "Device is Offline"
    const color = isOnline ? "green" : "red"
    return (
      <Animated.View style={{ height: animHeight == 1 ? 0 : undefined, backgroundColor: color, width: "100%" }} >
        <Text style={{ margin: 3, color: "white", textAlign: "center" }} >{text}</Text>
      </Animated.View>
    )
  }
}

export default connect(net_status.mapStateToProps)(net_status)
