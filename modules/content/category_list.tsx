// withHooks
// noPage
import { ContentCategoryProperty, esp, LibCurl, LibNavigation, LibPicture } from 'esoftplay';
import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';


export interface ContentCategory_listArgs {

}
export interface ContentCategory_listProps {
  id: number
}
export default function m(props: ContentCategory_listProps): any {
  const { id } = props
  let { url } = useRef<any>(LibNavigation.getArgsAll(props)).current
  const conf = esp.config()
  url = url || conf.content
  const menu = ContentCategoryProperty.state().useSelector(s => s)

  useEffect(() => {
    new LibCurl(url + 'menu', null,
      (res, msg) => {
        ContentCategoryProperty.state().set(res)
      },
      (msg) => {

      }
    )
  }, [])

  if (id == 0)
    return null

  return (
    <View style={{}} >
      <ScrollView horizontal nestedScrollEnabled
        style={{ margin: 0 }} >
        {
          menu?.list?.[0]?.filter?.((row: any) => row.par_id == id).map((row: any) => (
            <Pressable
              onPress={() => { LibNavigation.push('content/list', { url: row.url, title: row.title, id: row.id }) }}
              style={{ borderRadius: 8, flexDirection: 'row', borderWidth: 1, borderColor: "#f2f2f2", margin: 5, padding: 8, alignItems: 'center' }} >
              <LibPicture source={{ uri: row.image }} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
              <Text style={{  marginLeft: 8 }} >{row.title}</Text>
            </Pressable>
          ))
        }
      </ScrollView>
    </View>
  )
}