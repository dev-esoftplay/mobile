import React from "react";
import { esp, LibUtils, _global } from 'esoftplay';
import { StackActions, NavigationActions } from 'react-navigation';

// var _navigator: any = React.createRef()
// var _navigation: any
// var _backResult: any = {}
// var _task: any = {}

export default class m {
  static setRef(ref: any): void {
    _global._navigator = ref
  }

  static setNavigation(nav: any): void {
    _global._navigation = nav
  }

  static navigation(): any {
    return _global._navigation
  }

  static navigate(route: string, params?: any): void {
    _global._navigator.dispatch(
      NavigationActions.navigate({ routeName: route, params: params })
    )
  }

  static cancelBackResult(key?: number): void {
    if (!key) {
      key = 1000
    }
    _global._backResult[key] = null
  }

  static sendBackResult(result: any, key?: number): void {
    if (!key) {
      key = 1
    }
    if (_global._backResult[key] == undefined) {
      _global._backResult[key] = result
    }
    m.back()
  }

  static navigateForResult(route: string, params?: any, key?: number): Promise<any> {
    if (!key) {
      key = 1
    }
    if (!_global.hasOwnProperty('_backResult')) {
      _global._backResult = {}
    }
    if (!_global.hasOwnProperty('_task')) {
      _global._task = {}
    }
    _global._backResult[key] = undefined
    return new Promise((r) => {
      function checkResult() {
        setTimeout(() => {
          if (_global._backResult[key] == undefined) {
            checkResult()
          } else {
            delete _global._task[key]
            r(_global._backResult[key])
          }
        }, 300);
      }
      if (!params) {
        params = {}
      }
      params['_senderKey'] = key
      m.navigate(route, params)
      if (!_global._task.hasOwnProperty(key)) {
        _global._task[key] = 1;
        checkResult()
      }
    })
  }

  static replace(routeName: string, params?: any): void {
    _global._navigator.dispatch(
      StackActions.replace({
        routeName,
        params
      })
    )
  }

  static push(routeName: string, params?: any): void {
    _global._navigator.dispatch(
      StackActions.push({
        routeName,
        params
      })
    )
  }

  static reset(routeName?: string, ...routeNames: string[]): void {
    const user = LibUtils.getReduxState('user_class')
    let _routeName = [routeName || esp.config('home', (user && (user.id || user.user_id)) ? 'member' : 'public')]
    if (routeNames && routeNames.length > 0) {
      _routeName = [..._routeName, ...routeNames]
    }

    const resetAction = StackActions.reset({
      index: _routeName.length - 1,
      actions: _routeName.map((rn) => NavigationActions.navigate({ routeName: rn }))
    });
    _global._navigator.dispatch(resetAction);
  }

  static back(deep?: number): void {
    let _deep = deep || 1
    const popAction = StackActions.pop({
      n: _deep
    });
    _global._navigator.dispatch(popAction)
  }

  /* return `root` on initialRoute otherwise return the routeName was active  */
  static getCurrentRouteName(): string {
    const routes = LibUtils.getReduxState('user_index')
    let currentRouteName = 'root'
    if (routes.hasOwnProperty('index') && routes.index > 0) {
      currentRouteName = routes.routes[routes.routes.length - 1].routeName
    }
    return currentRouteName
  }

  static isFirstRoute(): boolean {
    return m.getCurrentRouteName() == 'root'
  }

  static backToRoot(): void {
    _global._navigator.dispatch(StackActions.popToTop());
  }

}