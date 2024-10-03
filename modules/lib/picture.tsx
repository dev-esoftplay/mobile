// withHooks
// noPage
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

  return (
    <Image {...props} contentFit={resizeMode} allowDownscaling cachePolicy={"memory-disk"} />
  )
}