// withHooks
// noPage
import esp from 'esoftplay/esp';
import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, View } from 'react-native';

export interface LibCarrousel_snapProps {
  data: any[]
  align?: 'center' | 'left'
  style?: any,
  maxWidth: number,
  autoCycle?: boolean,
  loop?: boolean,
  autoCycleDelay?: number,
  itemMarginHorizontal: number,
  itemWidth: number,
  onChangePage?: (page: number) => void,
  initialPage?: number,
  renderItem: (item: any, key: number | string, itemWidth: number) => any
}
export default function m(props: LibCarrousel_snapProps): any {
  const LibFocus = useRef(esp.mod("lib/focus")).current
  const autoCycle = props.autoCycle || false
  const autoCycleDelay = props.autoCycleDelay || 4000
  const align = props.align || 'center'
  const sRef = useRef<ScrollView>(null)
  const itemWidth = props.itemWidth - (props.itemMarginHorizontal * 2)
  const adderLength = useMemo(() => prefix().length, [props.data])
  const indexsData = useMemo(() => props.data.map((_, i) => i), [props.data])
  const indexes = useMemo(() => [...prefixIndexs(), ...props.data.map((_, i) => i), ...suffixIndexs()], [props.data])
  const views = useMemo(() => [...prefix(), ...props.data, ...suffix()], [props.data])
  const renderOffsets = useMemo(() => views.map((_, i) => i * props.itemWidth), [props.data])
  const wideMargin = (props.maxWidth - props.itemWidth) * 0.5
  let thisPage = useRef(0).current
  let timmerTick: any = useRef().current

  useEffect(() => {
    let initialPage = props.initialPage || 0
    if (props.loop) {
      initialPage += adderLength
    }
    thisPage = initialPage
    if (props.onChangePage) props.onChangePage(indexes[initialPage])
    sRef.current!.scrollTo({ x: renderOffsets[initialPage], animated: false })
    if (autoCycle && props.loop && props.align == 'center')
      timmer()
    return () => {
      if (timmerTick) {
        clearInterval(timmerTick)
      }
    }

  }, [])


  function renderItem(item: any, index: string | number): any {
    return (
      <View key={index.toString() + item} style={{ maxWidth: itemWidth, overflow: "hidden", marginHorizontal: props.itemMarginHorizontal }} >
        {props.renderItem(item, index, itemWidth)}
      </View>
    )
  }

  function timmer() {
    timmerTick = setInterval(() => {
      toPage(thisPage + 1)
    }, autoCycleDelay);
  }

  function toPage(page: number) {
    let out = page
    if (align == 'left' && out == props.data.length - 1) {
      out = out - (props.maxWidth - props.itemWidth)
    }
    if (props.onChangePage)
      props.onChangePage(indexes[out])
    if (props.loop) {
      if (out >= (props.data.length + adderLength)) {
        const a = indexes[out];
        const b = indexsData.indexOf(a) + adderLength
        sRef.current!.scrollTo({ x: renderOffsets[out], animated: true })
        thisPage = b
        return
      }
    }
    thisPage = out
    sRef.current!.scrollTo({ x: renderOffsets[out], animated: true })
  }

  function onChangePage(e: any) {
    const offsetX = e.nativeEvent.contentOffset.x
    let out = 0
    if (offsetX > 0) {
      out = (offsetX / props.itemWidth)
      if (align == 'left' && out == props.data.length) {
        out = out - (props.maxWidth - props.itemWidth)
      }
    }
    if (props.onChangePage)
      props.onChangePage(indexes[Math.round(out)])

    if (props.loop) {
      let x = offsetX ? (offsetX / props.itemWidth) : 0
      if (x <= adderLength || x >= (props.data.length + adderLength)) {
        const a = indexes[x];
        const b = indexsData.indexOf(a) + adderLength
        sRef.current!.scrollTo({ x: renderOffsets[b], animated: false })
        thisPage = b
        if (timmerTick) {
          clearInterval(timmerTick)
          timmer()
          return
        }
      }
    }
    thisPage = out
    if (timmerTick) {
      clearInterval(timmerTick)
      timmer()
    }
  }

  function prefixIndexs(): number[] {
    let out: any[] = []
    const dataLength: number = (props.data.length || 0)
    if (props.loop) {
      if (dataLength == 1) {
        out.push(dataLength - 1)
        out.push(dataLength - 1)
        out.push(dataLength - 1)
      } else if (dataLength > 2) {
        out.push(dataLength - 3)
        out.push(dataLength - 2)
        out.push(dataLength - 1)
      } else {
        out.push(dataLength - 1)
        out.push(dataLength - 2)
        out.push(dataLength - 1)
      }

    }
    return out
  }

  function prefix(): any {
    let out: any[] = []
    if (props.loop) {
      const dataLength = props.data.length
      if (dataLength == 1) {
        out.push(renderItem(props.data[dataLength - 1], 'x'))
        out.push(renderItem(props.data[dataLength - 1], 'y'))
        out.push(renderItem(props.data[dataLength - 1], 'z'))
      } else if (dataLength > 2) {
        out.push(renderItem(props.data[dataLength - 3], 'x'))
        out.push(renderItem(props.data[dataLength - 2], 'y'))
        out.push(renderItem(props.data[dataLength - 1], 'z'))
      } else {
        out.push(renderItem(props.data[dataLength - 1], 'x'))
        out.push(renderItem(props.data[dataLength - 2], 'y'))
        out.push(renderItem(props.data[dataLength - 1], 'z'))
      }

    }
    return out
  }

  function suffixIndexs(): number[] {
    let out: any[] = []
    if (props.loop) {
      if (props.data.length == 1) {
        out.push(0)
        out.push(0)
        out.push(0)
      } else if (props.data.length > 2) {
        out.push(0)
        out.push(1)
        out.push(2)
      } else {
        out.push(0)
        out.push(1)
        out.push(0)
      }
    }
    return out
  }

  function suffix(): any {
    let out: any[] = []
    if (props.loop) {
      if (props.data.length == 1) {
        out.push(renderItem(props.data[0], 'x'))
        out.push(renderItem(props.data[0], 'y'))
        out.push(renderItem(props.data[0], 'z'))
      } else if (props.data.length > 2) {
        out.push(renderItem(props.data[0], 'x'))
        out.push(renderItem(props.data[1], 'y'))
        out.push(renderItem(props.data[2], 'z'))
      } else {
        out.push(renderItem(props.data[0], 'x'))
        out.push(renderItem(props.data[1], 'y'))
        out.push(renderItem(props.data[0], 'z'))
      }
    }
    return out
  }

  return (
    <View style={{}} >
      <LibFocus onFocus={() => autoCycle && props.loop && props.align == 'center' ? timmer() : {}} onBlur={() => timmerTick ? clearInterval(timmerTick) : {}} />
      <ScrollView
        bounces={false}
        ref={sRef}
        horizontal
        nestedScrollEnabled
        {...props}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onChangePage}
        snapToOffsets={renderOffsets}
        decelerationRate={0} >
        {align == 'center' && <View style={{ width: wideMargin }} />}
        {prefix()}
        {props.data.map(renderItem)}
        {suffix()}
        {align == 'center' && <View style={{ width: wideMargin }} />}
      </ScrollView>
    </View>
  )
}