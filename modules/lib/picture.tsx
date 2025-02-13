// withHooks
// noPage
import esp from 'esoftplay/esp';
import { Image } from 'expo-image';
import React from 'react';
import { ImageStyle } from 'react-native';

export interface LibPictureSource {
  uri: string
}
export interface LibPictureProps {
  source: LibPictureSource | any,
  style: ImageStyle,
  resizeMode?: "contain" | "cover",
  onError?: () => void,
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/picture.md) untuk melihat dokumentasi*/
export default function m(props: LibPictureProps): any {

  let resizeMode
  if (props?.style?.resizeMode == 'cover')
    resizeMode = "cover"
  else if (props?.style?.resizeMode == 'contain')
    resizeMode = "contain"
  else if (props?.resizeMode == 'cover')
    resizeMode = "cover"
  else if (props?.resizeMode == 'contain')
    resizeMode = "contain"
  else
    resizeMode = "cover"

  let source = props.source
  if (typeof (props.source.uri) == 'string' && !String(props.source.uri).startsWith("http")) {
    source = esp.assets(props.source.uri)
  }

  return (
    <Image {...props} source={source} contentFit={resizeMode} allowDownscaling cachePolicy={"memory-disk"} />
  )
}