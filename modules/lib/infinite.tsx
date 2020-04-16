import React from 'react';
import { View, FlatList } from 'react-native';
import { LibComponent, LibLoading, LibCurl, LibTextstyle, esp, LibListItemLayout, LibStyle } from 'esoftplay';

export interface LibInfiniteProps {
  url: string,
  post?: any,
  initialData?: any[],
  onDataChange?: (data: any, page: number) => void
  error?: string,
  errorView?: ((msg: string) => any) | any,
  mainIndex?: string,
  bounces?: boolean,
  staticHeight?: number,
  ItemSeparatorComponent?: any,
  ListEmptyComponent?: any,
  ListFooterComponent?: any,
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
  onRefresh?: (() => void) | null,
  refreshing?: boolean | null,
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
          const update = () => {
            this.props.onDataChange && this.props.onDataChange(this.state.data, this.page)
          }
          let mainIndex: any = this.props.mainIndex && res[this.props.mainIndex] || res
          if (mainIndex.list.length == 0 || res.list == '') {
            this.page = page
            this.isStop = true
            this.setState((state: LibInfiniteState, props: LibInfiniteProps) => {
              return {
                error: this.props.error || 'Belum ada data',
                data: page == 0 ? [] : state.data,
              }
            }, update)
          } else {
            this.page = page
            this.isStop = ([...this.state.data, ...mainIndex.list].length >= parseInt(mainIndex.total) || (this.page >= (mainIndex.pages || mainIndex.total_pages) - 1))
            this.setState((state: LibInfiniteState, props: LibInfiniteProps) => {
              const latestData = [...state.data, ...mainIndex.list]
              return {
                data: page == 0 ? mainIndex.list : latestData,
              }
            }, update)
          }
        },
        (msg) => {
          this.page = page
          this.isStop = true
          this.setState({
            error: msg,
          })
        }
      )
    }
  }

  componentDidUpdate(prevProps: LibInfiniteProps, prevState: LibInfiniteState): void {
    if (this.props.initialData != undefined && prevProps.initialData != this.props.initialData && this.props.initialData.length != 0 && this.state.data.length == 0) {
      this.setState({ data: this.props.initialData })
    }
  }

  _renderItem({ item, index }: any): any {
    return this.props.renderItem(item, index)
  }

  _keyExtractor(item: any, index: number): string {
    return item.hasOwnProperty('id') && item.id || index.toString()
  }

  render(): any {
    const { data, error } = this.state
    const { errorView } = this.props
    return (
      <View style={{ flex: 1 }} >
        {
          (!data || data.length) == 0 && !this.isStop ?
            <LibLoading />
            :
            <FlatList
              data={data}
              onRefresh={() => this.loadData()}
              refreshing={false}
              keyExtractor={this._keyExtractor}
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
                (!this.isStop) ? <View style={{ padding: 20 }} ><LibLoading /></View> : <View style={{ height: 50 }} />
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
