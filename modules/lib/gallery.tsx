// withHooks

import esp from 'esoftplay/esp';
import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import Gallery from 'react-native-awesome-gallery';

export interface LibGalleryArgs {

}
export interface LibGalleryProps {

}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/gallery.md) untuk melihat dokumentasi*/
export default function m(props: LibGalleryProps): any {
	const LibIcon = useRef(esp.mod("lib/icon")).current
	const LibNavigation = useRef(esp.mod("lib/navigation")).current
	const LibStyle = useRef(esp.mod("lib/style")).current

  let images = LibNavigation.getArgs(props, "images", [])
  const image = LibNavigation.getArgs(props, "image", "")
  const index = LibNavigation.getArgs(props, "index", 0)
  let scale = useRef(1).current

  if (images.length == 0) {
    images.push({
      image: image,
      title: "",
      description: ""
    })
  }

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: 'black' }} >
      <Gallery
        data={images.map((image) => (image?.image))}
        onSwipeToClose={() => {
          if (scale == 1)
            LibNavigation.back()
        }}
        maxScale={6}
        disableTransitionOnScaledImage
        onScaleChange={(sc) => scale = sc}
        doubleTapScale={4}
        initialIndex={index}
      />
      <Pressable
        onPress={() => {
          LibNavigation.back()
        }}
        style={{ position: 'absolute', height: 35, alignItems: 'center', justifyContent: 'center', width: 35, borderRadius: 17.5, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'white', top: LibStyle.STATUSBAR_HEIGHT + 24, left: 24 }} >
        <LibIcon name='close' color="white" />
      </Pressable>
    </View>
  )
}