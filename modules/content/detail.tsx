// withHooks

import React, { useEffect, useRef } from 'react';
import { applyStyle, ContentAudio, ContentItem, ContentVideo, LibCurl, LibIcon, LibNavigation, LibScroll, LibStyle, LibUtils, LibWebview, useSafeState } from 'esoftplay';
import { ImageBackground, Linking, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'

export interface ContentDetailArgs {

}
export interface ContentDetailProps {

}
export default function m(props: ContentDetailProps): any {
  const { id, url, title, image, created } = LibUtils.getArgsAll(props)
  const [result, setResult] = useSafeState<any>({ id, url, title, image, created })
  const [isAudioPlaying, setIsAudioPlaying] = useSafeState(false)
  const audioRef = useRef<ContentAudio>(null)

  function loadData() {
    new LibCurl(url, null,
      (res, msg) => {
        setResult(res)
      },
      (msg) => {

      }
    )
  }

  useEffect(() => {
    loadData()
    return () => audioRef.current?.componentWillUnmount()
  }, [])

  const isDownload = result.link != "" && result.type === "download"
  const isAudio = result.code != "" && result.type === "audio"
  const isVideo = result.code != "" && result.type === "video"
  const _images = result?.images?.length > 0 ? result.images : [{ image: result.image }]


  return (
    <>
      <LibScroll
        stickyHeaderIndices={isVideo ? [0] : undefined}
        onRefresh={loadData} style={{ flex: 1 }} >
        {
          isVideo ?
            <>
              <View style={{ backgroundColor: 'black', paddingTop: LibStyle.STATUSBAR_HEIGHT }} >
                <ContentVideo code={result.code} />
              </View>

            </>
            :
            <Pressable onPress={() => LibNavigation.navigate('content/gallery', { images: _images })} >
              <ImageBackground
                source={{ uri: image }}
                style={{ height: LibStyle.height * 0.718, marginBottom: 4, ...LibStyle.elevation(4), width: LibStyle.width, justifyContent: 'flex-end' }}>
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={applyStyle({ padding: 16, paddingTop: 90 })} >
                  {result?.images?.length > 0 && <LibIcon.Ionicons name="copy-outline" color={'white'} size={30} style={{ transform: [{ scaleX: -1 }] }} />}
                  <Text style={applyStyle({ fontFamily: "Roboto_medium", fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "white", textTransform: 'uppercase', marginTop: 12 })} >{LibUtils.moment(result.created, 'id').format('DD MMM YYYY HH:mm')}</Text>
                  <Text style={applyStyle({ fontFamily: "Roboto_medium", fontSize: 34, fontWeight: "500", lineHeight: 40, color: "white", marginTop: 5 })} >{result.title}</Text>
                  <View style={applyStyle({ flexDirection: 'row', marginTop: 5 })} >
                    <View style={applyStyle({ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4, paddingHorizontal: 10, })} >
                      <Text style={applyStyle({ fontFamily: "Roboto", fontSize: 14, lineHeight: 20, color: LibStyle.colorPrimary, })} >{result.created_by_alias}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
        }
        {
          isAudio &&
          <>
            <ContentAudio code={result.code} onStatusChange={setIsAudioPlaying} ref={audioRef} />
            <Pressable onPress={() => audioRef.current?._onPlayPausePressed()} style={{ backgroundColor: '#f8f8f8', borderWidth: 1, borderColor: LibStyle.colorPrimary, borderRadius: 13, padding: 16, margin: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
              <LibIcon.AntDesign name={isAudioPlaying ? 'pause' : 'play'} color={LibStyle.colorPrimary} />
              <Text style={{ fontFamily: "Roboto", fontSize: 16, marginLeft: 16, fontWeight: "500", letterSpacing: 1.2, color: LibStyle.colorPrimary }} >Klik disini untuk memainkan audio</Text>
            </Pressable>
          </>
        }
        {
          isDownload &&
          <Pressable onPress={() => Linking.openURL(result.link)} style={{ backgroundColor: '#f8f8f8', borderWidth: 1, borderColor: LibStyle.colorPrimary, borderRadius: 13, padding: 16, margin: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
            <LibIcon.SimpleLineIcons name='cloud-download' color={LibStyle.colorPrimary} />
            <Text style={{ fontFamily: "Roboto", fontSize: 16, marginLeft: 16, fontWeight: "500", letterSpacing: 1.2, color: LibStyle.colorPrimary }} >Klik disini untuk mengunduh</Text>
          </Pressable>
        }
        {
          isVideo &&
          <View pointerEvents={'none'} style={applyStyle({ padding: 17, paddingVertical: 5 })} >
            <Text style={applyStyle({ fontFamily: "Roboto_medium", fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "#555", textTransform: 'uppercase', marginTop: 12 })} >{LibUtils.moment(result.created, 'id').format('DD MMM YYYY HH:mm')}</Text>
            <Text style={applyStyle({ fontFamily: "Roboto_medium", fontSize: 34, fontWeight: "500", lineHeight: 40, color: "#555", marginTop: 5 })} >{result.title}</Text>
            <View style={applyStyle({ flexDirection: 'row', marginTop: 5 })} >
              <Text style={applyStyle({ fontFamily: "Roboto", fontSize: 14, lineHeight: 20, color: LibStyle.colorPrimary, })} >{result.created_by_alias}</Text>
            </View>
          </View>
        }
        <LibWebview
          source={{ html: result.content }}
          style={{ flex: 1, marginVertical: 20 }}
          onFinishLoad={() => { }}
        />
        <View style={{ alignItems: 'center', borderBottomWidth: 8, borderBottomColor: '#f2f2f2', paddingBottom: 13 }} >
          <Pressable onPress={() => LibNavigation.navigate('content/comment', { id: result.id })} style={{ borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: LibStyle.colorPrimary, }} >
            <Text style={{ fontFamily: "Roboto_medium", fontSize: 14, fontWeight: "500", lineHeight: 18, color: LibStyle.colorAccent }} >KOMENTAR</Text>
          </Pressable>
        </View>
        {
          result?.related?.length > 0 && <Text style={{ fontFamily: "Roboto_medium", fontSize: 20, fontWeight: "500", lineHeight: 26, color: "#060606", marginLeft: 16, marginBottom: 13, marginTop: 20 }} >Artikel Terkait</Text>
        }
        {
          result?.related?.map?.((rel: any, i: number) => {
            return (<ContentItem key={rel + i} {...rel} />)
          })
        }
      </LibScroll>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingTop: LibStyle.STATUSBAR_HEIGHT_MASTER + 14, paddingHorizontal: 16 }} >
        <Pressable onPress={() => LibNavigation.back()} style={{ height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }} >
          <LibIcon name='arrow-left' color='white' />
        </Pressable>
        <Pressable onPress={() => LibUtils.share(url.replace('://data.', '://'))} style={{ height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }} >
          <LibIcon name="share" color={'white'} />
        </Pressable>
      </View>
    </>
  )
}