// withHooks
// noPage
import { esp, useSafeState } from 'esoftplay';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibWorkloop } from 'esoftplay/cache/lib/workloop/import';
import useGlobalState from 'esoftplay/global';
import Worker from 'esoftplay/libs/worker';
import * as FileSystem from 'expo-file-system';
import React, { useLayoutEffect } from 'react';
import { PixelRatio, Platform, View } from 'react-native';
import FastImage from 'react-native-fast-image';
const sh = require("shorthash")

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

const CACHE_DIR = `${FileSystem.cacheDirectory}lib-picture-cache/`;

(() => {
  try {
    FileSystem.makeDirectoryAsync(CACHE_DIR).then().catch(e => { });
  } catch (e) {
    // do nothing
  }
})()

const state = useGlobalState({}, { persistKey: 'lib_picture_paths', inFile: true })
const getCacheEntry = async (uri: string, toSize: number): Promise<{ exists: boolean; path: string }> => {
  const path = `${sh.unique(uri)}-${toSize}`;
  let info = state.get(path);
  if (!info) {
    info = await (await FileSystem.getInfoAsync(`${CACHE_DIR}${path}.png`)).exists
  }
  return { exists: !!info, path: `${CACHE_DIR}${path}.png` };
};

const fetchPicture = Worker.registerJobAsync('lib_picture_fetch', (url: string, toSize: number) => {
  'show source';
  return new Promise((resolve, reject) => {
    'show source';
    fetch(url, { mode: 'cors' })
      .then(response => response.blob())
      .then(blob => {
        let reader = new FileReader();
        reader.onload = function () {
          let img = document.createElement('img');
          img.onload = function () {
            let wantedMaxSize = toSize
            let rawheight = img.height
            let rawwidth = img.width
            let wantedheight = 0
            let wantedwidth = 0
            let ratio = rawwidth / rawheight
            if (Math.max(rawheight, rawwidth) > wantedMaxSize) {
              if (rawheight > rawwidth) {
                wantedwidth = wantedMaxSize * ratio;
                wantedheight = wantedMaxSize;
              } else {
                wantedwidth = wantedMaxSize;
                wantedheight = wantedMaxSize / ratio;
              }
            } else {
              wantedwidth = rawwidth
              wantedheight = rawheight
            }
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = wantedwidth;
            canvas.height = wantedheight;
            //@ts-ignore
            ctx.drawImage(this, 0, 0, wantedwidth, wantedheight);
            let x = canvas.toDataURL();
            resolve(x.replace("data:image/png;base64,", ""))
          }
          img.src = String(reader.result)
        };
        reader.readAsDataURL(blob);
      });
  })
})

function savePicture(b_uri: string, toSize: string, path: string, uri: string) {
  FileSystem.writeAsStringAsync(path, uri, { encoding: "base64" })
    .then(() => {
      const _path = `${sh.unique(b_uri)}-${toSize}`;
      let dt = state.get()
      dt[_path] = 1
      state.set(dt)
    })
}

export default function m(props: LibPictureProps): any {
  const [uri, setUri] = useSafeState('')
  let b_uri = props?.source?.uri?.replace?.('://api.', '://')
  b_uri = b_uri?.replace?.('://data.', '://')
  let { width, height } = props.style
  const valid = b_uri?.includes?.(esp.config('domain'))

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

  if (!width || !height) {
    if (width) {
      height = width
    } else {
      width = height
    }
    console.warn("Width and Height is Required");
  }

  useLayoutEffect(() => {
    if (!valid || (Platform.OS == 'android' && Platform.Version <= 22)) {
      return
    }
    if (b_uri) {
      let toSize = Math.max(width, height)
      toSize = isNaN(toSize) ? LibStyle.width * 0.5 : toSize
      getCacheEntry(b_uri, toSize).then(({ path, exists }) => {
        if (exists) {
          setUri(path)
        } else {
          fetchPicture([b_uri, PixelRatio.getPixelSizeForLayoutSize(toSize)], (uri) => {
            setUri("data:image/png;base64," + uri)
            if (!props.noCache)
              LibWorkloop.execNextTix(savePicture, [b_uri, toSize, path, uri, { encoding: "base64" }])
          })
        }
      })
    }
  }, [props?.source?.uri])

  if (!valid || (Platform.Version <= 22 && Platform.OS == 'android')) {
    if (typeof props.source != 'number' && !b_uri) {
      return <View style={props.style} />
    }
    return <FastImage {...props} resizeMode={resizeMode} />
  }

  if (!valid || (!props.source.hasOwnProperty("uri"))) {
    return <FastImage {...props} resizeMode={resizeMode} />
  }

  if (uri == '') {
    return (
      <View style={[{ backgroundColor: '#f1f2f3', borderRadius: 10 }, props.style]} />
    )
  }

  return (
    <FastImage key={b_uri + uri} {...props} source={{ uri: uri }} style={props.style} resizeMode={resizeMode} />
  )
}