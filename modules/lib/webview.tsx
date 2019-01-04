/*  */

import React from 'react';
import { Component } from 'react';
import { StyleSheet, View, WebView, Animated, Dimensions } from 'react-native';
import { esp, LibComponent } from 'esoftplay';
let { width, height } = Dimensions.get('window');
const config = esp.config();

//modify webview error:  https://github.com/facebook/react-native/issues/10865

export interface LibWebviewSourceProps {
  uri?: string,
  html?: string
}

export interface LibWebviewProps {
  defaultHeight?: number,
  source: LibWebviewSourceProps,
  needAnimate: boolean,
  AnimationDuration: number,
  needAutoResetHeight: boolean,
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
      source: props.source && props.source.hasOwnProperty('html') ? { html: config.webviewOpen + props.source.html + config.webviewClose } : props.source,
    };
    this._animatedValue = new Animated.Value(1);
  }

  componentDidUpdate(prevProps: LibWebviewProps, prevState: LibWebviewState): void {
    if (this.props.source !== undefined && prevProps.source.html !== this.props.source.html) {
      this.setState({
        source: (this.props.source && this.props.source.hasOwnProperty('html'))
          ?
          { html: config.webviewOpen + this.props.source.html + config.webviewClose }
          :
          this.props.source
      });
      this.WebViewResetHeightFunctionJSInsert();
    }
  }

  gotoShow(): void {
    if (this.props.needAnimate) this._animatedValue.setValue(0);
    Animated.timing(this._animatedValue, {
      toValue: 1,
      duration: this.props.AnimationDuration
    }).start();
  }

  //insert ResizeHeight JS
  WebViewResetHeightFunctionJSInsert(): void {
    let jsstr = `
        window.location.hash = 1;
        window.postMessage("height:"+document.body.scrollHeight.toString());`;

    setTimeout(() => {
      this.webview && this.webview.injectJavaScript(jsstr);
    }, 500);
  }

  getMessageFromWebView(event: any): void {
    let message = event.nativeEvent.data;
    if (message.indexOf('height') === 0) {
      if (this.heightMessage === undefined || this.heightMessage === null || this.heightMessage === "") {
        this.heightMessage = message;
        if (this.props.needAutoResetHeight) {
          this.resetHeight();
        }
      }
    } else if (this.props.onMessage !== undefined) {
      this.props.onMessage(event);
    }
  }

  resetHeight(): void {
    if (this.heightMessage === undefined || this.heightMessage === null || this.heightMessage === "") {
      return;
    }
    let message = this.heightMessage;
    let height = message.substr(7);
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

  render(): any {
    const patchPostMessageJsCode = `
        (${String(function () {
      var originalPostMessage = window.postMessage
      var patchedPostMessage = function (message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer)
      }
      patchedPostMessage = function () {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
      }
      window.postMessage = patchedPostMessage
    })})();
    `;

    let { bounces, onLoadEnd, style, scrollEnabled, automaticallyAdjustContentInsets, scalesPageToFit, onMessage, ...otherprops } = this.props;
    return (
      <Animated.View style={{ height: this.state.height, opacity: this._animatedValue }}>
        <WebView
          {...otherprops}
          ref={(e: any) => this.webview = e}
          source={this.state.source}
          bounces={bounces !== undefined ? bounces : true}
          javaScriptEnabled
          injectedJavaScript={patchPostMessageJsCode}
          onLoadEnd={() => {
            this.WebViewResetHeightFunctionJSInsert();
            this.props.onFinishLoad !== undefined
              ?
              setTimeout(() => {
                this.props.onFinishLoad()
              }, 1000)
              :
              null;
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