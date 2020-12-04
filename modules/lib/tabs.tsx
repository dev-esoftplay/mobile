import React from 'react';
import { View, ScrollView } from 'react-native';
import { LibComponent, LibStyle } from 'esoftplay';

export interface LibTabsProps {
  tabIndex: number,
  defaultIndex?: number,
  tabViews: any[]
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

  render(): any {
    return (
      <ScrollView
        ref={this.scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        pagingEnabled
        style={{ flex: 1 }} >
        {
          this.props.tabViews.map((Child: any, index: number) => (
            <View key={index} style={{ flex: 1, width: LibStyle.width }} >
              {this.allIds.includes(index) && <Child />}
            </View>
          ))
        }
      </ScrollView>
    )
  }
}