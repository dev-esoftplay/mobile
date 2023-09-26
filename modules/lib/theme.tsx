// noPage
// withObject
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';

import AsyncStorage from '@react-native-async-storage/async-storage';
const { colorPrimary, colorAccent } = LibStyle

const state = useGlobalState({ theme: 'light' }, { persistKey: 'lib_theme' })

export default {
  setTheme(themeName: string): void {
    state.set({ theme: themeName })
    LibNavigation.reset()
    AsyncStorage.setItem('theme', themeName)
  },
  _barStyle(): string {
    return this.colors(['dark', 'light'])
  },
  _colorPrimary(): string {
    return this.colors([colorPrimary, colorPrimary])
  },
  _colorAccent(): string {
    return this.colors([colorAccent, colorAccent])
  },
  _colorHeader(): string {
    return this.colors(['#3E50B4', '#292B37'])
  },
  _colorHeaderText(): string {
    return this.colors(['white', 'white'])
  },
  _colorButtonPrimary(): string {
    return this.colors(['#3E50B4', '#3E50B4'])
  },
  _colorButtonTextPrimary(): string {
    return this.colors(['white', 'white'])
  },
  _colorButtonSecondary(): string {
    return this.colors(['#3E50B4', '#3E50B4'])
  },
  _colorButtonTextSecondary(): string {
    return this.colors(['white', 'white'])
  },
  _colorButtonTertiary(): string {
    return this.colors(['#3E50B4', '#3E50B4'])
  },
  _colorButtonTextTertiary(): string {
    return this.colors(['white', 'white'])
  },
  _colorBackgroundPrimary(): string {
    return this.colors(['white', '#202529'])
  },
  _colorBackgroundSecondary(): string {
    return this.colors(['white', '#202529'])
  },
  _colorBackgroundTertiary(): string {
    return this.colors(['white', '#202529'])
  },
  _colorBackgroundCardPrimary(): string {
    return this.colors(['white', '#2B2F38'])
  },
  _colorBackgroundCardSecondary(): string {
    return this.colors(['white', '#2B2F38'])
  },
  _colorBackgroundCardTertiary(): string {
    return this.colors(['white', '#2B2F38'])
  },
  _colorTextPrimary(): string {
    return this.colors(['#353535', 'white'])
  },
  _colorTextSecondary(): string {
    return this.colors(['#666666', 'white'])
  },
  _colorTextTertiary(): string {
    return this.colors(['#999999', 'white'])
  },
  colors(colors: string[]): string {
    const _themeName = state.get().theme
    const _themes: string[] = esp.config('theme');
    const _themeIndex = _themes.indexOf(_themeName);
    if (_themeIndex <= _themes.length - 1 && _themeIndex <= colors.length - 1)
      return colors[_themeIndex];
    else
      return colors[0];
  }
}