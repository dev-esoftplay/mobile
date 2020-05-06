// withHooks

import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useSafeState, LibWorker } from 'esoftplay';

export interface LibPictureSource {
  uri: string
}
export interface LibPictureProps {
  source: LibPictureSource | any,
  style: any,
  resizeMode?: "contain" | "cover"
}

export default function m(props: LibPictureProps): any {
  const [uri, setUri] = useSafeState("")
  const { width, height } = props.style

  if (props.source.hasOwnProperty("uri") && (!width || !height)) {
    throw "Width and Height is Required"
  }

  useEffect(() => {
    if (props.source.uri) {
      LibWorker.image(props.source.uri, Math.max(width, height), setUri)
    }
  }, [props.source])

  if (!props.source.hasOwnProperty("uri")) {
    return <Image {...props} />
  }

  if (uri == '') {
    return <View style={props.style} />
  }
  return <Image {...props} source={{ uri }} style={props.style} />
}