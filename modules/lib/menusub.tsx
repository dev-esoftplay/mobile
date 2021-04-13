// 
import React from "react";
import { Component } from "react";
import { Text, View, FlatList, TouchableOpacity } from "react-native";
import { esp, LibMenu, LibComponent, LibStyle, LibUtils, LibIcon } from "esoftplay";
const { colorPrimary } = LibStyle;

export interface LibMenusubProps {
  data: any,
  id: number,
  selectedId: number,
  title: string,
  onClick: (data: any) => void
}

export interface LibMenusubState {
  expanded: boolean
}

export default class Emenusub extends LibComponent<LibMenusubProps, LibMenusubState> {

  props: LibMenusubProps
  constructor(props: LibMenusubProps) {
    super(props)
    this.props = props
  }

  state = {
    expanded: false
  }

  render(): any {
    var data = this.props.data.filter((item: any) => item.par_id == this.props.id)
    return (
      <View>
        <View style={{ flexDirection: "row", borderRadius: 5, margin: 5, paddingRight: 5, alignItems: "center", backgroundColor: this.props.selectedId == this.props.id ? LibUtils.hexToRgba(colorPrimary, 0.2) : "transparent" }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              this.props.onClick(this.props)
            }}>
            <Text style={{ color: this.props.selectedId == this.props.id ? colorPrimary : "#353535", flex: 1, padding: 12, fontSize: 15 }} >{this.props.title} </Text>
          </TouchableOpacity>
          {
            data.length > 0 ?
              <TouchableOpacity onPress={() => this.setState({ expanded: !this.state.expanded })} >
                <View style={{ paddingLeft: 10, flexDirection: "column" }}>
                  <LibIcon.Ionicons name={!this.state.expanded ? "ios-arrow-down" : "ios-arrow-up"} style={{ color: colorPrimary, fontSize: 20, paddingRight: 16 }} />
                </View>
              </TouchableOpacity>
              : null
          }
        </View>
        {this.state.expanded ? <LibMenu style={{ paddingLeft: 15 }} selectedId={this.props.selectedId} onItemSelected={(item: any) => { this.props.onClick(item) }} parent={this.props.id} data={data} /> : null}
      </View>
    )
  }
}