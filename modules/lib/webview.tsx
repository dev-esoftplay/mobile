/*  */

import React from "react";
import { Component } from "react";
import { StyleSheet, View, Animated, Dimensions, Platform } from "react-native";
import { WebView } from 'react-native-webview'
import { esp, LibComponent } from "esoftplay";
let { width, height } = Dimensions.get("window");
const config = esp.config();

//modify webview error:  https://github.com/facebook/react-native/issues/10865

export interface LibWebviewSourceProps {
  uri?: string,
  html?: string
}

export interface LibWebviewProps {
  defaultHeight?: number,
  source: LibWebviewSourceProps,
  needAnimate?: boolean,
  AnimationDuration?: number,
  needAutoResetHeight?: boolean,
  onMessage?: any,
  bounces?: any,
  onLoadEnd?: any,
  style?: any,
  scrollEnabled?: any,
  automaticallyAdjustContentInsets?: any,
  scalesPageToFit?: any,
  onFinishLoad: () => void
}

export interface LibWebviewState {
  height: number | undefined,
  source: any
}

class ewebview extends LibComponent<LibWebviewProps, LibWebviewState> {
  props: LibWebviewProps
  state: LibWebviewState
  _animatedValue: any;
  webview: any;
  heightMessage: any;

  static defaultProps = {
    needAnimate: true,
    AnimationDuration: 500,
    defaultHeight: 100,
    needAutoResetHeight: true
  };

  constructor(props: LibWebviewProps) {
    super(props);
    this.props = props
    this.state = {
      height: props.defaultHeight,
      source: props.source && props.source.hasOwnProperty("html") ? { html: config.webviewOpen + ewebview.fixHtml(props.source.html) + config.webviewClose } : props.source,
    };
    this._animatedValue = new Animated.Value(1);
    this.gotoShow = this.gotoShow.bind(this)
    this.webview = React.createRef()
    this.getMessageFromWebView = this.getMessageFromWebView.bind(this)
    this.resetHeight = this.resetHeight.bind(this)
    this.resetSmallHeight = this.resetSmallHeight.bind(this)
  }

  componentDidUpdate(prevProps: LibWebviewProps, prevState: LibWebviewState): void {
    if (this.props.source !== undefined && prevProps.source.html !== this.props.source.html) {
      this.setState({
        source: (this.props.source && this.props.source.hasOwnProperty("html"))
          ?
          { html: config.webviewOpen + ewebview.fixHtml(this.props.source.html) + config.webviewClose }
          :
          this.props.source
      });
    }
  }

  gotoShow(): void {
    if (this.props.needAnimate) this._animatedValue.setValue(0);
    Animated.timing(this._animatedValue, {
      toValue: 1,
      duration: this.props.AnimationDuration,
      useNativeDriver: true
    }).start();
  }

  componentDidMount(): void {
    super.componentDidMount()
  }
  getMessageFromWebView(event: any): void {
    let message = event.nativeEvent.data;
    if (this.heightMessage === undefined || this.heightMessage === null || this.heightMessage === "") {
      this.heightMessage = message;
      if (this.props.needAutoResetHeight) {
        this.resetHeight();
      }
    }
    if (this.props.onMessage !== undefined) {
      this.props.onMessage(event);
    }
  }

  resetHeight(): void {
    if (this.heightMessage === undefined || this.heightMessage === null || this.heightMessage === "") {
      return;
    }
    let message = this.heightMessage;
    let height = message;
    this.setState({
      height: (parseInt(height) + 50)
    });
    this.gotoShow();
  }

  resetSmallHeight(): void {
    this.setState({
      height: this.props.defaultHeight
    });
    this.gotoShow();
  }

  /*change hex to rgb, hex not supported in latest android system webview [v72.0.3626.76 28-Jan-2019] in playstore*/
  static fixHtml(html: string): string {
    // var regex = /\#([0-9a-fA-F]+)/g;
    // var matches = html.match(regex) || [];
    // for (let i = 0; i < matches.length; i++) {
    //   var e = matches[i];
    //   if (e.length >= 6 && e.length <= 7) {
    //     var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    //     e = e.replace(shorthandRegex, function (m, r, g, b) {
    //       return r + r + g + g + b + b;
    //     });
    //     var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
    //     if (result) {
    //       var rgb = "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")"
    //     } else {
    //       rgb = "rgb(0,0,0)"
    //     }
    //     html = html.replace(e, rgb)
    //   }
    // }
    return html
  }

  render(): any {
    let { bounces, onLoadEnd, style, scrollEnabled, automaticallyAdjustContentInsets, scalesPageToFit, onMessage, ...otherprops } = this.props;
    return (
      <Animated.View style={{ height: this.state.height, overflow: "hidden" }}>
        <WebView
          {...otherprops}
          ref={(e: any) => this.webview = e}
          source={this.state.source}
          bounces={bounces !== undefined ? bounces : true}
          javaScriptEnabled
          androidHardwareAccelerationDisabled={true}
          useWebKit={true}
          injectedJavaScript={'window.ReactNativeWebView.postMessage(document.body.scrollHeight)'}
          onLoadEnd={() => {
            if (this.props.onFinishLoad !== undefined)
              setTimeout(() => {
                this.props.onFinishLoad()
              }, 1000)
          }}
          style={[{ width: width, height: this.state.height }, style !== undefined ? style : {}]}
          scrollEnabled={scrollEnabled !== undefined ? scrollEnabled : false}
          automaticallyAdjustContentInsets={automaticallyAdjustContentInsets !== undefined ? automaticallyAdjustContentInsets : true}
          scalesPageToFit={scalesPageToFit !== undefined ? scalesPageToFit : true}
          onMessage={this.getMessageFromWebView.bind(this)}>
        </WebView>
      </Animated.View>
    );
  }
}

export default ewebview;


