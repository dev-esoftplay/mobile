// noPage

import { esp, LibComponent, LibCurl, LibListItemLayout, LibLoading, LibStyle, LibTextstyle } from 'esoftplay';
import React from 'react';
import isEqual from 'react-fast-compare';
import { FlatList, View } from 'react-native';


export interface LibInfiniteProps {
  url: string,
  post?: any,
  isDebug?: 0 | 1,
  initialData?: any[],
  injectData?: any,
  onDataChange?: (data: any, page: number) => void
  onResult?: (res: any, uri: string) => void,
  filterData?: (item: any, index: number, array: any[]) => boolean,
  error?: string,
  LoadingView?: any,
  errorView?: ((msg: string) => any) | any,
  mainIndex?: string,
  stickyHeaderIndices?: number[],
  bounces?: boolean,
  staticHeight?: number,
  ItemSeparatorComponent?: any,
  ListEmptyComponent?: any,
  ListFooterComponent?: any,
  ListEndedComponent?: any,
  ListHeaderComponent?: any,
  columnWrapperStyle?: any,
  onScroll?: (e: any) => void,
  scrollEventThrottle?: number,
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled",
  extraData?: any,
  getItemLayout?: (data: any, index: number) => LibListItemLayout,
  horizontal?: boolean,
  initialNumToRender?: number,
  initialScrollIndex?: number,
  keyExtractor?: (item: any, index: number) => string,
  legacyImplementation?: boolean,
  numColumns?: number,
  onEndReached?: (() => void) | null,
  onEndReachedThreshold?: number | null,
  pagingEnabled?: boolean,
  refreshEnabled?: boolean,
  renderFooter?: () => any,
  renderItem: (item: any, index: number) => any,
  viewabilityConfig?: any,
  removeClippedSubviews?: boolean,
  style?: any
}

export interface LibInfiniteState {
  data: any[],
  error: string
}

export default class m extends LibComponent<LibInfiniteProps, LibInfiniteState>{

  isStop: boolean = false
  page: number = 0
  pages: number[]
  flatlist = React.createRef<FlatList<View>>()

  constructor(props: LibInfiniteProps) {
    super(props);
    this.state = {
      data: [],
      error: ''
    }
    this.pages = []
    this.loadData = this.loadData.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this._keyExtractor = this._keyExtractor.bind(this);
    this.scrollToIndex = this.scrollToIndex.bind(this);
  }

  componentDidMount(): void {
    super.componentDidMount()
    this.loadData()
  }

  loadData(page?: number): void {
    if (page == undefined) {
      this.setState((state: LibInfiniteState, props: LibInfiniteProps) => {
        return {
          isStop: false,
          error: '',
          data: []
        }
      })
      page = 0
      this.pages = []
    }
    var { url, post } = this.props
    if (page > 0) {
      url += url.includes('?') ? '&' : '?'
      url += 'page=' + page
    }
    if (!this.pages.includes(page)) {
      this.pages.push(page)
      new LibCurl(url, post,
        (res, msg) => {
          if (this.props.isDebug) {
            esp.log(res);
          }
          this.props.onResult && this.props.onResult(res, url)
          const update = () => {
            this.props.onDataChange && this.props.onDataChange(this.state.data || [], this.page)
          }
          let mainIndex: any = this.props.mainIndex && res[this.props.mainIndex] || res
          if (mainIndex.list.length == 0 || res.list == '') {
            this.page = page
            this.isStop = true
            this.setState((state: LibInfiniteState, props: LibInfiniteProps) => {
              return {
                error: this.props.error || 'Belum ada data',
                data: page == 0
                  ? []
                  : (typeof this.props?.filterData == 'function' ? state.data.filter(this.props.filterData) : state.data),
              }
            }, update)
          } else {
            this.page = page
            this.isStop = ([...this.state.data, ...mainIndex.list].length >= parseInt(mainIndex.total) || (this.page >= (mainIndex.pages || mainIndex.total_page) - 1))
            this.setState((state: LibInfiniteState, props: LibInfiniteProps) => {
              const latestData = [...state.data, ...mainIndex.list]
              return {
                data: page == 0
                  ? (typeof this.props?.filterData == 'function' ? mainIndex.list.filter(this.props.filterData) : mainIndex.list)
                  : (typeof this.props?.filterData == 'function' ? latestData.filter(this.props.filterData) : latestData),
              }
            }, update)
          }
        },
        (msg) => {
          if (this.props.isDebug) {
            esp.log(msg)
          }
          this.page = page
          this.isStop = true
          this.setState({
            error: msg?.message,
          })
        }, this.props.isDebug
      )
    }
  }

  componentDidUpdate(prevProps: LibInfiniteProps, prevState: LibInfiniteState): void {
    if (this.props.initialData != undefined && prevProps.initialData != this.props.initialData && this.props.initialData.length != 0 && this.state.data.length == 0) {
      this.setState({ data: this.props.initialData })
    }
    if (this.props.injectData !== undefined && !isEqual(this.props.injectData, this.state.data)) {
      this.setState({ data: this.props.injectData })
    }
  }

  _renderItem({ item, index }: any): any {
    return this.props.renderItem(item, index)
  }

  _keyExtractor(item: any, index: number): string {
    return item.hasOwnProperty('id') && item.id || index.toString()
  }

  scrollToIndex(x: number, anim?: boolean, viewOffset?: number, viewPosition?: number): void {
    if (!anim) anim = true;
    this.flatlist.current!.scrollToIndex({ index: x, animated: anim, viewOffset: viewOffset, viewPosition: viewPosition })
  }

  render(): any {
    const { data, error } = this.state
    const { errorView, refreshEnabled } = this.props
    return (
      <View style={{ flex: 1 }} >
        {
          (!data || data.length) == 0 && !this.isStop ?
            this.props.LoadingView || <LibLoading />
            :
            <FlatList
              ref={this.flatlist}
              data={data || []}
              onRefresh={((refreshEnabled == undefined) || refreshEnabled) && (() => this.loadData())}
              refreshing={false}
              keyExtractor={this._keyExtractor}
              nestedScrollEnabled
              ListEmptyComponent={
                errorView
                  ? typeof errorView == 'function'
                    ? errorView(error)
                    : errorView
                  :
                  <View style={{ flex: 1, marginTop: LibStyle.height * 0.3, justifyContent: 'center', alignItems: 'center' }} >
                    <LibTextstyle text={error} textStyle="body" style={{ textAlign: 'center' }} />
                  </View>
              }
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={10}
              ListFooterComponent={
                (!this.isStop) ? <View style={{ padding: 20 }} ><LibLoading /></View> : (this.props?.ListEndedComponent || <View style={{ height: 50 }} />)
              }
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (!this.isStop) {
                  this.loadData(this.page + 1)
                }
              }}
              {...this.props}
              renderItem={this._renderItem}
            />
        }
      </View>
    )
  }
}
