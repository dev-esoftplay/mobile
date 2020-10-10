// withHooks

import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import ImageView from 'react-native-image-view';
import { LibLoading, LibNavigation, LibUtils, useSafeState } from 'esoftplay'

export interface ContentGalleryArgs {

}
export interface ContentGalleryProps {

}
export default function m(props: ContentGalleryProps): any {
  let images = LibUtils.getArgs(props, "images", [])
  let image = LibUtils.getArgs(props, "image", "")
  const index = LibUtils.getArgs(props, "index", 0)
  const [show, setShow] = useSafeState(false)
  const [IMG, SETIMGS] = useSafeState([])

  if (images.length == 0) {
    images.push({
      image: image,
      title: "",
      description: ""
    })
  }

  async function getSizes(images: any[]): Promise<any[]> {
    return new Promise((r) => {
      let _images = images
      let idx = 0
      function size() {
        Image.getSize(_images[idx].image, (width, height) => {
          const x = _images[idx]
          _images[idx] = { ...x, width, height, source: { uri: x.image } }
          idx++
          if (idx < _images.length) {
            size()
          } else {
            r(_images)
          }
        });
      }
      size()
    })
  }

  useEffect(() => {
    getSizes(images).then((imgs) => {
      SETIMGS(imgs)
      setShow(true)
    })
  }, [])


  return (
    <View style={{ flex: 1, backgroundColor: 'black' }} >
      {
        !show &&
        <LibLoading />
      }
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} >
        <ImageView
          images={IMG}
          imageIndex={index}
          animationType="fade"
          isVisible={show}
          renderFooter={(currentImage) => (null)}
          onClose={() => {
            setShow(false)
            LibNavigation.back()
          }}
        />
      </View>
    </View>
  )
}