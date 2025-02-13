// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibKeyboard_avoid } from 'esoftplay/cache/lib/keyboard_avoid/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';

import React from 'react';
import { Animated, BackHandler, Keyboard, TouchableOpacity, View } from 'react-native';

export interface LibSlidingupProps {
  onChangeShow?: (isShow: boolean) => void,
  children?: any
}
export interface LibSlidingupState {
  show: boolean,
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/slidingup.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibSlidingupProps, LibSlidingupState> {

  _show: boolean = false
  animValue: any = new Animated.Value(LibStyle.height)
  constructor(props: LibSlidingupProps) {
    super(props);
    this.state = {
      show: false,
    }
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/slidingup.md#handleBack) untuk melihat dokumentasi*/
  handleBack(): boolean {
    this.hide()
    return true
  }

  componentDidUpdate(prevProps: LibSlidingupProps, prevState: LibSlidingupState): void {
    if (prevState.show == false && this.state.show == true) {
      BackHandler.addEventListener("hardwareBackPress", this.handleBack)
      this.props?.onChangeShow?.(this.state.show)
    } else if (prevState.show == true && this.state.show == false) {
      BackHandler.removeEventListener("hardwareBackPress", this.handleBack)
      this.props?.onChangeShow?.(this.state.show)
    }
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/slidingup.md#show) untuk melihat dokumentasi*/
  show(): void {
    Keyboard.dismiss()
    if (this.props.children) {
      this.setState({ show: true }, () => {
        const timer = setTimeout(() => {
          this._toggleSubview(true)
          clearTimeout(timer)
        }, 1);
      })
    }
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/slidingup.md#hide) untuk melihat dokumentasi*/
  hide(): void {
    this._toggleSubview(false).then(() => {
      this.setState({ show: false })
    })
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/slidingup.md#_toggleSubview) untuk melihat dokumentasi*/
  _toggleSubview(isOpen: boolean): Promise<void> {
    return new Promise((r) => {
      var toValue = LibStyle.height;
      if (isOpen) {
        toValue = 0;
      }
      Animated.timing(
        this.animValue,
        {
          toValue: toValue,
          duration: 200,
          useNativeDriver: true
        }
      ).start(() => {
        r()
      })
    })
  }

  render(): any {
    const { show } = this.state
    if (!show) return null
    return (
      <LibKeyboard_avoid style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => this.hide()} />
          <Animated.View style={{ transform: [{ translateY: this.animValue }] }} >
            {this.props.children}
            {/* <View style={{ paddingBottom: LibStyle.isIphoneX ? 30 : 0, backgroundColor: 'white' }} /> */}
          </Animated.View>
        </View>
      </LibKeyboard_avoid>
    )
  }
}