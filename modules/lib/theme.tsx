// noPage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { esp, LibNavigation, LibStyle, useGlobalState } from 'esoftplay';

const { colorPrimary, colorAccent } = LibStyle

const state = useGlobalState({
  theme: 'light'
}, { persistKey: 'lib_theme' })

export default class m {

  static setTheme(themeName: string): void {
    esp.dispatch({
      type: 'lib_theme_switch',
      payload: themeName
    })
    state.set({ theme: themeName })
    LibNavigation.reset()
    AsyncStorage.setItem('theme', themeName)
  }

  static _barStyle(): string {
    return m.colors(['dark', 'light'])
  }

  static _colorPrimary(): string {
    return m.colors([colorPrimary, colorPrimary])
  }
  static _colorAccent(): string {
    return m.colors([colorAccent, colorAccent])
  }
  static _colorHeader(): string {
    return m.colors(['#3E50B4', '#292B37'])
  }
  static _colorHeaderText(): string {
    return m.colors(['white', 'white'])
  }
  static _colorButtonPrimary(): string {
    return m.colors(['#3E50B4', '#3E50B4'])
  }
  static _colorButtonTextPrimary(): string {
    return m.colors(['white', 'white'])
  }
  static _colorButtonSecondary(): string {
    return m.colors(['#3E50B4', '#3E50B4'])
  }
  static _colorButtonTextSecondary(): string {
    return m.colors(['white', 'white'])
  }
  static _colorButtonTertiary(): string {
    return m.colors(['#3E50B4', '#3E50B4'])
  }
  static _colorButtonTextTertiary(): string {
    return m.colors(['white', 'white'])
  }
  static _colorBackgroundPrimary(): string {
    return m.colors(['white', '#202529'])
  }
  static _colorBackgroundSecondary(): string {
    return m.colors(['white', '#202529'])
  }
  static _colorBackgroundTertiary(): string {
    return m.colors(['white', '#202529'])
  }
  static _colorBackgroundCardPrimary(): string {
    return m.colors(['white', '#2B2F38'])
  }
  static _colorBackgroundCardSecondary(): string {
    return m.colors(['white', '#2B2F38'])
  }
  static _colorBackgroundCardTertiary(): string {
    return m.colors(['white', '#2B2F38'])
  }
  static _colorTextPrimary(): string {
    return m.colors(['#353535', 'white'])
  }
  static _colorTextSecondary(): string {
    return m.colors(['#666666', 'white'])
  }
  static _colorTextTertiary(): string {
    return m.colors(['#999999', 'white'])
  }

  static colors(colors: string[]): string {
    const _themeName = state.get().theme
    const _themes: string[] = esp.config('theme');
    const _themeIndex = _themes.indexOf(_themeName);
    if (_themeIndex <= _themes.length - 1 && _themeIndex <= colors.length - 1)
      return colors[_themeIndex];
    else
      return colors[0];
  }
}