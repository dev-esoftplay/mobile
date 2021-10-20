// withHooks
// noPage

import { LibIcon, LibNavigation, LibStatusbar, LibStyle } from 'esoftplay';
import React from 'react';
import { Pressable, Text, View } from 'react-native';


export interface ContentHeaderArgs {

}
export interface ContentHeaderProps {
  title: string,
  backButton?: boolean
  searchButton?: boolean
}

export default function m(props: ContentHeaderProps): any {
  return (
    <>
      <LibStatusbar style='light' />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingTop: LibStyle.STATUSBAR_HEIGHT_MASTER + 14, paddingHorizontal: 16, backgroundColor: LibStyle.colorPrimary }} >
        {
          props.backButton &&
          <Pressable
            onPress={() => LibNavigation.back()}
            style={{ paddingRight: 16 }}>
            <LibIcon name='arrow-left' color={LibStyle.colorAccent} />
          </Pressable>
        }
        <View style={{ flex: 1 }} >
          <Text style={{  fontSize: 20, fontWeight: "500", lineHeight: 26, color: LibStyle.colorAccent }} >{props?.title}</Text>
          {/* {
            !props.backButton &&
            <Text style={{  fontSize: 14, lineHeight: 20, color: LibStyle.colorAccent }} >{LibUtils.moment(undefined, 'id').format('dddd, DD MMMM YYYY')}</Text>
          } */}
        </View>
        {
          props.searchButton &&
          <Pressable
            onPress={() => LibNavigation.navigate('content/search')}
            style={{ paddingLeft: 16 }}>
            <LibIcon name='magnify' color={LibStyle.colorAccent} />
          </Pressable>
        }
      </View>
    </>
  )
}