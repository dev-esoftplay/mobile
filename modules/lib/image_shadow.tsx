// withHooks
import { LibPicture } from 'esoftplay/cache/lib/picture/import';
import esp from 'esoftplay/esp';
import React from 'react';
import { Image, ImageStyle, View } from 'react-native';

export interface LibImage_shadowArgs {

}
export interface LibImage_shadowProps {
  style: ImageStyle,
  source: any,
  shadowRadius?: number,
  blurRadius?: number
}
export default function m(props: LibImage_shadowProps): any {
  let { height, width }: any = props.style
  if (!height || !width) throw new Error("width and height is required")

  const extra_height = (props.shadowRadius || 0.15) * (Number(height) || 1)
  
  return (
    <View style={{ ...props.style, height: Number(height) + extra_height, width, backgroundColor: 'orange' }} >
      <Image source={props.source} blurRadius={props.blurRadius || 8} style={{ height, width, ...props.style, marginTop: extra_height }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 0.55 * width, width }} >
        <LibPicture source={esp.mod('blur.png')} style={{ width: '100%', height: '100%' }} />
      </View>
      <LibPicture source={props.source} style={{ height, width, ...props.style, position: 'absolute' }} />
    </View>
  )
}