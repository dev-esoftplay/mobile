// withHooks

import { ContentCategory_list, ContentConfig, ContentHeader, ContentItem, ContentItem_header, esp, LibCarrousel, LibInfinite, LibNavigation, LibObject, LibStyle, UserRoutes, useSafeState } from 'esoftplay';
import React, { useRef } from 'react';
import { View } from 'react-native';


export interface ContentListArgs {

}
export interface ContentListProps {

}
export default function m(props: ContentListProps): any {

  const routes = UserRoutes.state().get()

  let { url, title, id } = useRef<any>(LibNavigation.getArgsAll(props)).current
  const conf = esp.config()
  url = url || conf.content
  id = id || 0
  const [data, setData] = useSafeState<any[]>([])
  const [header, setHeader] = useSafeState<any[]>([])

  return (
    <View style={{ flex: 1 }} >
      <ContentHeader backButton={routes?.index != undefined && routes?.index > 0} title={title || esp.appjson()?.expo?.name} searchButton />
      <LibInfinite
        url={url}
        injectData={data}
        ListHeaderComponent={
          <>
            <ContentCategory_list id={id} />
            <LibCarrousel
              autoplay
              bullets
              bulletsContainerStyle={{ justifyContent: 'flex-end', marginRight: 10 }}
              chosenBulletStyle={{ width: 8, height: 4, borderRadius: 2, marginHorizontal: 4 }}
              bulletStyle={{ width: 4, height: 4, borderRadius: 2, marginHorizontal: 4 }}
              style={{ height: 3 / 4 * LibStyle.width }}>
              {header.map(item => <ContentItem_header {...item} />)}
            </LibCarrousel>
          </>
        }
        onResult={(res) => {
          ContentConfig.state().set(LibObject.set(ContentConfig.state().get(), res.config)('list'))
        }}
        onDataChange={(data: any[], page) => {
          if (page == 0) {
            setData(LibObject.splice(data, 0, 4)())
            setHeader(data.slice(0, 4).filter((row) => row.created != 'sponsor'))
          } else {
            setData(data)
          }
        }}
        renderItem={(item) => <ContentItem {...item} />}
      />
    </View>
  )
}