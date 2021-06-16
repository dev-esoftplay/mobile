// withHooks

import React from 'react';
import { View } from 'react-native';
import ImageView from "react-native-image-viewing";
import { LibNavigation, LibUtils, useSafeState } from 'esoftplay'

export interface ContentGalleryArgs {

}
export interface ContentGalleryProps {

}
export default function m(props: ContentGalleryProps): any {
  let images = LibUtils.getArgs(props, "images", [])
  let image = LibUtils.getArgs(props, "image", "")
  const index = LibUtils.getArgs(props, "index", 0)
  const [show, setShow] = useSafeState(true)

  if (images.length == 0) {
    images.push({
      image: image,
      title: "",
      description: ""
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }} >
      <ImageView
        images={images.map((image) => ({ uri: image.image }))}
        imageIndex={index}
        visible={show}
        animationType="none"
        onRequestClose={() => {
          setShow(false)
          requestAnimationFrame(() => {
            LibNavigation.back()
          });
        }}
      />
    </View>
  )
}