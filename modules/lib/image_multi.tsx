// withHooks

//noPage
import { useSafeState } from 'esoftplay';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibLoading } from 'esoftplay/cache/lib/loading/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';

import * as MediaLibrary from 'expo-media-library';
import React, { useEffect } from 'react';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';

export interface LibImage_multiProps {
  mediaSubtype: string
}

const w = (LibStyle.width - 3) * 0.5

const getItemLayout = (data: any, index: number) => {
  let length = w
  return { length, offset: length * index, index }
}

function Imageitem(props: any): any {
  return (
    <TouchableOpacity onPress={props.onPress} >
      <Image source={{ uri: props.uri }} style={{ height: w, width: w, margin: 0.5, resizeMode: "cover" }} />
      <View style={{ width: w, height: 30, backgroundColor: "rgba(0,0,0,0.5)", position: "absolute", bottom: 0, left: 0, right: 0 }} />
      <LibIcon name={props.selected ? "check-circle-outline" : "circle-outline"} color={props.selected ? "#4FE621" : "white"} style={{ position: "absolute", bottom: 5, left: 5 }} />
    </TouchableOpacity>
  )
}

export default function m(props: LibImage_multiProps): any {
  const [photos, setPhotos] = useSafeState([])
  const [after, setAfter] = useSafeState(null)
  const [hasNextPage, setHasNextPage] = useSafeState(true)
  const { max } = LibNavigation.getArgsAll(props)

  useEffect(() => {
    MediaLibrary.getPermissionsAsync()
    MediaLibrary.requestPermissionsAsync()
    if (photos.length == 0)
      getPhotos()
    return () => LibNavigation.cancelBackResult(LibNavigation.getResultKey(props))
  }, [])

  function getPhotos(): void {
    let params: any = { first: 50, sortBy: MediaLibrary.SortBy.modificationTime }
    if (after) params.after = after
    if (!hasNextPage) return
    MediaLibrary.getAssetsAsync(params).then((assets: any) => {
      if (after === assets.endCursor) return
      let displayAssets
      if (props.mediaSubtype == null) {
        displayAssets = assets.assets
      } else {
        displayAssets = assets.assets.filter((asset: any) => {
          return asset.mediaSubtypes.includes(props.mediaSubtype)
        })
      }
      const _displayAssets = displayAssets.map((t: any) => ({ ...t, selected: 0 }))
      setPhotos(LibObject.push(photos, ..._displayAssets)())
      setAfter(assets.endCursor)
      setHasNextPage(assets.hasNextPage)
    })
  }

  const rowRenderer = ({ item, index }: any) => (
    <Imageitem {...item} onPress={() => {
      if (max == 0) {
        setPhotos(LibObject.set(photos, item.selected == 1 ? 0 : 1)(index, "selected"))
      } else
        if (photos.filter((x: any) => x.selected).length < max || item.selected == 1)
          setPhotos(LibObject.set(photos, item.selected == 1 ? 0 : 1)(index, "selected"))
    }} />
  )
  // const AutoLayoutViewNativeComponent = require("@shopify/flash-list/src/native/auto-layout/AutoLayoutViewNativeComponent")
  const List = /* !!AutoLayoutViewNativeComponent ? FlashList : */ FlatList

  return (
    <View style={{ flex: 1, backgroundColor: "white" }} >
      <View style={{ marginTop: LibStyle.STATUSBAR_HEIGHT, height: 50, flexDirection: "row", backgroundColor: "white" }} >
        <TouchableOpacity onPress={() => LibNavigation.back()} style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
          <LibIcon name="close" />
        </TouchableOpacity>
        <View style={{ flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' }} >
          <LibTextstyle textStyle={"headline"} text={photos.filter((x: any) => x.selected).length + (max > 0 ? "/" + max : "") + " Selected"} style={{ color: "#000" }} />
        </View>
        <TouchableOpacity
          onPress={() => LibNavigation.sendBackResult(photos.filter((x: any) => x.selected))}
          style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
          <LibIcon name="check" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }} >
        <List
          data={photos}
          keyExtractor={(_: any, i) => _.uri}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          nestedScrollEnabled
          windowSize={5}
          style={{ paddingHorizontal: 0.5, flex: 1 }}
          onEndReached={() => getPhotos()}
          numColumns={2}
          ListFooterComponent={hasNextPage ? <LibLoading /> : null}
          renderItem={rowRenderer}
        />
      </View>
    </View>
  )
}