//

import React from "react"
import { View, FlatList } from "react-native";
import { LibComponent } from "esoftplay";

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
  defaultHeight?: number,
  bounces?: boolean,
  style?: any,
  staticHeight?: number,
  ItemSeparatorComponent?: any,
  ListEmptyComponent?: any,
  ListFooterComponent?: any,
  ListHeaderComponent?: any,
  columnWrapperStyle?: any,
  onScroll?: (e: any) => void,
  scrollEventThrottle?: number,
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled",
  children?: any[],
  extraData?: any,
  pagingEnabled?: boolean,
  horizontal?: boolean,
  initialNumToRender?: number,
  initialScrollIndex?: number,
  keyExtractor?: (item: any, index: number) => string,
  legacyImplementation?: boolean,
  numColumns?: number,
  onEndReached?: (() => void) | null,
  onEndReachedThreshold?: number | null,
  onRefresh?: (() => void) | null,
  refreshing?: boolean | null,
  viewabilityConfig?: any,
  removeClippedSubviews?: boolean,
}

export interface LibScrollState {
  width: number,
  data: any
}

export default class escroll extends LibComponent<LibScrollProps, LibScrollState> {

  flatscroll = React.createRef<FlatList<View>>();
  constructor(props: LibScrollProps) {
    super(props);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.scrollToIndex = this.scrollToIndex.bind(this);
    this.keyExtractor = this.keyExtractor.bind(this);
  }

  rowRenderer({ item, index }): any {
    return item
  }

  keyExtractor(item: any, index: number): string {
    return index.toString()
  }

  scrollToIndex(x: number, anim?: boolean, viewOffset?: number, viewPosition?: number): void {
    if (!anim) anim = true;
    this.flatscroll.current!.scrollToIndex({ index: x, animated: anim, viewOffset: viewOffset, viewPosition: viewPosition })
  }


  render(): any {
    return (
      <View style={[{ flex: 1 }]} >
        <FlatList
          ref={this.flatscroll}
          data={this.props.children}
          refreshing={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={this.keyExtractor}
          {...this.props}
          renderItem={this.rowRenderer}
        />
      </View>
    )
  }
}
