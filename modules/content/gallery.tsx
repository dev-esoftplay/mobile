// withHooks

import React, { useRef } from 'react';
import { Image, Pressable, View, ScrollView } from 'react-native';
import Gallery from 'react-native-awesome-gallery';
import { LibIcon, LibNavigation, LibStyle, LibUtils } from 'esoftplay'

export interface ContentGalleryArgs {

}
export interface ContentGalleryProps {

}
export default function m(props: ContentGalleryProps): any {
  let images = LibUtils.getArgs(props, "images", [])
  const image = LibUtils.getArgs(props, "image", "")
  const index = LibUtils.getArgs(props, "index", 0)
  let scale = useRef(1).current

  if (images.length == 0) {
    images.push({
      image: image,
      title: "",
      description: ""
    })
  }
  return (
    <ScrollView scrollEnabled={false} style={{ flex: 1, backgroundColor: 'black', overflow: 'hidden' }} >
      <Gallery
        data={images.map((image) => (image?.image))}
        onSwipeToClose={() => {
          if (scale == 1)
            LibNavigation.back()
        }}
        maxScale={10}
        renderItem={(renderItemInfo) => {
          Image.getSize(String(renderItemInfo.item), (w, h) => {
            renderItemInfo.setImageDimensions({ width: w, height: h })
          })
          return <Image style={{ flex: 1, resizeMode: 'contain' }} source={{ uri: String(renderItemInfo.item) }} />
        }}
        disableTransitionOnScaledImage
        onScaleChange={(sc) => scale = sc}
        doubleTapScale={4}
        initialIndex={index}
      />
      <Pressable
        onPress={() => {
          LibNavigation.back()
        }}
        style={{ position: 'absolute', height: 35, alignItems: 'center', justifyContent: 'center', width: 35, borderRadius: 17.5, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'white', top: LibStyle.STATUSBAR_HEIGHT + 24, right: 24 }} >
        <LibIcon name='close' color="white" />
      </Pressable>
    </ScrollView>
  )
}