// withHooks
import { LibFont } from 'esoftplay/cache/lib/font/import';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
export interface OtherIndexArgs {

}
export interface OtherIndexProps {

}

function m(props: OtherIndexProps): any {

  return (
    <View style={{ flex: 1, backgroundColor: "skyblue", justifyContent: 'center', alignItems: 'center' }} >
      <Text style={{ lineHeight: 37, fontFamily: LibFont("AirbnbCereal-Book"), fontSize: 30 }} >{"Nasi Goreng:"}</Text>
      <Text style={{ lineHeight: 37, fontFamily: LibFont("AirbnbCereal-Bold"), fontSize: 30 }} >{"Rp 1.000.000"}</Text>
      <Text style={{ lineHeight: 37, fontFamily: LibFont("AirbnbCereal-Book"), fontSize: 30 }} >{String('ssssss')}</Text>
      <Text style={{ lineHeight: 37, fontFamily: LibFont("AirbnbCereal-Book"), fontSize: 30 }} >{"Press"}</Text>
    </View>
  )
}


export default memo(m);