
import React from "react";
import { Component } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { Left, Button, Icon, Text, ListItem } from "native-base";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment/min/moment-with-locales"
import {
  esp,
  ContentItem,
  LibUtils,
  LibCurl,
  ContentAudio,
  LibStyle,
  LibWebview,
  ContentVideo,
  LibComponent,
  LibNavigation,
  ContentConfig
} from "esoftplay";
const { colorPrimary, width, colorAccent, colorPrimaryDark } = LibStyle;
const config = esp.config();
const { STATUSBAR_HEIGHT_MASTER } = LibStyle;
import { StatusBar } from 'expo-status-bar';
var HEADER_MAX_HEIGHT = (width * 4 / 5) + STATUSBAR_HEIGHT_MASTER;
var HEADER_MIN_HEIGHT = 50 + STATUSBAR_HEIGHT_MASTER;
var HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;


export interface ContentDetailProps {
  url?: string,
  navigation: any,
  id?: number,
  title?: string,
  image?: string,
  created?: string
}
export interface ContentDetailState {
  scrollY: any,
  toolbarHeight: number,
  result: any,
  images_page: number,
  isPlayingAudio: boolean,
  showModal: boolean,
  view: any,
  isPageReady: boolean,
}

/**
"template": "detail.html.php",
"title": "1",
"created": "1",
"modified": 0,
"author": "1",
"tag": "1",
"tag_link": "1",
"rating": "1",
"rating_vote": "1",
"thumbsize": "250",
"comment": 1,
"comment_auto": "1",
"comment_list": "9",
"comment_form": "1",
"comment_emoticons": "1",
"comment_spam": "0",
"comment_email": "1",
"pdf": "1",
"print": "1",
"email": "1",
"share": "1"
*/

export default class edetail extends LibComponent<ContentDetailProps, ContentDetailState> {
  audioPlayer: any;
  state: ContentDetailState;
  props: ContentDetailProps

  constructor(props: ContentDetailProps) {
    super(props);
    this.props = props
    this.state = {
      scrollY: new Animated.Value(0),
      toolbarHeight: HEADER_MIN_HEIGHT,
      result: "",
      images_page: 1,
      isPlayingAudio: false,
      showModal: false,
      view: undefined,
      isPageReady: false
    };
    this.onScrollEnd = this.onScrollEnd.bind(this)
    moment.locale(esp.langId());
  }

  componentDidMount(): void {
    super.componentDidMount();
    var url = this.props.url ? this.props.url : LibUtils.getArgs(this.props, "url", config.content)
    new LibCurl(url, null,
      (result: any, msg: string) => {
        setTimeout(() => {
          this.setState({ result: result })
        }, 500)
        ContentConfig.setDetail(result.config)
      },
      (msg: string) => { }
    )
  }

  onScrollEnd(e: any): void {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;
    this.setState({ images_page: Math.floor(contentOffset.x / viewSize.width) + 1 })
  }

  render(): any {
    var result: any = {}
    result.id = LibUtils.getArgs(this.props, "id", this.props.id);
    result.url = LibUtils.getArgs(this.props, "url", this.props.url);
    result.title = LibUtils.getArgs(this.props, "title", this.props.title);
    result.image = LibUtils.getArgs(this.props, "image", this.props.image);
    result.created = LibUtils.getArgs(this.props, "created", this.props.created);
    let config = LibUtils.getReduxState('content_config', 'detail')

    if (!this.state.result.content) {
      return <View style={{ flex: 1, backgroundColor: "white" }} >
        {
          result.image != "" && config &&
          <View style={{ width: width, height: (width * 0.8) + STATUSBAR_HEIGHT_MASTER }} >
            <Animated.Image
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                width: width,
                height: (width * 4 / 5) + STATUSBAR_HEIGHT_MASTER
              }}
              source={{ uri: LibUtils.getArgs(this.props, "image", "") }}
            />
            <LinearGradient
              style={{ height: width / 4, position: "absolute", bottom: 0, left: 0, right: 0 }}
              locations={[0.01, 0.99]}
              colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,1)"]} />
          </View>
        }
        {config.title == 1 && <Text style={[styles.title]} >{result.title}</Text>}
        {result.created != "" && config.created && <Text note style={styles.created}>{moment(result.created).format("dddd, DD MMMM YYYY HH:mm")}</Text>}
      </View>
    }

    result = this.state.result

    //if (result.image == "") {
    //HEADER_MAX_HEIGHT = HEADER_MIN_HEIGHT
    //} else {
    HEADER_MAX_HEIGHT = (width * 4 / 5) + STATUSBAR_HEIGHT_MASTER;
    //}
    var isDownload = result.link != "" && result.type === "download"
    var isAudio = result.code != "" && result.type === "audio"
    var isVideo = result.code != "" && result.type === "video"

    HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - this.state.toolbarHeight;

    var images: object[] = []
    if (result.images.length === 0) { images.push({ image: result.image }) } else { images = result.images }

    const headerTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolate: "clamp",
    });

    const imageOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 1, 0],
      extrapolate: "clamp",
    });

    const imageTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 100],
      extrapolate: "clamp",
    });

    const titleOpacity = this.state.scrollY.interpolate({
      inputRange: [HEADER_SCROLL_DISTANCE - 1, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const titleScale = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 1, 1],
      extrapolate: "clamp",
    });

    return (
      <View
        style={styles.fill}>
        <StatusBar style={"light"} />
        {
          isAudio ?
            <ContentAudio
              code={result.code}
              onStatusChange={(isPlaying: boolean) => { this.setState({ isPlayingAudio: isPlaying }) }}
              onRef={(ref: any) => this.audioPlayer = ref} /> : null
        }
        <Animated.ScrollView
          style={styles.fill}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true },
          )}>
          <View
            style={{ marginTop: HEADER_MAX_HEIGHT - 30 }}>
            <View
              style={
                styles.scrollViewContent}>
              {
                config.title == 1 &&
                <Text
                  style={styles.title}>
                  {result.title}
                </Text>
              }
              {
                config.created &&
                <Text
                  note
                  style={styles.created}>
                  {moment(result.created).format("dddd, DD MMMM YYYY HH:mm")}
                </Text>
              }
              <LibWebview
                source={{ html: result.content }}
                style={{ flex: 1, marginVertical: 20 }}
                onFinishLoad={() => { this.setState({ isPageReady: true }) }}
              />
              {
                this.state.isPageReady ?
                  <View>
                    {
                      config.comment == 1 ?
                        <Button
                          small
                          style={{ alignSelf: "center", backgroundColor: colorPrimary }}
                          onPress={() => this.props.navigation.navigate("content/comment", { id: result.id })} >
                          <Text>{"Komentar"}</Text>
                        </Button>
                        : null
                    }
                    {
                      config.tag == 1 &&
                      <ScrollView bounces={false}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        contentContainerStyle={styles.isPageReady} >
                        {
                          result.cats.map((cat: any, i: number) => {
                            return (
                              <Button
                                key={cat + i}
                                disabled={config.tag_link != 1}
                                success small bordered
                                style={{ margin: 5, borderColor: colorPrimary }}
                                onPress={() => this.props.navigation.push("content/list", { url: cat.url, title: '#' + cat.title })} >
                                <Text style={{ color: colorPrimary }} >#{cat.title}</Text>
                              </Button>
                            )
                          })
                        }
                      </ScrollView>
                    }
                    <View>
                      {
                        (result.related.length > 0) &&
                        <ListItem itemDivider first>
                          <Text>{"Artikel Terkait"}</Text>
                        </ListItem>
                      }
                      {
                        result.related.map((rel: any, i: number) => {
                          return (
                            <ContentItem
                              key={rel + i}
                              {...rel}
                              navigation={this.props.navigation} />
                          )
                        })
                      }
                    </View>
                  </View>
                  : null
              }
            </View>
          </View>
        </Animated.ScrollView>
        <Animated.View
          style={[
            styles.header, isVideo ? null : { transform: [{ translateY: headerTranslate }] },
          ]}>
          {
            (isVideo) ?
              <ContentVideo code={result.code} style={styles.video} />
              :
              <Animated.ScrollView
                horizontal
                onMomentumScrollEnd={this.onScrollEnd}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={[
                  styles.foregroundHeader,
                  { opacity: imageOpacity, transform: [{ translateY: imageTranslate }], },
                ]}>
                {
                  images.map((image: any, i) => {
                    return <TouchableWithoutFeedback
                      key={image + i}
                      style={{ flex: 1, width: width, height: HEADER_MAX_HEIGHT }}
                      onPress={() => LibNavigation.navigate("content/zoom", { images: images, position: this.state.images_page - 1 })} >
                      <View>
                        <Image
                          style={styles.backgroundImage}
                          source={{ uri: image.image }}
                        />
                        <LinearGradient
                          style={{ height: width / 4, position: "absolute", bottom: 0, left: 0, right: 0 }}
                          locations={[0.01, 0.99]}
                          colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,1)"]} />
                      </View>
                    </TouchableWithoutFeedback>
                  })
                }
              </Animated.ScrollView>
          }
          {
            (images.length > 1) ?
              <Animated.Text
                style={[styles.absIndicator, { opacity: imageOpacity, }]} >{this.state.images_page}/{images.length}</Animated.Text> : null
          }
        </Animated.View>
        <Animated.View
          style={[
            styles.bar,
            { height: this.state.toolbarHeight - STATUSBAR_HEIGHT_MASTER, opacity: isVideo ? 0 : titleOpacity, },
          ]}>
          <Left>
            {
              config.title == 1 &&
              <Text
                numberOfLines={1}
                ellipsizeMode={"tail"}
                onLayout={(event: any) => {
                  var { x, y, width, height } = event.nativeEvent.layout;
                  this.setState({ toolbarHeight: HEADER_MIN_HEIGHT > height ? HEADER_MIN_HEIGHT : /*height*/ HEADER_MIN_HEIGHT })
                }} style={styles.toolbarTitle} >{result.title}</Text>
            }
          </Left>
        </Animated.View>
        <Button transparent
          style={styles.backButton}
          onPress={() => this.props.navigation.goBack()}>
          <Icon
            style={{ color: "white" }}
            name="md-arrow-back" />
        </Button>
        {
          isAudio || isDownload ?
            <Animated.View
              style={[styles.fab, { opacity: imageOpacity, transform: [{ translateY: headerTranslate }] }]}>
              <TouchableWithoutFeedback
                style={styles.fab}
                onPress={isAudio ? () => this.audioPlayer._onPlayPausePressed() : () => Linking.openURL(result.link)}>
                <Icon
                  name={isAudio ? (this.state.isPlayingAudio ? "md-pause" : "md-play") : "md-download"}
                  style={{ color: colorAccent, fontSize: 25 }} />
              </TouchableWithoutFeedback>
            </Animated.View>
            : null

        }
      </View>
    );
  }
}



const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  imageSquare: {
    margin: 3,
    borderRadius: 5,
    width: (width / 3) - 2,
    height: (width / 3) - 2,
    resizeMode: "cover",
  },
  content: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: STATUSBAR_HEIGHT_MASTER,
    left: 0,
    alignSelf: "center",
    justifyContent: "center",
    height: HEADER_MIN_HEIGHT - STATUSBAR_HEIGHT_MASTER
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colorPrimaryDark,

    // opacity: 0.5,
    overflow: "hidden",
    height: HEADER_MAX_HEIGHT,

  },
  toolbarTitle: {
    color: "white",
    fontSize: 18,
    // fontWeight: "bold"
  },
  foregroundHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
  },
  isPageReady: {
    padding: 10,
    alignItems: "center"
  },
  backgroundImage: {
    width: width,
    flex: 1,
    height: HEADER_MAX_HEIGHT,
    resizeMode: "cover",
  },
  bar: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    flexDirection: "row",
    top: STATUSBAR_HEIGHT_MASTER,
    padding: 10,
    paddingRight: HEADER_MIN_HEIGHT - STATUSBAR_HEIGHT_MASTER + 10,
    marginLeft: HEADER_MIN_HEIGHT - STATUSBAR_HEIGHT_MASTER,
    left: 0,
    right: 0,
  },
  title: {
    marginTop: 25,
    fontSize: 23,
    marginLeft: 17,
    marginRight: 17,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#353535"
  },
  created: {
    marginHorizontal: 17,
    marginBottom: 10
  },
  subtitle: {
    color: "white",
    fontSize: 14,
  },
  scrollViewContent: {
    backgroundColor: "white",
    marginTop: 30,
  },
  row: {
    height: 40,
    margin: 16,
    backgroundColor: "#D3D3D3",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    elevation: 3, shadowColor: "black", shadowOffset: { width: 0, height: 3 / 2 }, shadowRadius: 3, shadowOpacity: 0.24,
    position: "absolute",
    marginVertical: 3,
    marginHorizontal: 3,
    height: 50,
    width: 50,
    top: HEADER_MAX_HEIGHT - 30 + 2,
    right: 12,
    backgroundColor: colorPrimary,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: width,
    flex: 1,
    height: HEADER_MAX_HEIGHT,
  },
  absIndicator: {
    position: "absolute",
    top: 12 + STATUSBAR_HEIGHT_MASTER,
    right: 10,
    color: "white",
    backgroundColor: "transparent",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
  }
});
