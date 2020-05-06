//
import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
  RefreshControl
} from "react-native";
import { Container, Button, Text, Icon } from "native-base";
import Drawer from "react-native-drawer";
import moment from "moment/min/moment-with-locales"
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import {
  esp,
  LibCurl,
  LibUtils,
  ContentMenu,
  ContentSearch,
  ContentItem,
  ContentConfig,
  LibComponent,
  LibStyle
} from "esoftplay";
import { StatusBar, Animated } from "react-native";
import { connect } from "react-redux";
const { defaultStyle, colorPrimaryDark, colorAccent, width, STATUSBAR_HEIGHT_MASTER } = LibStyle;
const config = esp.config();

var menu: any;

const ViewTypes = {
  HEADER: 0,
  ITEM: 1,
};

export interface ContentListProps {
  url?: string,
  title?: string,
  dispatch?: any,
  navigation: any
}
export interface ContentListState {
  animSearch: any,
  url: string,
  urlori: string,
  title: string,
  titleori: string,
  data: any[],
  page: number,
  isDrawerOpen: boolean,
  searchView: boolean,
  isRefreshing: boolean,
  isStop: boolean,
}


class elist extends LibComponent<ContentListProps, ContentListState>{
  dataProvider: any;
  _layoutProvider: any;
  drawer: any;
  searchQuery: string = "";
  ContentMenu: any;
  state: any;
  props: any;

  static mapStateToProps(state: any): any {
    return {
      routes: state.user_index
    }
  }

  constructor(props: ContentListProps) {
    super(props);
    moment.locale(esp.langId());
    this.dataProvider = new DataProvider((r1: any, r2: any) => { return r1 !== r2; });
    this._layoutProvider = new LayoutProvider(
      (index: number) => {
        if (index === 0) {
          return ViewTypes.HEADER;
        } else {
          return ViewTypes.ITEM;
        }
      },
      (type: number, dim: any) => {
        switch (type) {
          case ViewTypes.HEADER:
            dim.width = width
            dim.height = width * 9 / 16
            break;
          case ViewTypes.ITEM:
            dim.width = width;
            dim.height = 110;
            break;
          default:
            dim.width = 0;
            dim.height = 0;
        }
      }
    );
    this._rowRenderer = this._rowRenderer.bind(this);
    this.state = {
      animSearch: new Animated.Value(0),
      url: props.url ? props.url : LibUtils.getArgs(props, "url", config.content),
      urlori: props.url ? props.url : LibUtils.getArgs(props, "url", config.content),
      title: props.title ? props.title : LibUtils.getArgs(props, "title", "Home"),
      titleori: props.title ? props.title : LibUtils.getArgs(props, "title", "Home"),
      data: [],
      page: 0,
      searchView: false,
      isRefreshing: false,
      isStop: false,
    }
    this.doFetch = this.doFetch.bind(this)
    this.loadData = this.loadData.bind(this)
    this.loadMore = this.loadMore.bind(this)
    this.openDrawer = this.openDrawer.bind(this)
    this.closeDrawer = this.closeDrawer.bind(this)
    this.onBackPress = this.onBackPress.bind(this)
    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
  }

  loadData(isRefreshing?: boolean): void {
    this.doFetch(0, isRefreshing)
  }

  loadMore(): void {
    this.doFetch(this.state.page + 1)
  }

  doFetch(page?: number, isRefreshing?: boolean): void {
    if (!page) page = 0;
    if (isRefreshing) this.setState({ data: [], isStop: false })
    new LibCurl(this.state.url + "?page=" + page, null,
      (result: any, msg: string) => {
        this.setState((state, props) => {
          return {
            data: state.data.length > 0 ? [...state.data, ...result.list] : [...result.list],
            page: page,
            isStop: result.list.length === 0,
            isRefreshing: false
          }
        })
        ContentConfig.setList(result.config)
      },
      (msg: string) => {
        // console.log("sampe sini", msg)
      }, 1
    )

  }

  onRefresh(): void {
    this.setState({
      data: [],
      isStop: false,
      page: 0
    }, () => this.doFetch())
  }

  closeDrawer(): void {
    this.drawer.close()
  }

  openDrawer(): void {
    this.drawer.open()
  }


  componentDidMount(): void {
    super.componentDidMount();
    this.loadData();
    setTimeout(() => {
      BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
      this.ContentMenu.loadMenu((m: any) => {
        menu = m
      })
    }, 500);
  }

  componentWillUnmount(): void {
    super.componentWillUnmount()
    setTimeout(() => {
      BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    }, 500);
  }

  onBackPress(): boolean {
    var routers = this.props.routes
    if (!this.state.isDrawerOpen) {
      if (Platform.OS == "ios") {
        return false;
      } else if (!this.state.searchView && (!routers.index || routers.index == 0)) {
        try {
          if (this.state.url != this.state.urlori) {
            this.setState({ url: this.state.urlori, title: menu[0].title })
            this.ContentMenu.setSelectedId(menu[0].id)
            return true
          } else {
            BackHandler.exitApp()
          }
        } catch (e) {
          BackHandler.exitApp()
        }
      } else if (this.state.searchView) {
        this.setState({ searchView: false })
        return true
      } else {
        this.props.navigation.goBack(null);
        return true
      }
    }
    this.closeDrawer()
    return true;
  };

  componentDidUpdate(prevProps: ContentListProps, prevState: ContentListState): void {
    if (prevState.url != this.state.url) {
      this.onRefresh()
    }
  }

  openSearch(): void {
    this.setState({ searchView: true }, () => {
      Animated.timing(this.state.animSearch, {
        toValue: 1,
        duration: 300
      }).start()
    })
  }

  closeSearch(): void {
    Animated.timing(this.state.animSearch, {
      toValue: 0,
      duration: 300
    }).start(() => {
      this.setState({ searchView: false })
    })
  }

  render(): any {
    const { goBack, navigate } = this.props.navigation
    const { routes } = this.props
    var indexRoutes = routes.index
    var isRoot = indexRoutes == 0 || !indexRoutes
    var searchOpacity = this.state.animSearch.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp"
    })
    return (
      <Drawer
        ref={(ref: any) => { this.drawer = ref; }}
        openDrawerOffset={0.2}
        onOpen={() => this.setState({ isDrawerOpen: true })}
        onClose={() => this.setState({ isDrawerOpen: false })}
        tapToClose={true}
        disabled={!isRoot}
        type={"overlay"}
        tweenHandler={(ratio: number) => ({
          main: {
            opacity: 1,
          },
          mainOverlay: {
            opacity: ratio / 2,
            backgroundColor: "black",
          },
        })}
        content={
          <ContentMenu
            ref={(e: any) => this.ContentMenu = e}
            url={this.state.url + "menu"}
            style={{ opacity: isRoot ? 1 : 0 }}
            closeDrawer={() => this.closeDrawer()}
            onItemSelected={(e: any) => { this.setState({ url: e.url, title: e.title }) }}
            navigation={this.props.navigation}
            dispatch={this.props.dispatch}
            nav={routes} />
        }>
        <Container>
          <View
            style={styles.statusBar}>
            <StatusBar translucent
              barStyle="light-content" />
          </View>
          <View style={{
            backgroundColor: colorPrimaryDark,
            height: 50,
            alignItems: "center",
            flexDirection: "row"
          }} >
            <Button
              transparent={true}
              style={{
                height: 50,
                width: 50,
              }}
              onPress={() => isRoot ? this.openDrawer() : goBack()}>
              <Icon
                name={isRoot ? "md-menu" : "md-arrow-back"}
                style={{
                  fontSize: 24,
                  color: colorAccent
                }} />
            </Button>
            <Text
              style={{
                marginHorizontal: 10,
                fontSize: 18,
                flex: 1,
                color: colorAccent
              }}>
              {this.state.title}
            </Text>
            <Button
              transparent={true}
              style={{
                height: 50,
                width: 50,
              }}
              onPress={() => { this.openSearch() }}>
              <Icon
                name="ios-search"
                style={{
                  fontSize: 24,
                  color: colorAccent
                }} />
            </Button>
          </View>
          {
            this.state.data.length > 0 ?
              <RecyclerListView
                scrollViewProps={{
                  refreshControl: <RefreshControl refreshing={this.state.isRefreshing} onRefresh={() => this.loadData(true)} />
                }}
                layoutProvider={this._layoutProvider}
                onEndReached={() => this.loadMore()}
                renderFooter={() => {
                  return this.state.isStop ? null :
                    <ActivityIndicator
                      color={colorPrimaryDark}
                      style={{ padding: 20, alignSelf: "center" }} />
                }}
                dataProvider={this.dataProvider.cloneWithRows(this.state.data)}
                rowRenderer={this._rowRenderer} />
              : this.state.data.length == 0 && this.state.isStop ?
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} ><Text note >{"Artikel masih kosong"}</Text></View>
                :
                <ActivityIndicator
                  color={colorPrimaryDark}
                  style={{ padding: 20, alignSelf: "center" }} />
          }
          {
            this.state.searchView ?
              <Animated.View style={{ position: "absolute", top: STATUSBAR_HEIGHT_MASTER, left: 0, right: 0, opacity: searchOpacity }} >
                <ContentSearch
                  close={() => this.closeSearch()}
                  defaultValue={this.searchQuery}
                  onSubmit={(e: any) => {
                    this.props.navigation.push("content/list", { url: String(this.state.urlori).substr(0, String(this.state.urlori).lastIndexOf("/") + 1) + "search.htm?id=" + e, title: decodeURI(e) })
                    this.searchQuery = decodeURI(e)
                  }}
                />
              </Animated.View>
              : null
          }
        </Container>
      </Drawer>
    );
  }

  _rowRenderer(type: number, item: any): any {
    switch (type) {
      case ViewTypes.HEADER:
        return (
          <ContentItem data={this.state.data} {...item} index={0} navigation={this.props.navigation} />
        );
      case ViewTypes.ITEM:
        return (
          <ContentItem data={this.state.data} {...item} index={1} navigation={this.props.navigation} />
        );
      default:
        return null;
    }
  }
}


const styles = StyleSheet.create({
  ...defaultStyle,
  overflow: {
    margin: 5,
    overflow: "hidden",
  },
  containerRow: {
    marginBottom: 0.5,
    flex: 1,
    backgroundColor: "white",
    flexDirection: "row"
  },
  text11: {
    fontSize: 11
  },
  image: {
    width: 110,
    height: 110,
    resizeMode: "cover"
  },
  wrapper: {
    flex: 1,
    padding: 10,
    margin: 10
  }
});

export default connect(elist.mapStateToProps)(elist);
