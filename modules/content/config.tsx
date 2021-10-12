// noPage

import { LibComponent, useGlobalReturn, useGlobalState } from 'esoftplay';
export interface ContentConfigProps {
  navigation: any
}
export interface ContentConfigState {

}


const state = useGlobalState({
  list: {
    template: "list.html.php",
    title: "1",
    title_link: "1",
    intro: "1",
    created: "1",
    modified: "1",
    author: "0",
    tag: "1",
    tag_link: "1",
    rating: "1",
    read_more: "1",
    tot_list: "12",
    thumbnail: "1"
  },
  detail: {
    template: "detail.html.php",
    title: "1",
    created: "1",
    modified: 0,
    author: "1",
    tag: "1",
    tag_link: "1",
    rating: "1",
    rating_vote: "1",
    thumbsize: "250",
    comment: 1,
    comment_auto: "1",
    comment_list: "9",
    comment_form: "1",
    comment_emoticons: "1",
    comment_spam: "0",
    comment_email: "1",
    pdf: "1",
    print: "1",
    email: "1",
    share: "1"
  }
}, { persistKey: 'content_config' })


class m extends LibComponent<ContentConfigProps, ContentConfigState> {

  static state(): useGlobalReturn<any> {
    return state
  }

  static setList(config: any): void {
    state.set({
      ...state.get(),
      list: config
    })
  }

  static setDetail(config: any): void {
    state.set({
      ...state.get(),
      detail: config
    })
  }

  render(): any {
    return null
  }
}

export default m;