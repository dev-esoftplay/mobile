// noPage

import React from "react";
import { LibNavigation, useGlobalState, useGlobalReturn } from 'esoftplay';


const initState = {
  lang_id: "id"
}
const state = useGlobalState(initState, { persistKey: 'lib_locale' })

export default class local {

  static state(): useGlobalReturn<any> {
    return state
  }

  static setLanguage(langId: string): void {
    state.set({ lang_id: langId })
    LibNavigation.reset()
  }
}
