import { Ionicons } from "@expo/vector-icons";
import {
    esp, LibComponent, LibCrypt,
    LibCurl, LibStyle, UserClass
} from "esoftplay";
import { StatusBar } from 'expo-status-bar';
import React from "react";
import { Image, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";



/*

  <euserLogin
    setUser={(user)=>{}}
    user={user}
    onPressCancel={()=>{}}

*/

export interface UserLoginProps {

}

export interface UserLoginState {
  sosmed: string,
  username: string,
  password: string,
  email: string,
  isLoading: boolean
}

export default class m extends LibComponent<UserLoginProps, UserLoginState> {

  inputUsername: any;
  inputPassword: any;

  constructor(props: UserLoginProps) {
    super(props)
    this.state = {
      sosmed: "",
      username: "",
      password: "",
      email: "",
      isLoading: false
    }
    this.onSuccessLogin = this.onSuccessLogin.bind(this);
    this.onFailedLogin = this.onFailedLogin.bind(this);
    this.attemptLogin = this.attemptLogin.bind(this);
  }

  onSuccessLogin(user: any): void {
    UserClass.create(user)
  }

  onFailedLogin(msg: string): void {

  }

  attemptLogin(): void {
    this.setState({ isLoading: true })
    const uri = "user/mlogin"
    const config = esp.config();
    var post: any = {}
    const { username, password, email } = this.state
    if (username != "" && password != "") {
      post = {
        username: new LibCrypt().encode(username),
        password: new LibCrypt().encode(password),
      }
    }
    if (email != "") {
      post = {
        email: new LibCrypt().encode(email)
      }
      post.username = undefined
      post.password = undefined
    }
    if (post.hasOwnProperty("email") || post.hasOwnProperty("username") || post.hasOwnProperty("password")) {
      new LibCurl(config.content + uri, post,
        (res, msg) => {
          // console.log(res)
          this.onSuccessLogin(res)
          this.inputUsername.setNativeProps({ text: "" })
          this.inputPassword.setNativeProps({ text: "" })
          this.setState({
            isLoading: false,
            email: ""
          })
        },
        (msg) => {
          // console.log("gagal => " + msg, email)
          this.onFailedLogin(msg.message)
          this.setState({ isLoading: false, email: "" })
        }, 1
      )
    }
  }

  render(): any {
    const { colorPrimary, STATUSBAR_HEIGHT, isIphoneX, width } = LibStyle
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20} >
        <StatusBar style={"dark"} />
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: STATUSBAR_HEIGHT, paddingBottom: isIphoneX ? 30 : 0, alignItems: "center", justifyContent: "center" }} >
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }} >
            <Image source={esp.assets("logo.png")} style={{ width: 130, height: 130, resizeMode: "contain", marginVertical: 30 }} />
            <View style={{ width: width * 0.81, marginHorizontal: width * 0.095 }} >
              <TextInput
                ref={(e: any) => this.inputUsername = e}
                onChangeText={(e: string) => this.setState({ username: e })}
                style={{ fontSize: 16, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 5 }}
                returnKeyType={"next"}
                onSubmitEditing={() => this.inputPassword.focus()}
                blurOnSubmit={false}
                placeholder="username"
                keyboardType="email-address"
                underlineColorAndroid={colorPrimary}
                selectionColor={colorPrimary} />
              <TextInput
                ref={(e: any) => this.inputPassword = e}
                onChangeText={(e: string) => this.setState({ password: e })}
                style={{ fontSize: 16, marginBottom: 40, paddingVertical: 10, paddingHorizontal: 5 }}
                underlineColorAndroid={colorPrimary}
                secureTextEntry={true}
                placeholder="password"
                blurOnSubmit={true}
                returnKeyType={"go"}
                onSubmitEditing={() => this.attemptLogin()}
                selectionColor={colorPrimary} />
              <Pressable onPress={() => this.attemptLogin()} style={{ backgroundColor: colorPrimary, marginHorizontal: 3 }} >
                <Text>LOGIN</Text>
              </Pressable>
            </View>
            <Text style={{ margin: 20, textAlign: "center" }} >atau login dengan</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", width: width * 0.6 }} >
              <TouchableOpacity onPress={() => this.setState({ sosmed: "google" })} ><Ionicons name="logo-google" size={40} color={"#F34A38"} /></TouchableOpacity>
              <TouchableOpacity onPress={() => this.setState({ sosmed: "facebook" })} ><Ionicons name="logo-facebook" size={40} color={"#475993"} /></TouchableOpacity>
              <TouchableOpacity onPress={() => this.setState({ sosmed: "twitter" })} ><Ionicons name="logo-twitter" size={40} color={"#76A9EA"} /></TouchableOpacity>
              <TouchableOpacity onPress={() => this.setState({ sosmed: "instagram" })} ><Ionicons name="logo-instagram" size={40} color={"#0C5589"} /></TouchableOpacity>
            </View>
            {/* <Modal
              visible={this.state.sosmed != ""}
              backdropColor={"transparent"}
              onBackButtonPress={() => this.setState({ sosmed: "" })}
              onBackdropPress={() => this.setState({ sosmed: "" })} >
              <View style={{ margin: 24, flex: 1, backgroundColor: "white", borderRadius: 4 }} >
                <LibSociallogin
                  url={config.content + "user/commentlogin/" + this.state.sosmed}
                  onResult={(user) => {
                    this.inputUsername.setNativeProps({ text: "" })
                    this.inputPassword.setNativeProps({ text: "" })
                    this.setState(
                      {
                        username: "",
                        password: "",
                        sosmed: "",
                        email: user.email
                      },
                      () => {
                        this.attemptLogin()
                      })
                  }}
                />
              </View>
            </Modal> */}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
}