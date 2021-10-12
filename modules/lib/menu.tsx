// noPage

import { LibComponent, LibMenusub } from "esoftplay";
import React from "react";
import { FlatList } from "react-native";


export interface LibMenuProps {
  onItemSelected: (item: any) => void,
  parent?: number,
  style?: any,
  data: any,
  selectedId: number
}

export interface LibMenuState {

}

export default class emenu extends LibComponent<LibMenuProps, LibMenuState> {

  props: LibMenuProps
  constructor(props: LibMenuProps) {
    super(props);
    this.props = props
  }

  onItemSelected(item: any): void {
    if (this.props.onItemSelected) {
      delete item.data
      this.props.onItemSelected(item)
    }
  }
  render(): any {
    var parent = this.props.parent ? this.props.parent : 0
    var style = this.props.style ? this.props.style : {}
    var data = this.props.data
    if (parent == 0) {
      data = this.props.data.filter((item: any) => item.par_id == parent)
    }
    return (
      <FlatList
        style={style}
        data={data}
        nestedScrollEnabled
        keyExtractor={(item: any) => (item.id).toString()}
        renderItem={({ item }: any) => <LibMenusub {...item} selectedId={this.props.selectedId} data={this.props.data} parent={parent} onClick={(item: any) => this.onItemSelected(item)} />}
      />
    )
  }
}
