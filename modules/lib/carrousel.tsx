// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibFocus } from 'esoftplay/cache/lib/focus/import';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface LibCarrouselProps {
  children: any,
  autoplay?: boolean,
  delay?: number,
  currentPage?: number,
  style?: ViewStyle,
  pageStyle?: ViewStyle,
  contentContainerStyle?: ViewStyle,
  pageInfo?: boolean,
  pageInfoBackgroundColor?: string,
  pageInfoTextStyle?: any,
  pageInfoBottomContainerStyle?: ViewStyle,
  pageInfoTextSeparator?: string,
  bullets?: boolean,
  bulletsContainerStyle?: ViewStyle,
  bulletStyle?: ViewStyle,
  arrows?: boolean,
  arrowsContainerStyle?: ViewStyle,
  arrowStyle?: ViewStyle,
  leftArrowStyle?: ViewStyle,
  rightArrowStyle?: ViewStyle,
  leftArrowText?: string,
  rightArrowText?: string,
  chosenBulletStyle?: ViewStyle,
  onAnimateNextPage?: (currentPage: number) => void,
  onPageBeingChanged?: (nextPage: number) => void,
  swipe?: boolean,
  isLooped?: boolean,
}
export interface LibCarrouselState {
  currentPage: number,
  size: any,
  childrenLength: number,
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/carrousel.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibCarrouselProps, LibCarrouselState> {

  static defaultProps = {
    delay: 4000,
    autoplay: true,
    pageInfo: false,
    bullets: false,
    arrows: false,
    pageInfoBackgroundColor: 'rgba(0, 0, 0, 0.25)',
    pageInfoTextSeparator: ' / ',
    currentPage: 0,
    style: undefined,
    pageStyle: undefined,
    contentContainerStyle: undefined,
    pageInfoTextStyle: undefined,
    pageInfoBottomContainerStyle: undefined,
    bulletsContainerStyle: undefined,
    chosenBulletStyle: undefined,
    bulletStyle: undefined,
    arrowsContainerStyle: undefined,
    arrowStyle: undefined,
    leftArrowStyle: undefined,
    rightArrowStyle: undefined,
    leftArrowText: '',
    rightArrowText: '',
    onAnimateNextPage: undefined,
    onPageBeingChanged: undefined,
    swipe: true,
    isLooped: true,
  };

  isBackground: boolean = false
  offset: number = 0;
  timer: any;
  nextPage: number = 0;
  scrollView = React.createRef<ScrollView>()
  constructor(props: LibCarrouselProps) {
    super(props);
    const size = { width: 0, height: 0 };
    if (props.children) {
      const childrenLength = React.Children.count(props.children) || 1;
      this.state = {
        currentPage: props.currentPage || 0,
        size,
        childrenLength,
      };
    } else {
      this.state = { size, currentPage: 0, childrenLength: 0 };
    }
    this._animateNextPage = this._animateNextPage.bind(this);
    this._animatePreviousPage = this._animatePreviousPage.bind(this);
    this._calculateCurrentPage = this._calculateCurrentPage.bind(this);
    this._calculateNextPage = this._calculateNextPage.bind(this);
    this._clearTimer = this._clearTimer.bind(this);
    this._normalizePageNumber = this._normalizePageNumber.bind(this);
    this._onLayout = this._onLayout.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onScrollBegin = this._onScrollBegin.bind(this);
    this._onScrollEnd = this._onScrollEnd.bind(this);
    this._placeCritical = this._placeCritical.bind(this);
    this._renderArrows = this._renderArrows.bind(this);
    this._renderBullets = this._renderBullets.bind(this);
    this._renderPageInfo = this._renderPageInfo.bind(this);
    this._scrollTo = this._scrollTo.bind(this);
    this._setCurrentPage = this._setCurrentPage.bind(this);
    this._setUpPages = this._setUpPages.bind(this);
    this._setUpTimer = this._setUpTimer.bind(this);
    this.animateToPage = this.animateToPage.bind(this);
    this.getCurrentPage = this.getCurrentPage.bind(this);

  }

  componentDidMount(): void {
    super.componentDidMount();
    if (this.state.childrenLength) {
      this._setUpTimer();
    }
  }

  componentDidUpdate(prevProps: LibCarrouselProps, prevState: LibCarrouselState): void {
    const { children } = prevProps
    const childrenLength = React.Children.count(this.props.children) || 1;
    const oldChildrenLength = React.Children.count(children) || 1;
    if (childrenLength != oldChildrenLength) {
      const { currentPage } = this.state;
      this._clearTimer();
      const nextPage = currentPage >= childrenLength ? childrenLength - 1 : currentPage;
      if (React.Children.count(children) != React.Children.count(this.props.children))
        this.setState({ childrenLength }, () => {
          this.animateToPage(nextPage);
          this._setUpTimer();
        });
    }
  }

  componentWillUnmount(): void {
    super.componentWillUnmount()
    this._clearTimer();
  }

  _setUpPages(): any {
    const { size } = this.state;
    const { children: propsChildren, isLooped, pageStyle } = this.props;
    const children = React.Children.toArray(propsChildren);
    const pages: any[] = [];

    if (children && children.length > 1) {
      pages.push(...children);
      if (isLooped) {
        pages.push(children[0]);
        pages.push(children[1]);
      }
    } else if (children) {
      pages.push(children[0]);
    } else {
      pages.push(<View><Text>You are supposed to add children inside Carousel</Text></View>);
    }
    return pages.map((page, i) => (
      <View activeOpacity={1} style={[{ ...size }, pageStyle]} key={`page${i}`}>
        {page}
      </View>
    ));
  }

  getCurrentPage(): number {
    return this.state.currentPage;
  }

  _setCurrentPage(currentPage: number): void {
    this.setState({ currentPage }, () => {
      if (this.props.onAnimateNextPage) {
        this.props.onAnimateNextPage(currentPage);
      }
    });
  }

  _onScrollBegin(): void {
    this._clearTimer();
  }

  _onScrollEnd(event: any): void {
    const offset = { ...event.nativeEvent.contentOffset };
    const page = this._calculateCurrentPage(offset.x);
    this._placeCritical(page);
    this._setCurrentPage(page);
    this._setUpTimer();
  }

  _onScroll(event: any): void {
    const currentOffset = event.nativeEvent.contentOffset.x;
    const direction = currentOffset > this.offset ? 'right' : 'left';
    this.offset = currentOffset;
    const nextPage = this._calculateNextPage(direction);
    if (this.nextPage !== nextPage) {
      this.nextPage = nextPage;
      if (this.props.onPageBeingChanged) {
        this.props.onPageBeingChanged(this.nextPage);
      }
    }
  }

  _onLayout(event: any): void {
    const { height, width } = event.nativeEvent.layout;
    this.setState({ size: { width, height } });

    const timer = setTimeout(() => {
      this._placeCritical(this.state.currentPage)
      clearTimeout(timer)
    }, 0);
  }

  _clearTimer(): void {
    clearTimeout(this.timer);
  }

  _setUpTimer(): void {
    if (this.props.autoplay && !this.isBackground && React.Children.count(this.props.children) > 1) {
      this._clearTimer();
      this.timer = setTimeout(this._animateNextPage, this.props.delay);
    }
  }

  _scrollTo({ offset, animated, nofix }: any): void {
    if (typeof this.scrollView?.current?.scrollTo == 'function') {
      this.scrollView.current?.scrollTo({ y: 0, x: offset, animated });
      if (!nofix && Platform.OS === 'android' && !animated) {
        this.scrollView.current?.scrollTo({ y: 0, x: offset, animated: true });
      }
    }
  }

  _animateNextPage(): void {
    const { currentPage } = this.state;
    const nextPage = this._normalizePageNumber(currentPage + 1);
    if (!this.props.isLooped && nextPage < currentPage) {
      return;
    }
    this.animateToPage(nextPage);
  }

  _animatePreviousPage(): void {
    const { currentPage } = this.state;
    const nextPage = this._normalizePageNumber(currentPage - 1);
    if (!this.props.isLooped && nextPage > currentPage) {
      return;
    }
    this.animateToPage(nextPage);
  }

  animateToPage(page: number): void {
    const { currentPage, childrenLength, size: { width } } = this.state;
    const { isLooped } = this.props;
    const nextPage = this._normalizePageNumber(page);
    this._clearTimer();
    if (nextPage === currentPage) {
    } else if (nextPage === 0) {
      if (isLooped) {
        if (currentPage !== childrenLength - 1) {
          this._scrollTo({
            offset: (childrenLength + 2) * width,
            animated: false,
            nofix: true,
          });
        }
        this._scrollTo({ offset: childrenLength * width, animated: true });
      } else {
        this._scrollTo({ offset: 0, animated: true });
      }
    } else if (nextPage === 1) {
      if (currentPage === 0 && isLooped) {
        this._scrollTo({ offset: 0, animated: false, nofix: true });
      }
      this._scrollTo({ offset: width, animated: true });
    } else {
      if (currentPage === 0 && nextPage !== childrenLength - 1) {
        this._scrollTo({ offset: 0, animated: false, nofix: true });
      }
      this._scrollTo({ offset: nextPage * width, animated: true });
    }
    this._setCurrentPage(nextPage);
    this._setUpTimer();
  }

  _placeCritical(page: number): void {
    const { isLooped } = this.props;
    const { childrenLength, size: { width } } = this.state;
    let offset = 0;
    if (page < childrenLength) {
      if (page === 0 && isLooped) {
        offset = childrenLength * width;
      } else {
        offset = page * width;
      }
    }

    this._scrollTo({ offset, animated: false });
  }

  _normalizePageNumber(page: number): number {
    const { childrenLength } = this.state;
    if (page === childrenLength) {
      return 0;
    } else if (page > childrenLength) {
      return 1;
    } else if (page < 0) {
      return childrenLength - 1;
    }
    return page;
  }

  _calculateCurrentPage(offset: number): number {
    const { width } = this.state.size;
    const page = Math.round(offset / width);
    return this._normalizePageNumber(page);
  }

  _calculateNextPage(direction: string): number {
    const { width } = this.state.size;
    const ratio = this.offset / width;
    const page = direction === 'right' ? Math.ceil(ratio) : Math.floor(ratio);
    return this._normalizePageNumber(page);
  }

  _renderPageInfo(pageLength: number): any {
    return (
      <View style={[styles.pageInfoBottomContainer, this.props.pageInfoBottomContainerStyle]} pointerEvents="none">
        <View style={styles.pageInfoContainer}>
          <View style={[styles.pageInfoPill, { backgroundColor: this.props.pageInfoBackgroundColor }]} >
            <Text style={[styles.pageInfoText, this.props.pageInfoTextStyle]} >
              {`${this.state.currentPage + 1}${this.props.pageInfoTextSeparator}${pageLength}`}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  _renderBullets(pageLength: number): any {
    const bullets: any[] = [];
    for (let i = 0; i < pageLength; i += 1) {
      bullets.push(
        <View activeOpacity={1} onPress={() => this.animateToPage(i)} key={`bullet${i}`}>
          <View
            style={i === this.state.currentPage ?
              [styles.chosenBullet, this.props.chosenBulletStyle] :
              [styles.bullet, this.props.bulletStyle]}
          />
        </View>);
    }
    return (
      <View style={[styles.bullets, this.props.bulletsContainerStyle]} pointerEvents="box-none">
        {bullets}
      </View>
    );
  }

  _renderArrows(childrenLength: number): any {
    let { currentPage } = this.state;
    if (currentPage < 1) {
      currentPage = childrenLength;
    }
    return (
      <View style={styles.arrows} pointerEvents="box-none">
        <View style={[styles.arrowsContainer, this.props.arrowsContainerStyle]} pointerEvents="box-none">
          <View onPress={this._animatePreviousPage} style={this.props.arrowStyle} >
            <Text style={this.props.leftArrowStyle}>
              {this.props.leftArrowText ? this.props.leftArrowText : 'Left'}
            </Text>
          </View>
          <View onPress={this._animateNextPage} style={this.props.arrowStyle} >
            <Text style={this.props.rightArrowStyle}>
              {this.props.rightArrowText ? this.props.rightArrowText : 'Right'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  render(): any {
    const contents = this._setUpPages();
    const containerProps = {
      onLayout: this._onLayout,
      style: [this.props.style],
    };

    const { size, childrenLength } = this.state;

    return (
      <View {...containerProps}>
        <LibFocus onFocus={() => {
          this.isBackground = false;
          this._setUpTimer();
        }} onBlur={() => {
          this.isBackground = true;
          this._clearTimer();
        }} />
        <ScrollView
          ref={this.scrollView}
          onScrollBeginDrag={this._onScrollBegin}
          onMomentumScrollEnd={this._onScrollEnd}
          onScroll={this._onScroll}
          alwaysBounceHorizontal={false}
          nestedScrollEnabled
          alwaysBounceVertical={false}
          contentInset={{ top: 0 }}
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          bounces={false}
          scrollEventThrottle={16}
          scrollEnabled={this.props.swipe}
          contentContainerStyle={[
            styles.horizontalScroll,
            this.props.contentContainerStyle,
            {
              width: size.width * (childrenLength +
                (childrenLength > 1 && this.props.isLooped ? 2 : 0)),
              height: size.height,
            },
          ]}
        >
          {contents}
        </ScrollView>
        {this.props.arrows && this._renderArrows(this.state.childrenLength)}
        {this.props.bullets && this._renderBullets(this.state.childrenLength)}
        {this.props.pageInfo && this._renderPageInfo(this.state.childrenLength)}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  horizontalScroll: {
    position: 'absolute',
  },
  pageInfoBottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  pageInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pageInfoPill: {
    width: 80,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageInfoText: {
    textAlign: 'center',
  },
  bullets: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    height: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  arrows: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'transparent',
  },
  arrowsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chosenBullet: {
    margin: 10,
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  bullet: {
    margin: 10,
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
  },
});
