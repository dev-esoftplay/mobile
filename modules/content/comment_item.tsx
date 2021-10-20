// withHooks
// noPage

import { LibIcon, LibNavigation, LibUtils } from 'esoftplay';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';


export interface ContentComment_itemArgs {

}
export interface ContentComment_itemProps {
  id: number,
  url: string,
  url_post: string,
  par_id: number,
  name: string,
  image: string,
  content: string,
  email: string,
  website: string,
  date: string,
  reply: number
}

export default function m(props: ContentComment_itemProps): any {
  const styleId_Z2wK9pa: any = { flexDirection: 'row', backgroundColor: 'white', borderLeftWidth: props.par_id > 0 ? 50 : 0, borderLeftColor: '#f9f9f9' }
  return (
    <View style={styleId_Z2wK9pa} >
      <View style={styleId_14E1yO} >
        <Image source={{ uri: props.image }} style={styleId_2e0Fad} />
      </View>
      <View style={styleId_ZLhjsk} >
        <Text style={styleId_ZCtIoL} >{LibUtils.moment(props.date).format('DD MMM YYYY HH:mm').toUpperCase()}</Text>
        <Text style={styleId_ZmiARo} >{props.name}</Text>
        <Text style={styleId_1jN6UB} >{props.content}</Text>
        <Pressable
          onPress={() => LibNavigation.push('content/comment', {
            header: { ...props, par_id: 0 },
            url: props.url, url_post: props.url_post, par_id: props.id
          })}
          style={styleId_Z1IS0fI} >
          <View style={styleId_Z2nP5oE} >
            <LibIcon.AntDesign name='message1' size={12} color="#ababab" />
            <Text style={styleId_Z1pDQI5} >{props.reply} Balasan</Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}
const styleId_14E1yO: any = { marginTop: 18, marginLeft: 16 }
const styleId_2e0Fad: any = { height: 50, width: 50, backgroundColor: '#f8f8f8', resizeMode: 'cover', overflow: 'hidden', borderRadius: 25 }
const styleId_ZLhjsk: any = { flex: 1, paddingVertical: 16, marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' }
const styleId_ZCtIoL: any = {  fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "#686868" }
const styleId_ZmiARo: any = {  fontSize: 16, fontWeight: "500", lineHeight: 20, color: "#060606", marginTop: 8 }
const styleId_1jN6UB: any = {  fontSize: 14, fontWeight: "500", lineHeight: 20, color: "#606060" }
const styleId_Z1IS0fI: any = { flexDirection: 'row' }
const styleId_Z2nP5oE: any = { flexDirection: 'row', alignItems: 'center', marginTop: 9, backgroundColor: '#f1f1f1', padding: 3, borderRadius: 6 }
const styleId_Z1pDQI5: any = {  fontSize: 12, lineHeight: 16, color: "#ababab", marginLeft: 5 }