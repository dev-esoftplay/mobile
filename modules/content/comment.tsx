// withHooks

import { ContentComment_item, ContentHeader, LibCurl, LibIcon, LibInfinite, LibInput, LibKeyboard_avoid, LibNavigation, LibObject, LibSociallogin, LibStyle, LibToastProperty, LibUtils, useGlobalReturn, useGlobalState, useSafeState } from 'esoftplay';
import esp from 'esoftplay/esp';
import React, { useEffect, useRef } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';


export interface ContentCommentArgs {
  id: number | string
}
export interface ContentCommentProps {

}
const _state = useGlobalState<any>(undefined, {
  persistKey: 'content_comment_user',
  listener: (data) => {
    LibSociallogin.setUser(data)
  }
})

export function state(): useGlobalReturn<any> {
  return _state
}

export default function m(props: ContentCommentProps): any {
  const listComment = useRef<LibInfinite>(null)
  const commentInput = useRef<LibInput>(null)
  let { url, url_post, id, par_id, header } = LibNavigation.getArgsAll(props)

  url = useRef(url || esp.config('content') + 'user/commentlist/' + id).current
  url_post = useRef(url_post || esp.config('content') + 'user/commentpost/' + id).current
  let comment = useRef('').current
  const config = esp.config()
  const comment_login = esp.config("comment_login");
  const [headerComment, setHeaderComment] = useSafeState(header)
  const [showLoginForm, setShowLoginForm] = useSafeState(false)
  const [refresher, setRefresher] = useSafeState(1)

  if (par_id) {
    url += url.includes('?') ? '&par_id=' + par_id : '?par_id=' + par_id
    url_post += url_post.includes('?') ? '&par_id=' + par_id : '?par_id=' + par_id
  }

  const [user, setUser] = _state.useState()

  function refresh() {
    if (header) {
      setHeaderComment(LibObject.update(headerComment, (count) => count + 1)('reply'))
    }
    setRefresher(refresher + 1)
    commentInput.current?.setText('')
  }

  useEffect(() => {
    LibSociallogin.getUser(setUser)
  }, [])

  useEffect(() => {
    if (showLoginForm && user) {
      setShowLoginForm(false)
    }
  }, [user])


  function send() {
    if (user) {
      if (comment != '') {
        const post = { ...user, content: comment }
        new LibCurl(url_post, post,
          (res, msg) => {
            refresh()
          },
          (msg) => {
            const success = msg.includes('<div class="alert alert-success" role="alert">')
            if (!success) {
              let _msg = (/<\/span>(.*)<\/div>/g).exec(msg)
              Alert.alert('Komentar gagal dikirim', _msg?.[1])
            } else {
              refresh()
            }
          }
        )
      } else {
        LibToastProperty.show('Cek koment')
      }
    } else {
      if (comment_login == 1 && !user) {
        setShowLoginForm(true)
        LibToastProperty.show('Silahkan login terlebih dahulu')
      }
    }
  }


  if (showLoginForm) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }} >
        <ContentHeader title="Login dengan akun" />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingRight: 16 }} >
          <Text style={{ flex: 1, padding: 10, color: '#606060' }} >{"Silakan login dengan salah satu akun sosial media berikut untuk dapat mengirimkan komentar"}</Text>
          <View style={{ justifyContent: "center" }} >
            <Pressable
              onPress={() => { setShowLoginForm(false) }} >
              <Text style={{ color: LibStyle.colorPrimary }} >{"BATAL"}</Text>
            </Pressable>
          </View>
        </View>
        <LibSociallogin
          url={config.content + "user/commentlogin"}
          onResult={setUser}
        />
      </View>
    )
  }
  let x = (item) => <ContentComment_item url={url} url_post={url_post} {...item} />

  return (
    <View style={{ flex: 1 }} >
      <ContentHeader backButton title="Komentar" />
      <LibKeyboard_avoid
        key={refresher + ''}
        style={{ flex: 1, backgroundColor: '#f9f9f9' }} >
        <LibInfinite
          ref={listComment}
          url={url}
          ListHeaderComponent={
            header &&
            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderLeftWidth: headerComment.par_id > 0 ? 60 : 0, borderLeftColor: '#f9f9f9', borderBottomWidth: 8, borderBottomColor: '#f9f9f9' }} >
              <View style={{ marginTop: 18, marginLeft: 16 }} >
                <Image source={{ uri: headerComment.image }} style={{ height: 50, backgroundColor: '#f8f8f8', width: 50, resizeMode: 'cover', overflow: 'hidden', borderRadius: 25 }} />
              </View>
              <View style={{ flex: 1, paddingVertical: 16, marginHorizontal: 16 }} >
                <Text style={{ fontSize: 10, fontWeight: "500", letterSpacing: 1.5, color: "#686868" }} >{LibUtils.moment(headerComment.date).format('DD MMM YYYY HH:mm').toUpperCase()}</Text>
                <Text style={{ fontSize: 16, fontWeight: "500", lineHeight: 20, color: "#060606", marginTop: 8 }} >{headerComment.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: "500", lineHeight: 20, color: "#606060" }} >{headerComment.content}</Text>
                <Pressable style={{ flexDirection: 'row' }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9, /* backgroundColor: '#f1f1f1', padding: 3, borderRadius: 6 */ }} >
                    <LibIcon.AntDesign name='message1' size={12} color="#ababab" />
                    <Text style={{ fontSize: 12, lineHeight: 16, color: "#ababab", marginLeft: 5 }} >{headerComment.reply} Balasan</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          }
          renderItem={x}
        />
        <View style={{ flexDirection: 'row', backgroundColor: 'white', alignItems: 'center' }} >
          {
            (comment_login == 1) &&
            <Pressable onPress={() => setShowLoginForm(true)} >
              <Image source={{ uri: user?.image }} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#f2f2f2', marginLeft: 16 }} />
            </Pressable>
          }
          <LibInput base
            ref={commentInput}
            placeholder={"Kirim Komentar"}
            onChangeText={(text) => comment = text}
            style={{ flex: 1, minHeight: 40, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#f9f9f9', marginVertical: 5, marginHorizontal: 16 }}
          />
          {
            (!(comment_login == 1 && !user)) &&
            <Pressable
              onPress={() => send()}
              style={{ minHeight: 40, width: 40, marginRight: 16, backgroundColor: LibStyle.colorPrimary, justifyContent: 'center', alignItems: 'center', borderRadius: 20 }} >
              <LibIcon.Ionicons name='md-send' color={LibStyle.colorAccent} />
            </Pressable>
          }
        </View>
      </LibKeyboard_avoid>
    </View>
  )
}