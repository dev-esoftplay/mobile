import React from "react";
import { LibUtils, esp, LibNavigation } from 'esoftplay';
import AsyncStorage from '@react-native-community/async-storage';

export default class local {

  static initState = {
    lang_id: "id"
  }

  static reducer(state: any, action: any): any {
    if (state == undefined) state = local.initState
    switch (action.type) {
      case "lib_locale_set_id":
        return { ...state, lang_id: action.payload }
      default:
        return state
    }
  }

  static setLanguage(langId: string): void {
    esp.dispatch({
      type: 'lib_locale_set_id',
      payload: langId
    })
    LibNavigation.reset()
    AsyncStorage.setItem('locale', langId)
  }

  static getLanguage(): void {
    AsyncStorage.getItem('locale').then((locale) => {
      if (locale) {
        esp.dispatch({
          type: 'lib_locale_set_id',
          payload: locale
        })
      }
    })
  }
}
