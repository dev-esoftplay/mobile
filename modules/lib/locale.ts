// noPage
import { useGlobalReturn } from 'esoftplay';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import useGlobalState from 'esoftplay/global';
import { NativeModules, Platform } from 'react-native';


const state = useGlobalState("id", { persistKey: 'lib_locale_lang' })
const lang = useGlobalState({}, { persistKey: 'lib_locale_lang_data', inFile: true })

export default class m {

  static state(): useGlobalReturn<any> {
    return state
  }

  static stateLang(): useGlobalReturn<any> {
    return lang
  }

  static setLanguageData(langId: string, data: any) {
    lang.set(LibObject.set(lang.get(), data)(langId))
  }

  static setLanguage(langId: string): void {
    LibNavigation.reset()
    state.set(langId)
  }

  static getDeviceLanguange(): string {
    const appLanguage =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

    appLanguage.search(/-|_/g) !== -1 ? appLanguage.slice(0, 2) : appLanguage;
    let def = appLanguage == 'in' ? 'id' : appLanguage
    return def
  }
}
