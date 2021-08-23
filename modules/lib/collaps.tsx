import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LibComponent, LibStyle, LibTheme, esp } from 'esoftplay';
const { elevation } = LibStyle;

export interface LibCollapsProps {
  show?: boolean,
  header: (isShow: boolean) => any,
  children: any,
  style?: any
}
export interface LibCollapsState {
  expanded: boolean,
  animation: any,
  maxHeight: number,
  minHeight: number,
}


export default class m extends LibComponent<LibCollapsProps, LibCollapsState> {
  constructor(props: LibCollapsProps) {
    super(props);
    this.state = {
      expanded: !!props.show,
      animation: 10000,
      maxHeight: 0,
      minHeight: 0,
    };
    this.toggle = this.toggle.bind(this)
    this._setMaxHeight = this._setMaxHeight.bind(this)
    this._setMinHeight = this._setMinHeight.bind(this)
    this.initState = this.initState.bind(this)
  }

  initState(): void {
    let height = this.state.expanded ? (this.state.maxHeight + this.state.minHeight) : this.state.minHeight
    this.setState({
      animation: new Animated.Value(height)
    })
  }

  toggle(): void {
    let initialValue = this.state.expanded ? (this.state.maxHeight + this.state.minHeight) : this.state.minHeight;
    let finalValue = this.state.expanded ? this.state.minHeight : (this.state.maxHeight + this.state.minHeight);

    this.setState({
      expanded: !this.state.expanded
    });

    this.state.animation.setValue(initialValue);
    Animated.spring(
      this.state.animation,
      {
        toValue: finalValue,
        useNativeDriver: false
      }
    ).start();
  }

  _setMaxHeight(event: any): void {
    if (this.state.maxHeight == 0) {
      this.setState({ maxHeight: event.nativeEvent.layout.height + 15 }, () => {
        if (this.state.minHeight > 0 && this.state.maxHeight > 0) {
          this.initState()
        }
      })
    };
  }

  _setMinHeight(event: any): void {
    if (this.state.minHeight == 0)
      this.setState(
        {
          minHeight: event.nativeEvent.layout.height,
        }, () => {
          if (this.state.minHeight > 0 && this.state.maxHeight > 0) {
            this.initState()
          }
        })
  }

  render(): any {
    return (
      <Animated.View
        style={[{ overflow: 'hidden', backgroundColor: LibTheme._colorBackgroundCardPrimary(), marginBottom: 1, height: this.state.animation, opacity: this.state.animation == 10000 ? 0 : 1 }, this.props.style ? StyleSheet.flatten(this.props.style) : {}, elevation(0)]} >
        <TouchableOpacity onPress={this.toggle} >
          <View onLayout={this._setMinHeight} >
            {this.props.header(this.state.expanded)}
          </View>
        </TouchableOpacity>
        <View onLayout={this._setMaxHeight}>
          {this.props.children}
        </View>
      </Animated.View>
    );
  }
}