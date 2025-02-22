// withHooks
//noPage
import esp from 'esoftplay/esp';
import React, { useRef } from 'react';
import { Image, ImageStyle, View } from 'react-native';

export interface LibImage_shadowArgs {

}
export interface LibImage_shadowProps {
  style: ImageStyle,
  source: any,
  shadowRadius?: number,
  blurRadius?: number
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image_shadow.md) untuk melihat dokumentasi*/
export default function m(props: LibImage_shadowProps): any {
  const LibPicture = useRef(esp.mod("lib/picture")).current

  let { height, width }: any = props.style
  if (!height || !width) throw new Error(esp.lang("lib/image_shadow", "error"))

  const extra_height = (props.shadowRadius || 0.15) * (Number(height) || 1)

  return (
    <View style={{ ...props.style, height: Number(height) + extra_height, width }} >
      <Image source={props.source} blurRadius={props.blurRadius || 8} style={{ height, width, ...props.style, marginTop: extra_height }} />
      <View style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 0.55 * width, width }} >
        <LibPicture source={esp.assets('blur.png')} style={{ width: '100%', height: '100%' }} />
      </View>
      <LibPicture source={props.source} style={{ height, width, ...props.style, position: 'absolute' }} />
    </View>
  )
}