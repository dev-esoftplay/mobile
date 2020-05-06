import React from "react";
import { Component } from "react";
import { View, TouchableWithoutFeedback, Platform, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Icon, Thumbnail } from "native-base";
import moment from "moment/min/moment-with-locales"
import { esp, ContentComment_list, LibComponent, LibStyle } from "esoftplay";
const { colorPrimary, width, STATUSBAR_HEIGHT } = LibStyle;
import Modal from "react-native-modal";

export interface ContentComment_itemProps {
  id: number,
  par_id: string,
  name: string,
  image: string,
  email: string,
  setUser: (user: any) => void,
  website: string,
  content: string,
  date: string,
  reply: string,
  url: string,
  url_post: string,
  user: any
}

export interface ContentComment_itemState {
  isOpenChild: boolean
}

export default class Comment_item extends LibComponent<ContentComment_itemProps, ContentComment_itemState> {
  state: ContentComment_itemState
  props: ContentComment_itemProps

  constructor(props: ContentComment_itemProps) {
    super(props);
    this.props = props
    this.state = { isOpenChild: false };
  }

  render(): any {
    var { id, par_id, name, image, email, website, content, date, reply, url, url_post, user } = this.props
    url = url + ((/\?/g).test(url) ? "&par_id=" + id : "?par_id=" + id)
    url_post = url_post + ((/\?/g).test(url_post) ? "&par_id=" + id : "?par_id=" + id)

    return (
      <View
        style={[styles.bgComment, { paddingHorizontal: 17, width: width }]}>
        <View
          style={{ flexDirection: "row" }} >
          <Thumbnail small
            source={image != "" ? { uri: image } : null}
            style={{ marginRight: 10, marginTop: 5 }} />
          <View style={{ flex: 1 }} >
            <Text style={{ fontSize: 14 }} >{name}</Text>
            <Text style={{ fontSize: 11 }} note>{moment(date).format("LLLL")}</Text>
            <Text style={[{ fontSize: 13, color: "#444" }, styles.content]} note >{content}</Text>
            <View
              style={{ flexDirection: "row", marginTop: 5 }} >
              <TouchableWithoutFeedback
                onPress={() => this.setState({ isOpenChild: true })} >
                <View
                  style={styles.rowCenter} >
                  <Icon
                    style={[styles.textPrimary13, { marginRight: 10 }]}
                    name="ios-chatbubbles" />
                  <Text
                    style={styles.textPrimary13}>{reply} {"balasan"}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <Modal
              isVisible={this.state.isOpenChild}
              backdropColor={"transparent"}
              // animationType="slide"
              avoidKeyboard={Platform.OS == "ios"}
              onBackButtonPress={() => this.setState({ isOpenChild: false })}
              onBackdropPress={() => this.setState({ isOpenChild: false })}
              style={{ justifyContent: "flex-end", margin: 0, backgroundColor: "transparent" }}>
              <View style={{ marginTop: (Platform.OS == "ios" ? STATUSBAR_HEIGHT : 0) + 50, paddingBottom: LibStyle.isIphoneX ? 15 : 0, backgroundColor: "white", flex: 1 }} >
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderBottomWidth: 0.5, borderBottomColor: "#e1e1e1" }} >
                  <Text note style={{ flex: 1, padding: 10 }} >{"Balasan Komentar"}</Text>
                  <Button primary transparent small
                    style={{ alignSelf: "center" }}
                    onPress={() => this.setState({ isOpenChild: false })} >
                    <Text style={{ color: colorPrimary }} >{"Tutup"}</Text>
                  </Button>
                </View>
                <View
                  style={{ flexDirection: "row", backgroundColor: "#f5f5f5", padding: 17 }} >
                  <Thumbnail small
                    source={image != "" ? { uri: image } : null}
                    style={{ marginRight: 10, marginTop: 5 }} />
                  <View
                    style={{ flex: 1 }} >
                    <Text style={{ fontSize: 14 }} >{name}</Text>
                    <Text style={{ fontSize: 11 }} note>{moment(date).format("LLLL")}</Text>
                    <ScrollView style={{ maxHeight: 100 }} >
                      <Text style={[{ fontSize: 13, color: "#444" }, styles.content]} note >{content}</Text>
                    </ScrollView>
                  </View>
                </View>
                <ContentComment_list
                  url={url}
                  url_post={url_post}
                  user={user}
                  setUser={this.props.setUser}
                  par_id={id} />
              </View>
            </Modal>
          </View>
        </View>
      </View>
    )
  }
}


// define your styles
const styles = StyleSheet.create({
  content: {
    marginTop: 10,
    color: "#333"
  },
  bgComment: {
    paddingVertical: 10,
    borderBottomColor: "#f5f5f5",
    borderBottomWidth: 0.5
  },
  textPrimary13: {
    fontSize: 13,
    color: colorPrimary
  },
  rowCenter: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center"
  }
})

