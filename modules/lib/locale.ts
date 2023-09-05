// noPage
// withObject
import { useGlobalReturn } from 'esoftplay';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import useGlobalState from 'esoftplay/global';
import { NativeModules, Platform } from 'react-native';


const state = useGlobalState("id", { persistKey: 'lib_locale_lang', loadOnInit: true })
const lang = useGlobalState({}, { persistKey: 'lib_locale_lang_data', inFile: true, loadOnInit: true })

export default {
  state(): useGlobalReturn<any> {
    return state
  },
  stateLang(): useGlobalReturn<any> {
    return lang
  },
  setLanguageData(langId: string, data: any) {
    lang.set(LibObject.set(lang.get(), data)(langId))
  },
  setLanguage(langId: string): void {
    LibNavigation.reset()
    state.set(langId)
  },
  getDeviceLanguange(): string {
    const appLanguage =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

    const fixAppLanguage = appLanguage.search(/-|_/g) !== -1 ? appLanguage.slice(0, 2) : appLanguage;
    let def = fixAppLanguage == 'in' ? 'id' : fixAppLanguage
    return def
  }
}
