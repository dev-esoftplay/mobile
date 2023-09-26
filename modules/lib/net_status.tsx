// noPage
import NetInfo from '@react-native-community/netinfo';

import { LibComponent } from 'esoftplay/cache/lib/component/import';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import { Animated, Text } from "react-native";

export interface LibNet_statusProps {
  isOnline?: boolean
}
export interface LibNet_statusState {
  zeroHeight: any
}

const state = useGlobalState({
  isOnline: true,
  isInternetReachable: true
})

class net_status extends LibComponent<LibNet_statusProps, LibNet_statusState> {
  static state(): useGlobalReturn<any> {
    return state
  }

  static setOnline(isOnline: boolean, isInternetReachable: boolean): void {
    state.set({ isOnline: isOnline, isInternetReachable: isInternetReachable })
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
      this.onChangeConnectivityStatus(!!state.isConnected, !!state.isInternetReachable)
    });
  }

  componentWillUnmount(): void {
    super.componentWillUnmount()
    this.unsubscribe()
  }

  onChangeConnectivityStatus(isConnected: boolean, isInternetReachable): void {
    let isOnline = isConnected && isInternetReachable
    net_status.setOnline(isConnected, isInternetReachable)
    if (isOnline) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.setState({ zeroHeight: 1 })
      }, 1500)
    } else {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.setState({ zeroHeight: 2 })
      }, 600)
    }
  }

  render(): any {
    const { zeroHeight } = this.state
    return (
      <state.connect
        render={(props) => {
          const { isOnline } = props
          const text = isOnline ? esp.lang("lib/net_status", "online") : esp.lang("lib/net_status", "offline")
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
