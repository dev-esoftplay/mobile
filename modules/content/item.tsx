// withHooks
// noPage

import { ContentBookmarkProperty, ContentConfig, LibIcon, LibNavigation, LibPicture, LibStyle, LibUtils } from 'esoftplay';
import React from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';


export interface ContentItemArgs {

}
export interface ContentItemProps {
  id: string,
  title: string,
  intro: string,
  description: string,
  image: string,
  created: string,
  updated: string,
  url: string,
  publish: string,
  type_id: string,
  created_by: string,
  created_by_alias: string,
  modified_by: string,
  revised: string,
  hits: string,
  rating: string,
  last_hits: string,
  is_popimage: string,
  is_front: string,
  is_config: string,
  config: string,
}
export default function m(props: ContentItemProps): any {
  const isBook = ContentBookmarkProperty.state().useSelector(s => s.ids.includes(Number(props.id)))
  const configlist = ContentConfig.state().get().list
  if (props.created == 'sponsor')
    if (props.title == '')
      return (
        <Pressable onPress={() => Linking.openURL(props.url)} >
          <Image source={{ uri: props.image }} style={styleId_Z1pdPtF} />
        </Pressable>
      )
    else if (props.image === "")
      return (
        <Pressable
          onPress={() => Linking.openURL(props.url)}
          style={styleId_Z1S0WHq} >
          <View style={styleId_Z13iiKo} >
            <Text style={styleId_Z14zkzb} >{props.created.toUpperCase()}</Text>
            <Text numberOfLines={2} ellipsizeMode='tail' style={styleId_1NrPkO} >{props.title}</Text>
            <View style={styleId_Z1i5LUH} >
              <Text style={styleId_mzCdS} >{props.created_by_alias}</Text>
            </View>
          </View>
        </Pressable>
      )
    else
      return (
        <Pressable
          onPress={() => LibNavigation.push('content/detail', { ...props })}
          style={styleId_Z1S0WHq} >
          <Image source={{ uri: props.image }} style={styleId_Zl1hMr} />
          <View style={styleId_Z13iiKo} >
            <Text style={styleId_Z14zkzb} >{props.created.toUpperCase()}</Text>
            <Text numberOfLines={2} ellipsizeMode='tail' style={styleId_1NrPkO} >{props.title}</Text>
            <View style={styleId_Z1i5LUH} >
              <Text style={styleId_mzCdS} >{props.created_by_alias}</Text>
            </View>
          </View>
        </Pressable>
      )

  return (
    <Pressable
      onPress={() => LibNavigation.push('content/detail', { ...props })}
      style={styleId_Z1S0WHq} >
      {
        configlist.thumbnail == 1 &&
        <LibPicture source={{ uri: props.image }} style={styleId_Zl1hMr} />
      }
      <View style={styleId_Z13iiKo} >
        {
          configlist.created == 1 &&
          <Text style={styleId_Z14zkzb} >{LibUtils.moment(props.created, 'id').format('DD MMM YYYY HH:mm').toUpperCase()}</Text>
        }
        {
          configlist.title == 1 &&
          <Text numberOfLines={2} ellipsizeMode='tail' style={styleId_1NrPkO} >{props.title}</Text>
        }
        {
          configlist.author == 1 &&
          <View style={styleId_Z1i5LUH} >
            <Text style={styleId_mzCdS} >{props.created_by_alias}</Text>
          </View>
        }
      </View>
      <Pressable onPress={() => ContentBookmarkProperty.toggle(props)} >
        <LibIcon name={isBook ? 'bookmark' : 'bookmark-plus-outline'} color={'#FD5593'} size={24} />
      </Pressable>
    </Pressable>
  )
}
const styleId_Z1pdPtF: any = { width: LibStyle.width, height: 110, resizeMode: 'contain' }
const styleId_Z1S0WHq: any = { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', borderBottomWidth: 1, borderTopWidth: 1, borderBottomColor: '#f2f2f2', borderTopColor: '#f8f8f8' }
const styleId_Z13iiKo: any = { flex: 1, marginLeft: 16, paddingTop: 0 }
const styleId_Z14zkzb: any = {  fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "#686868" }
const styleId_1NrPkO: any = {  fontSize: 17, fontWeight: "500", lineHeight: 21, color: "#060606", marginTop: 5, }
const styleId_Z1i5LUH: any = { flexDirection: 'row', marginTop: 5 }
const styleId_mzCdS: any = {  fontSize: 14, lineHeight: 20, color: LibStyle.colorPrimary, }
const styleId_Zl1hMr: any = { height: 90, width: 110, borderRadius: 8, backgroundColor: '#f8f8f8' }