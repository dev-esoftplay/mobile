// withHooks
// noPage
import React from 'react';
import FastImage from 'react-native-fast-image';

export interface LibPictureSource {
  uri: string
}
export interface LibPictureProps {
  source: LibPictureSource | any,
  style: any,
  resizeMode?: "contain" | "cover",
  noCache?: boolean,
  onError?: () => void,
}

export default function m(props: LibPictureProps): any {

  let resizeMode
  if (props?.style?.resizeMode == 'cover')
    resizeMode = FastImage.resizeMode.cover
  else if (props?.style?.resizeMode == 'contain')
    resizeMode = FastImage.resizeMode.contain
  else if (props?.resizeMode == 'cover')
    resizeMode = FastImage.resizeMode.cover
  else if (props?.resizeMode == 'contain')
    resizeMode = FastImage.resizeMode.contain
  else
    resizeMode = FastImage.resizeMode.cover

  return <FastImage  {...props} resizeMode={resizeMode} />
}