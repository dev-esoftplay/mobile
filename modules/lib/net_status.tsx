// noPage
import NetInfo from '@react-native-community/netinfo';

import { LibComponent } from 'esoftplay/cache/lib/component/import';
import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import useGlobalSubscriber from 'esoftplay/subscribe';
import { Animated, Text } from "react-native";

export interface LibNet_statusProps {
  isOnline?: boolean
}
export interface LibNet_statusState {
  zeroHeight: any
}

export interface status {
  isOnline: boolean,
  isInternetReachable: boolean
}

const state = useGlobalState<status>({
  isOnline: true,
  isInternetReachable: true
})


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/net_status.md) untuk melihat dokumentasi*/
class net_status extends LibComponent<LibNet_statusProps, LibNet_statusState> {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/net_status.md#state) untuk melihat dokumentasi*/
  static state(): useGlobalReturn<any> {
    return state
  }

  static subscriber = useGlobalSubscriber<status>({
    isOnline: true,
    isInternetReachable: true
  })

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/net_status.md#setOnline) untuk melihat dokumentasi*/
  static setOnline(isOnline: boolean, isInternetReachable: boolean): void {
    net_status.subscriber.trigger({ isOnline, isInternetReachable })
    state.set({ isOnline: isOnline, isInternetReachable: isInternetReachable })
  }

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
