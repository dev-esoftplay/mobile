// withHooks

import { ContentHeader, ContentItem, LibIcon, LibList, LibStyle, useGlobalReturn, useGlobalState } from 'esoftplay';
import React from 'react';
import { Text, View } from 'react-native';


export interface ContentBookmarkArgs {

}
export interface ContentBookmarkProps {

}

export interface ContentBookmarkData {
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
export interface ContentBookmarkType {
  ids: number[],
  data: ContentBookmarkData[]
}


const _state = useGlobalState<ContentBookmarkType>({ data: [], ids: [] }, { persistKey: 'content_bookmark_data' })

export function toggle(row: ContentBookmarkData) {
  let { data, ids } = _state.get()
  const idx = ids.indexOf(Number(row.id))
  if (idx < 0) {
    data.unshift(row)
    ids.unshift(Number(row.id))
  } else {
    data.splice(idx, 1)
    ids.splice(idx, 1)
  }
  _state.set({ data, ids })
}

export function state(): useGlobalReturn<ContentBookmarkType> {
  return _state
}

export default function m(props: ContentBookmarkProps): any {
  const data = _state.useSelector(s => s.data)
  return (
    <View style={{ flex: 1 }} >
      <ContentHeader title="Artikel tersimpan" searchButton />
      <LibList
        data={data}
        ListEmptyComponent={
          <View style={{ height: LibStyle.height - 100, justifyContent: 'center', alignItems: 'center', marginHorizontal: 24 }} >
            <LibIcon name='bookmark-plus-outline' color={"#FD5593"} size={40} />
            <Text style={{  fontSize: 34, marginTop: 10, fontWeight: "500", lineHeight: 40, textAlign: "center", color: "#060606" }} >Artikel belum ada</Text>
            <Text style={{  fontSize: 16, marginTop: 10, lineHeight: 22, textAlign: "center", color: "#686868" }} >Kamu dapat menyimpan artikel untuk dibaca nanti dengan cara klik lambang bookmark</Text>
          </View>
        }
        renderItem={(item) => <ContentItem {...item} />}
      />
    </View>
  )
}