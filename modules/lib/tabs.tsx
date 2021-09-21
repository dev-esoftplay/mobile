import React from 'react';
import { View, ScrollView } from 'react-native';
import { LibComponent, LibStyle, LibUtils } from 'esoftplay';
import { fastFilter } from '../../fast';

export interface LibTabsProps {
  tabIndex: number,
  onChangeTab?: (index: number) => void,
  defaultIndex?: number,
  swipeEnabled?: boolean,
  tabViews: any[]
  tabProps?: any[]
  tabOffset?: number,
  lazyTabOffset?: boolean
}
export interface LibTabsState {
  forceUpdate: number
}


export default class m extends LibComponent<LibTabsProps, LibTabsState> {

  length = React.Children.toArray(this.props.children).length
  scrollRef = React.createRef<ScrollView>()
  allIds = []

  constructor(props: LibTabsProps) {
    super(props);
    this.state = { forceUpdate: 0 }
    let page = this.props.defaultIndex || 0
    let pageOffset = props.tabOffset ? props.tabOffset : 1
    this.buildAllIds = this.buildAllIds.bind(this);
    this.changePage = this.changePage.bind(this);
    this.arrayOfLimit = this.arrayOfLimit.bind(this);
    this.buildAllIds(page, pageOffset)
  }

  arrayOfLimit(page: number, pageOffset: number): any[] {
    let limitBottom = page - pageOffset
    let limitTop = page + pageOffset + 1
    let arr = []
    for (let i = limitBottom; i < limitTop; i++) {
      arr.push(i)
    }
    return arr
  }

  buildAllIds(page: number, pageOffset: number) {
    if (this.props.lazyTabOffset) {
      this.allIds.push(page)
      this.allIds = fastFilter(this.allIds, (val) => this.arrayOfLimit(page, pageOffset).includes(val))
    }
    else {
      this.allIds = this.arrayOfLimit(page, pageOffset)
    }
    this.allIds = LibUtils.uniqueArray(this.allIds)
  }

  componentDidUpdate(prevProps: LibTabsProps, prevState: LibTabsState): void {
    if (this.props.tabIndex != prevProps.tabIndex) {
      if (!this.allIds.includes(this.props.tabIndex)) {
        let pageOffset = this.props.tabOffset ? this.props.tabOffset : 1
        this.buildAllIds(this.props.tabIndex, pageOffset)
        this.setState({ forceUpdate: this.state.forceUpdate + 1 })
      }
      this?.scrollRef?.current?.scrollTo?.({ x: LibStyle.width * this.props.tabIndex, animated: false })
    }
  }

  changePage(e: any): void {
    let page = 0
    const offsetx = e.nativeEvent.contentOffset.x
    if (offsetx > 0) {
      page = parseInt(Math.round(offsetx / LibStyle.width).toFixed(0))
      let pageOffset = this.props.tabOffset ? this.props.tabOffset : 1
      this.buildAllIds(page, pageOffset)
      this.setState({ forceUpdate: this.state.forceUpdate + 1 })
    }
    this?.props?.onChangeTab?.(page)
  }

  render(): any {
    return (
      <ScrollView
        ref={this.scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!!this.props.swipeEnabled}
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={this.changePage}
        pagingEnabled
        style={{ flex: 1 }} >
        {
          this.props.tabViews.map((Child: any, index: number) => (
            <View key={index} style={{ flex: 1, width: LibStyle.width }} >
              {this.allIds.includes(index) && <Child {...this.props?.tabProps?.[index]} />}
            </View>
          ))
        }
      </ScrollView>
    )
  }
}