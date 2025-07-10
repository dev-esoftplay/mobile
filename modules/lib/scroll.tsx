// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import React from "react";
import { RefreshControl, ScrollView, View, ViewStyle } from "react-native";

/*
Using ScrollView

import { ScrollView } from "react-native"

<ScrollView>
  //scrollable item
  //scrollable item
  //scrollable item
  //scrollable item
</ScrollView>

Using this class for lazy load

var Escroll = esp.mod("lib/scroll")

<Escroll>
  //scrollable item
  //scrollable item
  //scrollable item
  //scrollable item
</Escroll>
*/

export interface LibScrollProps {
  bounces?: boolean,
  style?: ViewStyle,
  ItemSeparatorComponent?: any,
  onScroll?: (e: any) => void,
  scrollEventThrottle?: number,
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled",
  children?: any[],
  stickyHeaderIndices?: number[],
  pagingEnabled?: boolean,
  horizontal?: boolean,
  initialNumToRender?: number,
  initialScrollIndex?: number,
  keyExtractor?: (item: any, index: number) => string,
  numColumns?: number,
  onRefresh?: (() => void) | null,
  refreshing?: boolean | null,
}

export interface LibScrollState {
  width: number,
  data: any
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/scroll.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibScrollProps, LibScrollState> {

  flatscroll = React.createRef<ScrollView>();
  idxNumber = []
  constructor(props: LibScrollProps) {
    super(props);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.scrollToIndex = this.scrollToIndex.bind(this);
  }

  rowRenderer(item: any, index: number): any {
    return (
      <View key={index.toString()} onLayout={(e) => {
        this.idxNumber[index] = this.props.horizontal ? e.nativeEvent.layout.x : e.nativeEvent.layout.y
      }} >
        {item}
      </View>
    )
  }

  scrollToIndex(x: number, anim?: boolean): void {
    if (anim == undefined) anim = true;
    this.flatscroll.current?.scrollTo({
      x: this.props.horizontal ? this.idxNumber[x] : 0,
      y: !this.props.horizontal ? this.idxNumber[x] : 0,
      animated: anim
    })
  }


  render(): any {
    return (
      <View style={[{ flex: 1 }]} >
        <ScrollView
          ref={this.flatscroll}
          scrollEventThrottle={64}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          {...this.props}
          refreshControl={this.props.onRefresh && <RefreshControl onRefresh={this.props.onRefresh} refreshing={false} />} >
          {
            React.Children.toArray(this.props.children).map(this.rowRenderer)
          }
        </ScrollView>
      </View>
    )
  }
}
