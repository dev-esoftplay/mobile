
// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import React from 'react';
import {
  Dimensions,
  Platform, ScrollView, StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';

export interface LibScrollpickerProps {
  itemHeight: number;
  wrapperHeight: number;
  selectedIndex: number;
  style?: ViewStyle;
  highlightColor: string;
  wrapperColor: string;
  renderItem: (item: any, index: number, isSelected: boolean) => any;
  onValueChange: (value: any, index: number) => void;
  dataSource: any[];
}
export interface LibScrollpickerState {
  selectedIndex: number;
}


const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/scrollpicker.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibScrollpickerProps, LibScrollpickerState> {
  itemHeight = 30;
  wrapperHeight = this.itemHeight * 5;
  timer: any;
  sview: any = React.createRef<ScrollView>();
  isScrollTo = false;
  dragStarted = false;
  momentumStarted = false;

  constructor(props: LibScrollpickerProps) {
    super(props);
    this.itemHeight = this.props.itemHeight || 30;
    this.wrapperHeight = this.props.wrapperHeight || (this.props.style ? this.props.style.height : 0) || this.itemHeight * 5;
    this.state = {
      selectedIndex: this.props.selectedIndex || 0
    };
  }

  componentDidMount() {
    super.componentDidMount()
    if (this.props.selectedIndex) {
     const timer = setTimeout(() => {
        this.scrollToIndex(this.props.selectedIndex);
        clearTimeout(timer)
      }, 0);
    }
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  render() {
    let { header, footer } = this._renderPlaceHolder();
    let highlightWidth = (this.props.style ? this.props.style.width : 0) || deviceWidth;
    let highlightColor = this.props.highlightColor || '#333';
    let wrapperStyle: any = {
      height: this.wrapperHeight,
      flex: 1,
      backgroundColor: this.props.wrapperColor || '#fafafa',
      overflow: 'hidden',
    };

    let highlightStyle: any = {
      position: 'absolute',
      top: (this.wrapperHeight - this.itemHeight) / 2,
      height: this.itemHeight,
      width: highlightWidth,
      borderTopColor: highlightColor,
      borderBottomColor: highlightColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
    };

    return (
      <View style={wrapperStyle}>
        <View style={highlightStyle}></View>
        <ScrollView
          ref={(sview) => { this.sview = sview; }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          onMomentumScrollBegin={this._onMomentumScrollBegin.bind(this)}
          onMomentumScrollEnd={this._onMomentumScrollEnd.bind(this)}
          onScrollBeginDrag={this._onScrollBeginDrag.bind(this)}
          onScrollEndDrag={this._onScrollEndDrag.bind(this)}
        >
          {header}
          {this.props.dataSource.map(this._renderItem.bind(this))}
          {footer}
        </ScrollView>
      </View>
    )
  }

  _renderPlaceHolder() {
    let h = (this.wrapperHeight - this.itemHeight) / 2;
    let header = <View style={{ height: h, flex: 1, }}></View>;
    let footer = <View style={{ height: h, flex: 1, }}></View>;
    return { header, footer };
  }

  _renderItem(data: any, index: number) {
    let isSelected = index === this.state.selectedIndex;
    let item = <Text style={isSelected ? [styles.itemText, styles.itemTextSelected] : styles.itemText}>{data}</Text>;

    if (this.props.renderItem) {
      item = this.props.renderItem(data, index, isSelected);
    }

    return (
      <View style={[styles.itemWrapper, { height: this.itemHeight }]} key={index}>
        {item}
      </View>
    );
  }
  _scrollFix(e: any, t?: string) {
    let y = 0;
    let h = this.itemHeight;
    if (e.nativeEvent.contentOffset) {
      y = e.nativeEvent.contentOffset.y;
    }
    let selectedIndex = Math.round(y / h);
    let _y = selectedIndex * h;
    if (_y !== y) {
      // using scrollTo in ios, onMomentumScrollEnd will be invoked
      if (Platform.OS === 'ios') {
        this.isScrollTo = true;
      }
      this.sview.scrollTo({ y: _y });
    }
    if (this.state.selectedIndex === selectedIndex) {
      return;
    }
    // onValueChange
    if (this.props.onValueChange) {
      let selectedValue = this.props.dataSource[selectedIndex];
      this.setState({
        selectedIndex: selectedIndex,
      });
      this.props.onValueChange(selectedValue, selectedIndex);
    }
  }
  _onScrollBeginDrag() {
    this.dragStarted = true;
    if (Platform.OS === 'ios') {
      this.isScrollTo = false;
    }
    this.timer && clearTimeout(this.timer);
  }
  _onScrollEndDrag(e: any) {
    this.dragStarted = false;
    // if not used, event will be garbaged
    let _e = {
      nativeEvent: {
        contentOffset: {
          y: e.nativeEvent.contentOffset.y,
        },
      },
    };
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(
      () => {
        if (!this.momentumStarted && !this.dragStarted) {
          this._scrollFix(_e, 'timeout');
        }
      },
      10
    );
  }
  _onMomentumScrollBegin(e: any) {
    this.momentumStarted = true;
    this.timer && clearTimeout(this.timer);
  }
  _onMomentumScrollEnd(e: any) {
    this.momentumStarted = false;
    if (!this.isScrollTo && !this.momentumStarted && !this.dragStarted) {
      this._scrollFix(e);
    }
  }

  scrollToIndex(ind: number) {
    this.setState({
      selectedIndex: ind,
    });
    let y = this.itemHeight * ind;
    this.sview.scrollTo({ y: y });
  }

  getSelected() {
    let selectedIndex = this.state.selectedIndex;
    let selectedValue = this.props.dataSource[selectedIndex];
    return selectedValue;
  }
}



let styles = StyleSheet.create({
  itemWrapper: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: '#999',
  },
  itemTextSelected: {
    color: '#333',
  },
});
