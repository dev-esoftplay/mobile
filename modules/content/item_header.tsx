// withHooks
// noPage

import { applyStyle, ContentBookmarkProperty, LibIcon, LibNavigation, LibStyle, LibUtils } from 'esoftplay';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';

export interface ContentItem_headerArgs {

}
export interface ContentItem_headerProps {
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
const itemHeight = LibStyle.width * 3 / 4
export default function m(props: ContentItem_headerProps): any {
  const isBook = ContentBookmarkProperty.state().useSelector(s => s.ids.includes(Number(props.id)))

  return (
    <Pressable onPress={() => LibNavigation.push('content/detail', { ...props })} >
      <ImageBackground
        source={{ uri: props.image }}
        style={applyStyle({ height: itemHeight, width: LibStyle.width, justifyContent: 'flex-end' })} >
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={applyStyle({ padding: 16 })} >
          <Text style={applyStyle({  fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "white", textTransform: 'uppercase' })} >{LibUtils.moment(props.created, 'id').format('DD MMM YYYY HH:mm')}</Text>
          <Text style={applyStyle({  fontSize: 24, fontWeight: "500", lineHeight: 30, color: "white", marginTop: 5 })} >{props.title}</Text>
          <View style={applyStyle({ flexDirection: 'row', marginTop: 5 })} >
            <View style={applyStyle({ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4, paddingHorizontal: 10, })} >
              <Text style={applyStyle({  fontSize: 14, lineHeight: 20, color: LibStyle.colorPrimary, })} >{props.created_by_alias}</Text>
            </View>
          </View>
        </LinearGradient>
        <Pressable onPress={() => ContentBookmarkProperty.toggle(props)} style={applyStyle({ position: 'absolute', top: 16, right: 16 })} >
          <LibIcon name={isBook ? 'bookmark' : 'bookmark-plus-outline'} color={'#FD5593'} size={30} />
        </Pressable>
      </ImageBackground>
    </Pressable>
  )
}