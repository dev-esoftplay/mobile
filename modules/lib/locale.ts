// noPage

import { LibNavigation, useGlobalReturn, useGlobalState } from 'esoftplay';


const state = useGlobalState("id", { persistKey: 'lib_locale_lang' })

export default class liblocale {

  static state(): useGlobalReturn<any> {
    return state
  }

  static setLanguage(langId: string): void {
    LibNavigation.reset()
    state.set(langId)
  }
}
