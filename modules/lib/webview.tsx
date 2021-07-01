/*  */

import React from "react";
import { Animated, Dimensions, Platform, Linking } from "react-native";
import { WebView } from 'react-native-webview'
import { esp, LibComponent } from "esoftplay";
let { width } = Dimensions.get("window");
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
  maxWidth?: number,
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
  source: any,
  isFinish: boolean
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
      isFinish: false,
      source: props.source && props.source.hasOwnProperty("html") ? { html: config.webviewOpen + props.source.html + config.webviewClose } : props.source,
    };
    this._animatedValue = new Animated.Value(1);
    this.gotoShow = this.gotoShow.bind(this)
    this.webview = React.createRef()
    this.getMessageFromWebView = this.getMessageFromWebView.bind(this)
    this.resetHeight = this.resetHeight.bind(this)
    this.resetSmallHeight = this.resetSmallHeight.bind(this)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return { source: nextProps.source }
  }

  gotoShow(): void {
    if (this.props.needAnimate) this._animatedValue.setValue(0);
    Animated.timing(this._animatedValue, {
      toValue: 1,
      duration: this.props.AnimationDuration,
      useNativeDriver: true
    }).start();
  }

  getMessageFromWebView(event: any): void {
    let message = event.nativeEvent.data;
    const wbHeight = message.split('-')[1]
    const wbWidth = message.split('-')[0]
    let height = wbHeight
    if (this.props.maxWidth) {
      height = this.props.maxWidth * wbHeight / wbWidth
      if (Platform.OS == 'ios')
        height = height - 50
    }
    if (this.heightMessage === undefined || this.heightMessage === null || this.heightMessage === "") {
      this.heightMessage = height;
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
          // androidHardwareAccelerationDisabled={true}
          onNavigationStateChange={(event) => {
            if (this.state.isFinish) {
              this.webview.stopLoading();
              Linking.openURL(event.url);
            }
          }}
          injectedJavaScript={'window.ReactNativeWebView.postMessage(document.body.scrollWidth+"-"+document.body.scrollHeight)'}
          onLoadEnd={() => {
            if (this.props.onFinishLoad !== undefined)
              setTimeout(() => {
                this.setState({ isFinish: true })
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


