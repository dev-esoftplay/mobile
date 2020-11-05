// withHooks

import React, { useMemo, useRef } from 'react';
import { View, Image, Platform } from 'react-native';
import { useSafeState, LibWorker, LibStyle, LibDirect_image } from 'esoftplay';
import * as FileSystem from 'expo-file-system'
const sh = require("shorthash")
import Constants from 'expo-constants';

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

export function createCacheDir(): void {
  try {
    FileSystem.makeDirectoryAsync(CACHE_DIR).then().catch(e => { });
  } catch (e) {
    // do nothing
  }
}

const getCacheEntry = async (uri: string, toSize: number): Promise<{ exists: boolean; path: string }> => {
  const path = `${CACHE_DIR}${sh.unique(uri)}-${toSize}.png`;
  const info = await FileSystem.getInfoAsync(path);
  const { exists } = info;
  return { exists, path };
};

export default function m(props: LibPictureProps): any {
  let { width, height } = props.style
  const refImage = useRef<LibDirect_image>(null)

  if (props.source.hasOwnProperty("uri") && (!width || !height)) {
    if (width) {
      height = width
    } else {
      width = height
    }
    console.warn("Width and Height is Required");
  }

  useMemo(() => {
    if (Platform.OS == 'android' && Platform.Version <= 22 && Constants.appOwnership == 'expo') {
      return
    }
    if (props.source.uri) {
      let toSize = Math.max(width, height)
      toSize = isNaN(toSize) ? LibStyle.width * 0.5 : toSize
      getCacheEntry(props.source.uri, toSize).then(({ path, exists }) => {
        if (exists) {
          refImage?.current?.setSource({ uri: path })
        } else {
          LibWorker.image(props.source.uri, toSize, (uri) => {
            FileSystem.writeAsStringAsync(path, uri, { encoding: "base64" }).then(() => {
              refImage?.current?.setSource({ uri: path })
            })
          })
        }
      })
    }
  }, [props.source])

  if (Platform.Version <= 22 && Platform.OS == 'android' && Constants.appOwnership == 'expo') {
    if (typeof props.source != 'number' && !props.source.uri) {
      return <View style={props.style} />
    }
    return <Image {...props} />
  }

  return (
    <LibDirect_image
      ref={refImage}
      defaultSource={props.source.uri ? undefined : props.source}
      {...props}
      style={props.style} />

  )
}