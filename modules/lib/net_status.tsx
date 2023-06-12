// noPage
import NetInfo from '@react-native-community/netinfo';
import { useGlobalReturn } from 'esoftplay';
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import { Animated, Text } from "react-native";

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
      this.onChangeConnectivityStatus(state.isConnected, state.isInternetReachable)
    });
  }

  componentWillUnmount(): void {
    super.componentWillUnmount()
    this.unsubscribe()
  }

  onChangeConnectivityStatus(isConnected: boolean, isInternetReachable): void {
    let isOnline = (isConnected == true && isInternetReachable == true) ? true : false
    net_status.setOnline(isOnline)
    if (isOnline) {
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
