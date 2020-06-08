// withHooks

import React, { useEffect } from 'react';
import { View, Image, InteractionManager } from 'react-native';
import { useSafeState, LibWorker, LibStyle } from 'esoftplay';
import * as FileSystem from 'expo-file-system'
const sh = require("shorthash")
import _ from "lodash"

export interface LibPictureSource {
  uri: string
}
export interface LibPictureProps {
  source: LibPictureSource | any,
  style: any,
  resizeMode?: "contain" | "cover"
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
  const { width, height } = props.style

  if (props.source.hasOwnProperty("uri") && (!width || !height)) {
    throw "Width and Height is Required"
  }

  var timmer: any

  useEffect(() => {
    timmer = InteractionManager.runAfterInteractions(async () => {
      if (props.source.uri) {
        let toSize = Math.max(width, height)
        toSize = isNaN(toSize) ? LibStyle.width * 0.5 : toSize
        const { path, exists } = await getCacheEntry(props.source.uri, toSize)
        if (exists) {
          setUri(path)
        } else {
          LibWorker.image(props.source.uri, toSize, async (uri) => {
            await FileSystem.writeAsStringAsync(path, uri.replace("data:image/png;base64,", ""), { encoding: "base64" });
            setUri(path)
          })
        }
      }
    })
    return () => timmer.cancel()
  }, [props.source])

  if (!props.source.hasOwnProperty("uri")) {
    return <Image {...props} />
  }

  if (uri == '') {
    return <View style={props.style} />
  }
  return <Image {...props} source={{ uri }} style={props.style} />
}