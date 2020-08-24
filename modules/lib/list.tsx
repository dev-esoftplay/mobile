//
import React from "react"
import { Dimensions, View, FlatList } from 'react-native';
import { LibComponent } from "esoftplay";

export interface LibListItemLayout {
  length: number,
  offset: number,
  index: number
}

export interface LibListProps {
  bounces?: boolean,
  staticHeight?: number,
  ItemSeparatorComponent?: any,
  ListEmptyComponent?: any,
  ListFooterComponent?: any,
  ListHeaderComponent?: any,
  columnWrapperStyle?: any,
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled",
  data: any[],
  pagingEnabled?: boolean,
  extraData?: any,
  getItemLayout?: (data: any, index: number) => LibListItemLayout,
  horizontal?: boolean,
  initialNumToRender?: number,
  initialScrollIndex?: number,
  keyExtractor?: (item: any, index: number) => string,
  legacyImplementation?: boolean,
  numColumns?: number,
  onScroll?: (e: any) => void,
  scrollEventThrottle?: number,
  onEndReached?: (() => void) | null,
  onEndReachedThreshold?: number | null,
  onRefresh?: (() => void) | null,
  refreshing?: boolean | null,
  renderFooter?: () => any,
  renderItem: (item: any, index: number) => any,
  viewabilityConfig?: any,
  style?: any,
  removeClippedSubviews?: boolean,
}

export interface LibListState {
}

export default class EList extends LibComponent<LibListProps, LibListState> {

  view: any = React.createRef()
  flatlist = React.createRef<FlatList<View>>()
  constructor(props: LibListProps) {
    super(props);
    this.scrollToIndex = this.scrollToIndex.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.keyExtractor = this.keyExtractor.bind(this);
  }

  scrollToIndex(x: number, anim?: boolean, viewOffset?: number, viewPosition?: number): void {
    if (!anim) anim = true;
    this.flatlist.current!.scrollToIndex({ index: x, animated: anim, viewOffset: viewOffset, viewPosition: viewPosition })
  }

  rowRenderer({ item, index }): any {
    return this.props.renderItem(item, index)
  }

  keyExtractor(item: any, index: number): string {
    return item.hasOwnProperty('id') && item.id || index.toString()
  }

  render(): any {
    const isStatic = () => {
      if (this.props.staticHeight)
        return { getItemLayout: (data, index) => this.props.staticHeight ? ({ length: this.props.staticHeight, offset: this.props.staticHeight, index: index }) : undefined }
    }
    return (
      <View ref={(e) => this.view = e} style={[{ flex: 1 }]} >
        <FlatList
          ref={this.flatlist}
          data={this.props.data}
          keyExtractor={this.keyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          nestedScrollEnabled
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          {...this.props}
          ListFooterComponent={this.props.renderFooter && this.props.renderFooter() || this.props.ListFooterComponent }
          {...isStatic()}
          renderItem={this.rowRenderer}
        />
      </View>
    )
  }
}