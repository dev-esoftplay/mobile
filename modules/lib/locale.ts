// noPage
import { useGlobalReturn } from 'esoftplay';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import useGlobalState from 'esoftplay/global';


const state = useGlobalState("id", { persistKey: 'lib_locale_lang' })

export default class m {

  static state(): useGlobalReturn<any> {
    return state
  }

  static setLanguage(langId: string): void {
    LibNavigation.reset()
    state.set(langId)
  }
}
