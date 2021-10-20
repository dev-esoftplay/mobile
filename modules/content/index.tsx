// withHooks

import { ContentBookmark, ContentCategory, ContentList, LibIcon, LibStyle, useGlobalReturn, useGlobalState } from 'esoftplay';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface ContentIndexArgs {

}
export interface ContentIndexProps {

}
const _state = useGlobalState(0)


export function state(): useGlobalReturn<number> {
  return _state
}

export default function m(props: ContentIndexProps): any {
  const [idx, setIdx] = _state.useState()
  const Aview = [ContentList, ContentCategory, ContentBookmark][idx]

  return (
    <>
      <Aview />
      <View style={styleId_ZKPd2h} >
        <Pressable onPress={() => setIdx(0)} style={styleId_Z2pKvdh} >
          <>
            <LibIcon name='home' size={26} color={idx == 0 ? LibStyle.colorPrimary : 'grey'} />
            <Text style={{ ...styleId_Z25Lwf9, color: idx == 0 ? LibStyle.colorPrimary : 'grey' }} >Beranda</Text>
          </>
        </Pressable>
        <Pressable onPress={() => setIdx(1)} style={styleId_Z2pKvdh} >
          <>
            <LibIcon name='view-dashboard' size={26} color={idx == 1 ? LibStyle.colorPrimary : 'grey'} />
            <Text style={{ ...styleId_Z25Lwf9, color: idx == 1 ? LibStyle.colorPrimary : 'grey' }} >Kategori</Text>
          </>
        </Pressable>
        <Pressable onPress={() => setIdx(2)} style={styleId_Z2pKvdh} >
          <>
            <LibIcon name='bookmark' size={26} color={idx == 2 ? LibStyle.colorPrimary : 'grey'} />
            <Text style={{ ...styleId_Z25Lwf9, color: idx == 2 ? LibStyle.colorPrimary : 'grey' }} >Disimpan</Text>
          </>
        </Pressable>
      </View>
    </>
  )
}
const styleId_ZKPd2h: any = { height: 56, flexDirection: 'row', borderTopWidth: 3, borderTopColor: '#f8f8f8' }
const styleId_Z2pKvdh: any = { flex: 1, justifyContent: 'center', alignItems: 'center' }
const styleId_Z25Lwf9: any = {  fontSize: 12, fontWeight: "500", lineHeight: 16, textAlign: "center", color: 'grey' }