// noPage
// withObject

import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import { NativeModules, Platform } from 'react-native';


const state = useGlobalState("id", { persistKey: 'lib_locale_lang', loadOnInit: true })
const lang = useGlobalState({}, { persistKey: 'lib_locale_lang_data', inFile: true, loadOnInit: true })

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/locale.md) untuk melihat dokumentasi*/
export default {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/locale.md#state) untuk melihat dokumentasi*/
  state(): useGlobalReturn<any> {
    return state
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/locale.md#stateLang) untuk melihat dokumentasi*/
  stateLang(): useGlobalReturn<any> {
    return lang
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/locale.md#setlanguagedatalangid-string-data-any) untuk melihat dokumentasi*/
  setLanguageData(langId: string, data: any) {
    lang.set(LibObject.set(lang.get(), data)(langId))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/locale.md#setlanguagelangid-string) untuk melihat dokumentasi*/
  setLanguage(langId: string): void {
    LibNavigation.reset()
    state.set(langId)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/locale.md#getDeviceLanguange) untuk melihat dokumentasi*/
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
