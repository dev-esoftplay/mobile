// 
import React, { ReactElement, createRef } from "react";
import { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Icon, Input } from "native-base";
import { esp, LibUtils, LibStyle } from "esoftplay";
const { elevation, colorPrimary } = LibStyle;
// create a component

export interface ContentSearchProps {
  defaultValue?: string,
  close: () => void,
  onSubmit: (uri: string) => void,
}

export interface ContentSearchState {

}

export default class esearch extends Component<ContentSearchProps, ContentSearchState> {
  inputSearch: any;
  inputText: any;
  props: ContentSearchProps;
  constructor(props: ContentSearchProps) {
    super(props)
    this.props = props
    this.inputText = createRef();
  }

  componentDidMount(): void {
    this.inputSearch = this.props.defaultValue || ""
    setTimeout(() => {
      if (this.inputText) {
        this.inputText._root.focus()
      }
    });
  }

  render(): any {
    return (
      <View>
        <View style={[{
          backgroundColor: "white",
          height: 50,
          alignItems: "center",
          flexDirection: "row"
        }, elevation(2)]} >
          <Button
            transparent={true}
            style={{
              height: 50,
              width: 50,
            }}
            onPress={() => this.props.close()}>
            <Icon
              name={"md-arrow-back"}
              style={{
                fontSize: 24,
                color: "#353535"
              }} />
          </Button>
          <Input
            ref={(e) => this.inputText = e}
            style={{ height: 50, width: "100%", fontSize: 17, color: "#555" }}
            placeholderTextColor={"#999"}
            selectionColor={LibUtils.colorAdjust(colorPrimary, 1)}
            defaultValue={this.inputSearch}
            returnKeyType="search"
            onSubmitEditing={() => {
              this.props.onSubmit(encodeURI(this.inputSearch))
              this.props.close()
            }}
            onChangeText={(e: any) => this.inputSearch = e}
            placeholder={"Temukan Berita ..."} />
          <Button
            transparent={true}
            style={{
              height: 50,
              width: 50,
            }}
            onPress={() => {
              this.props.onSubmit(encodeURI(this.inputSearch))
              this.props.close()
            }}>
            <Icon
              name="ios-search"
              style={{
                fontSize: 24,
                color: "#353535"
              }} />
          </Button>
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50",
  },
});

//make this component available to the app
