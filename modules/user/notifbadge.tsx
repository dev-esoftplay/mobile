// noPage


import { LibComponent, LibStyle } from "esoftplay";
import { Text, TouchableOpacity, View } from "react-native";

export interface UserNotifbadgeProps {
  data: any[],
  onPress: () => void
}

export interface UserNotifbadgeState {

}


export default class m extends LibComponent<UserNotifbadgeProps, UserNotifbadgeState> {

  props: UserNotifbadgeProps
  constructor(props: UserNotifbadgeProps) {
    super(props)
    this.props = props
  }

  componentDidMount(): void {
    super.componentDidMount()
  }

  render(): any {
    const { data } = this.props
    const counter = data.filter((item: any) => item.status != 2).length
    if (counter == 0) { return null }
    return (
      <View style={{ position: "absolute", top: 5, right: 5 }} >
        <TouchableOpacity onPress={() => this.props.onPress()} >
          <View style={{ backgroundColor: LibStyle.colorRed, minHeight: 30, paddingVertical: 2, paddingHorizontal: 5 }} >
            <Text style={{ fontSize: 10, color: 'white' }} >{counter}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
