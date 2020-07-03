// withHooks

import React, { useEffect } from 'react';
import { View, Image, Platform } from 'react-native';
import { useSafeState, LibWorker, LibStyle, LibObject } from 'esoftplay';
import * as FileSystem from 'expo-file-system'
const sh = require("shorthash")

export interface LibPictureSource {
  uri: string
}
export interface LibPictureProps {
  source: LibPictureSource | any,
  style: any,
  resizeMode?: "contain" | "cover",
  onError?: () => void,
}

const CACHE_DIR = `${FileSystem.cacheDirectory}lib-picture-cache/`;

const getCacheEntry = async (uri: string, toSize: number): Promise<{ exists: boolean; path: string }> => {
  const path = `${CACHE_DIR}${sh.unique(uri)}-${toSize}.png`;
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR);
  } catch (e) {
    // do nothing
  }
  const info = await FileSystem.getInfoAsync(path);
  const { exists } = info;
  return { exists, path };
};

export default function m(props: LibPictureProps): any {
  const [uri, setUri] = useSafeState("")
  let { width, height } = props.style

  if (props.source.hasOwnProperty("uri") && (!width || !height)) {
    if (width) {
      height = width
    } else {
      width = height
    }
    console.warn("Width and Height is Required");
  }

  useEffect(() => {
    if (Platform.OS == 'android' && Platform.Version <= 22) {
      return
    }
    if (props.source.uri) {
      let toSize = Math.max(width, height)
      toSize = isNaN(toSize) ? LibStyle.width * 0.5 : toSize
      getCacheEntry(props.source.uri, toSize).then(({ path, exists }) => {
        if (exists) {
          setUri(path)
        } else {
          LibWorker.image(props.source.uri, toSize, (uri) => {
            FileSystem.writeAsStringAsync(path, uri, { encoding: "base64" }).then(() => {
              setUri(path)
            })
          })
        }
      })
    }
  }, [props.source])

  if (Platform.Version <= 22 && Platform.OS == 'android') {
    if (typeof props.source != 'number' && !props.source.uri) {
      return <View style={props.style} />
    }
    return <Image {...props} />
  }

  if (!props.source.hasOwnProperty("uri")) {
    return <Image {...props} />
  }

  if (uri == '') {
    return <View style={props.style} />
  }

  return (
    <Image
      {...props}
      source={{ uri }}
      style={props.style} />
  )
}