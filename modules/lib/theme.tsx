import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { esp, LibUtils, LibStyle, _global } from 'esoftplay';

const { colorPrimary, colorAccent } = LibStyle

export default class m {

  static initState = {
    theme: 'light'
  }

  static reducer(state: any, action: any): any {
    if (state == undefined) state = m.initState
    switch (action.type) {
      case 'lib_theme_switch':
        return {
          ...state,
          theme: action.payload
        }
        break;
      default:
        return state
    }
  }

  static setTheme(themeName: string, navigation: any, isLogin?: any): void {
    esp.dispatch({
      type: 'lib_theme_switch',
      payload: themeName
    })
    LibUtils.navReset(navigation, isLogin)
    AsyncStorage.setItem('theme', themeName)
  }

  static getTheme(): void {
    AsyncStorage.getItem('theme').then((theme) => {
      if (theme) {
        esp.dispatch({
          type: 'lib_theme_switch',
          payload: theme
        })
      }
    })
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
    const _store: any = _global.store.getState();
    const _themeName = _store.lib_theme.theme;
    const _themes: string[] = esp.config('theme');
    const _themeIndex = _themes.indexOf(_themeName);
    if (_themeIndex <= _themes.length - 1 && _themeIndex <= colors.length - 1)
      return colors[_themeIndex];
    else
      return colors[0];
  }
}