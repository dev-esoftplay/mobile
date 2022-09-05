// noPage

import { LibComponent, LibCurl, LibLoading, LibScroll, LibTextstyle } from 'esoftplay';
import React from 'react';
import { View } from 'react-native';

export interface LibRollProps {
  url: string,
  renderData: (data: any) => any,
  onDataChange?: (data: any) => void,
  post?: any,
  msg?: string,
  defaultHeight?: number,
  bounces?: boolean,
  staticHeight?: number,
  ItemSeparatorComponent?: any,
  ListEmptyComponent?: any,
  ListFooterComponent?: any,
  ListHeaderComponent?: any,
  columnWrapperStyle?: any,
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled",
  children?: any[],
  pagingEnabled?: boolean,
  stickyHeaderIndices?: number[],
  extraData?: any,
  onScroll?: (e: any) => void,
  scrollEventThrottle?: number,
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
  style?: any
}

export interface LibRollState {
  data: any,
  msg: string
}

export default class libroll extends LibComponent<LibRollProps, LibRollState>{

  constructor(props: LibRollProps) {
    super(props);
    this.state = {
      data: undefined,
      msg: ''
    }
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount(): void {
    super.componentDidMount()
    this.loadData()
  }

  loadData(): void {
    const { url, post, msg } = this.props
    this.setState({ data: undefined, msg: '' }, () => {
      if (url)
        new LibCurl(url, post,
          (res, msg) => {
            this.setState({ data: res }, () => {
              if (this.props.onDataChange) {
                this.props.onDataChange(res)
              }
            })
          },
          (_msg) => {
            this.setState({ msg: _msg.message })
          }
        )
      else
        this.setState({ msg: msg ? msg : "Failed to access" })
    })
  }

  render(): any {
    const { data, msg } = this.state
    const { renderData } = this.props
    return (
      <View style={{ flex: 1 }} >
        {
          msg != '' ?
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
              <LibTextstyle text={msg} textStyle="body" style={{ textAlign: 'center' }} />
            </View>
            :
            !data || data.length == 0 ?
              <LibLoading />
              :
              <LibScroll
                onRefresh={() => this.loadData()}
                {...this.props}>
                {renderData(data)}
              </LibScroll>
        }
      </View>
    )
  }
}