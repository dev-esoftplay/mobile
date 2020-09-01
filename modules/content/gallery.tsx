import React from "react";
import { Component } from "react";
import { View, StyleSheet, Image, FlatList } from "react-native";
import { Button, Icon } from "native-base";
const { width, STATUSBAR_HEIGHT_MASTER } = LibStyle;
import { esp, LibUtils, LibComponent, LibStyle } from "esoftplay";
import { StatusBar } from 'expo-status-bar';

export interface ContentGalleryProps {
  navigation: any
}

export interface ContentGalleryState {
  scroll: number
}

// create a component
export default class ezoom extends LibComponent<ContentGalleryProps, ContentGalleryState> {
  state: ContentGalleryState;
  props: ContentGalleryProps;

  constructor(props: ContentGalleryProps) {
    super(props);
    this.props = props
    this.state = { scroll: 0 };
  }

  render(): any {
    const images = LibUtils.getArgs(this.props, "images", [])
    const image = LibUtils.getArgs(this.props, "image", "")
    if (images.length == 0) {
      images.push({
        image: image,
        title: "",
        description: ""
      })
    }

    return (
      <View
        style={styles.container}>
        <StatusBar style="light" />
        <FlatList
          data={images}
          horizontal
          style={styles.container}
          keyExtractor={(item: any, i: number) => i}
          pagingEnabled
          renderItem={({ item }: any) => {
            return (
              <View
                style={styles.container} >
                <Image
                  source={{ uri: item.image }}
                  style={styles.image} />
              </View>
            )
          }}
          showsHorizontalScrollIndicator={false} />
        <Button transparent
          style={{ position: "absolute", top: STATUSBAR_HEIGHT_MASTER, left: 0, alignSelf: "center", justifyContent: "center", height: 50 }}
          onPress={() => this.props.navigation.goBack(null)}>
          <Icon
            style={{ color: "white" }}
            name="md-close" />
        </Button>
      </View >
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  footerOverlay: { position: "absolute", padding: 16, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(255, 255, 255, .6)" },
  image: { flex: 1, width: width, resizeMode: "contain" }
});
