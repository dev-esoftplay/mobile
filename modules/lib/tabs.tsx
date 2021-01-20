import React from 'react';
import { View, ScrollView } from 'react-native';
import { LibComponent, LibStyle } from 'esoftplay';

export interface LibTabsProps {
  tabIndex: number,
  onChangeTab?: (index: number) => void,
  defaultIndex?: number,
  swipeEnabled?: boolean,
  tabViews: any[]
  tabProps?: any[]
}
export interface LibTabsState {
  forceUpdate: number
}

export default class m extends LibComponent<LibTabsProps, LibTabsState> {

  length = React.Children.toArray(this.props.children).length
  scrollRef = React.createRef<ScrollView>()
  allIds = [this.props.defaultIndex || 0]

  constructor(props: LibTabsProps) {
    super(props);
    this.state = { forceUpdate: 0 }
    this.changePage = this.changePage.bind(this);
  }

  componentDidUpdate(prevProps: LibTabsProps, prevState: LibTabsState): void {
    if (this.props.tabIndex != prevProps.tabIndex) {
      if (!this.allIds.includes(this.props.tabIndex)) {
        this.allIds.push(this.props.tabIndex)
        this.setState({ forceUpdate: this.state.forceUpdate + 1 })
      }
      this?.scrollRef?.current?.scrollTo?.({ x: LibStyle.width * this.props.tabIndex, animated: false })
    }
  }

  changePage(e): void {
    let page = 0
    const offsetx = e.nativeEvent.contentOffset.x
    if (offsetx > 0) {
      page = parseInt(Math.round(offsetx / LibStyle.width).toFixed(0))
      this.allIds.push(page)
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