import React from "react";
import { View, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Text, Button, Icon, Item, Input, Thumbnail } from "native-base";
const { colorPrimary, width } = LibStyle;
import { RecyclerListView, LayoutProvider, DataProvider } from "recyclerlistview";
import {
  esp,
  LibUtils,
  LibCurl,
  LibContext,
  LibSociallogin,
  ContentComment_item,
  LibComponent,
  LibStyle
} from "esoftplay";
const config = esp.config();

export interface ContentComment_listProps {
  par_id: number,
  setUser: (user: any) => void,
  url: any,
  url_post: any,
  user: any,
  style?: any
}

export interface ContentComment_listState {
  showLogin: boolean,
  total: number,
  isLoading: boolean,
  page: number,
  isStop: boolean,
  isSend: boolean,
  url: any,
  url_post: any,
  user: any,
  data: any[],
  comment: string
}

export default class commentList extends LibComponent<ContentComment_listProps, ContentComment_listState> {
  layoutProvider: any = undefined
  contextProvider: any
  dataProvider: any
  input2: any
  list: any
  state: ContentComment_listState
  props: ContentComment_listProps
  constructor(props: ContentComment_listProps) {
    super(props);
    this.props = props
    this.state = {
      showLogin: false,
      total: 0,
      isLoading: true,
      page: 0,
      isStop: false,
      isSend: false,
      url: props.url,
      url_post: props.url_post,
      user: props.user || 1,
      data: [],
      comment: ""
    };
    this.layoutProvider = new LayoutProvider(
      (index: number) => 0,
      (type: number, dim: any) => {
        switch (type) {
          default:
            dim.width = width;
            dim.height = 100;
        }
      }
    )
    this.input2 = React.createRef()
    this.list = React.createRef()
    this.loadData = this.loadData.bind(this);
    this.postComment = this.postComment.bind(this);
    this.contextProvider = new LibContext("parent");
    this.dataProvider = new DataProvider((a: any, b: any) => a !== b);
  }

  componentDidUpdate(prevProps: ContentComment_listProps, prevState: ContentComment_listState): void {
    if (prevProps.user != this.props.user) {
      this.setState({
        user: this.props.user,
        url_post: this.props.url_post,
        url: this.props.url
      }, () => {
        setTimeout(() => {
          if (this.input2) {
            this.input2._root.focus()
          }
        }, 500)
      })
    }
  }

  postComment(): void {
    if (this.state.user !== 1) {
      if (this.state.comment != "") {
        var user = this.state.user
        delete user.ok
        this.setState({ isSend: true })
        var post = { ...user, content: this.state.comment }
        new LibCurl(this.state.url_post, post,
          (res: any, msg: string) => {
            this.setState({
              page: 0,
              isSend: false,
              isStop: false,
              comment: ""
            }, () => {
              this.loadData()
              if (this.list) {
                try {
                  this.list.scrollToTop(true)
                } catch (error) {

                }
              }
              if (this.input2) this.input2._root.setNativeProps({ text: "" })
            })
          },
          (msg: string) => {
            const success = msg.includes('<div class="alert alert-success" role="alert">')
            let _msg = (/<\/span>(.*)<\/div>/g).exec(msg)
            this.setState({
              page: 0,
              isSend: false,
              isStop: false,
              comment: success ? "" : this.state.comment
            }, () => {
              this.loadData()
              if (success) {
                if (this.list) try { this.list.scrollToTop(true) } catch (error) { }
                if (this.input2) this.input2._root.setNativeProps({ text: "" })
              }
            })
            if (!success)
              Alert.alert('Komentar gagal dikirim', _msg[1])
          }, 1
        )
      }
    } else {
      this.setState({ showLogin: true })
    }
  }

  loadData(): void {
    this.setState({ isLoading: true })
    new LibCurl(this.state.url + ((/\?/g).test(this.state.url) ? "&page=" : "?page=") + this.state.page, null,
      (res: any, msg: string) => {
        this.setState({
          total: res.total,
          isLoading: false,
          isStop: res.list.length == 0,
          data: this.state.page == 0 ? res.list : [...this.state.data, ...res.list]
        })
      },
      (msg: string) => { }
    )
  }

  componentDidMount(): void {
    super.componentDidMount()
    this.loadData()
  }

  render(): any {
    var replyText = " "
    var replySend = "Kirim"
    if (this.props.par_id != 0) {
      replyText = " Balasan "
      replySend = "Balas"
    }
    const comment_login = esp.config("comment_login");
    if (comment_login == 1 && this.state.user == 1 && this.state.showLogin) {
      return (
        <View style={{ flex: 1, backgroundColor: "white" }} >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }} >
            <Text note style={{ flex: 1, padding: 10 }} >{"Silakan login dengan salah satu akun sosial media berikut untuk dapat mengirimkan komentar"}</Text>
            <View style={{ justifyContent: "center" }} >
              <Button primary transparent small
                style={{ alignSelf: "flex-end" }}
                onPress={() => {
                  this.setState({ showLogin: false, user: this.props.user })
                }} >
                <Text style={{ color: colorPrimary }} >{"BATAL"}</Text>
              </Button>
            </View>
          </View>
          <LibSociallogin
            url={config.content + "user/commentlogin"}
            onResult={(user: any) => {
              this.setState({ user: user });
              this.props.setUser(user)
            }}
          />
        </View>
      )
    }
    return (
      <View
        style={{ flex: 1, backgroundColor: "white" }} >
        {
          (this.state.total == 0 && !this.state.isLoading && this.state.data.length == 0) ?
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} ><Text note >{"Belum ada"}{replyText}{"Komentar"}</Text></View>
            :
            <RecyclerListView
              ref={(e => this.list = e)}
              layoutProvider={this.layoutProvider}
              dataProvider={this.dataProvider.cloneWithRows(this.state.data)}
              forceNonDeterministicRendering={true}
              onEndReached={() => this.state.isStop ? {} : this.setState({ page: this.state.page + 1 }, () => this.loadData())}
              contextProvider={this.contextProvider}
              renderFooter={() => this.state.isLoading ? <ActivityIndicator /> : null}
              rowRenderer={(type: number, item: any) => {
                return <ContentComment_item {...item}
                  user={this.state.user}
                  setUser={this.props.setUser}
                  url={this.state.url} url_post={this.state.url_post} />
              }}
            />
        }
        <View
          style={{
            borderRadius: 2,
            borderWidth: 0.5,
            borderColor: "#f9f9f9",
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center"
          }}>
          <Item
            style={{
              borderBottomColor: "white",
              flex: 1,
              alignItems: "center"
            }}>
            <View style={{ alignItems: "center" }} >
              {
                this.state.user !== 1 && comment_login == 1
                  ?
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      null,
                      "Hi " + this.state.user.name,
                      [
                        {
                          text: "Logout Akun", onPress: () => {
                            LibSociallogin.delUser()
                            this.setState({ user: 1, showLogin: false })
                            this.props.setUser(1)
                          }, style: "cancel"
                        },
                        {
                          text: "Ubah Akun", onPress: () => {
                            this.setState({ user: 1, showLogin: true })
                          }
                        },
                      ],
                      { cancelable: true }
                    )
                  }} >
                    <Thumbnail small
                      source={this.state.user.image != "" ? { uri: this.state.user.image } : null}
                      style={{ margin: 5, height: 30, width: 30, borderRadius: 15 }} />
                  </TouchableOpacity>
                  :
                  comment_login == 1 ?
                    <TouchableOpacity onPress={() => { this.setState({ showLogin: true }) }}>
                      <Icon name={"md-chatbubbles"} style={{ color: "#999", marginLeft: 10 }} />
                    </TouchableOpacity>
                    :
                    <Icon name={"md-chatbubbles"} style={{ color: "#999", marginLeft: 10 }} />

              }
            </View>
            <View style={{ borderRadius: 5, backgroundColor: "#f5f5f5", flex: 1, height: 40, marginVertical: 5, marginLeft: 5 }} >
              <Input
                ref={(e) => this.input2 = e}
                onSubmitEditing={() => this.postComment()}
                onFocus={() => this.setState({ showLogin: true })}
                placeholder={"Tulis komentar"}
                selectionColor={LibUtils.colorAdjust(colorPrimary, 1)}
                returnKeyType={"send"}
                placeholderTextColor={"#999"}
                style={{ color: "#444", fontSize: 15, lineHeight: 20 }}
                onChangeText={(text: string) => this.setState({ comment: text })} />
            </View>
          </Item>
          <Button primary transparent small
            style={{ alignSelf: "center" }}
            onPress={() => this.state.isSend ? {} : this.postComment()} >
            {
              this.state.isSend ?
                <View>
                  <Text style={{ color: colorPrimary, opacity: 0 }} >{replySend}</Text>
                  <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flex: 1, alignItems: "center", justifyContent: "center" }} >
                    <ActivityIndicator color={colorPrimary} />
                  </View>
                </View>
                :
                <Text style={{ color: colorPrimary }} >{replySend}</Text>
            }
          </Button>
        </View>

      </View>
    )
  }
}
