//@ts-nocheck

import React from "react";
import { esp, LibUtils, LibNavigation_dataProperty, LibNavigationRoutes } from 'esoftplay';
import { CommonActions, StackActions } from '@react-navigation/native';


// var _navigator: any = React.createRef()
// var _navigation: any
// var _backResult: any = {}
// var _task: any = {}


export interface LibNavigationInjector {
  args: any,
  children?: any
}

export default class m {
  static setRef(ref: any): void {
    LibNavigation_dataProperty.libNavigationRef = ref
  }

  static setNavigation(nav: any): void {
    LibNavigation_dataProperty.libNavigationData._navigation = nav
  }

  static navigation(): any {
    return LibNavigation_dataProperty.libNavigationData._navigation
  }

  static navigate<S>(route: LibNavigationRoutes, params?: S): void {
    LibNavigation_dataProperty.libNavigationRef.navigate(route, params)
  }

  static getResultKey(props: any): number {
    return LibUtils.getArgs(props, "_senderKey", 0)
  }

  static cancelBackResult(key?: number): void {
    if (!key) {
      key = 1
    }
    try { delete LibNavigation_dataProperty.libNavigationData[key] } catch (error) { }
  }

  static sendBackResult(result: any, key?: number): void {
    if (!key) {
      key = 1
    }
    if (LibNavigation_dataProperty.libNavigationData[key] != undefined) {
      LibNavigation_dataProperty.libNavigationData[key](result)
      delete LibNavigation_dataProperty.libNavigationData[key]
    }
    m.back()
  }

  static navigateForResult<S>(route: LibNavigationRoutes, params?: S, key?: number): Promise<any> {
    if (!key) {
      key = 1
    }
    return new Promise((r) => {
      if (!params) {
        params = {}
      }
      params['_senderKey'] = key
      if (!LibNavigation_dataProperty.libNavigationData.hasOwnProperty(key)) {
        LibNavigation_dataProperty.libNavigationData[key] = (value: any) => {
          r(value)
        };
      }
      m.navigate(route, params)
    })
  }

  static replace<S>(routeName: LibNavigationRoutes, params?: S): void {
    LibNavigation_dataProperty.libNavigationRef.dispatch(
      StackActions.replace(routeName, params)
    )
  }

  static push<S>(routeName: LibNavigationRoutes, params?: S): void {
    LibNavigation_dataProperty.libNavigationRef.dispatch(
      StackActions.push(
        routeName,
        params
      )
    )
  }

  static reset(routeName?: LibNavigationRoutes, ...routeNames: LibNavigationRoutes[]): void {
    setTimeout(() => {
      const user = LibUtils.getReduxState('user_class')
      let _routeName = [routeName || esp.config('home', (user && (user.id || user.user_id)) ? 'member' : 'public')]
      if (routeNames && routeNames.length > 0) {
        _routeName = [..._routeName, ...routeNames]
      }
      const resetAction = CommonActions.reset({
        index: _routeName.length - 1,
        routes: _routeName.map((rn) => ({ name: rn }))
      });
      LibNavigation_dataProperty.libNavigationRef.dispatch(resetAction);
    }, 0);
  }

  static back(deep?: number): void {
    let _deep = deep || 1
    const popAction = StackActions.pop(_deep);
    LibNavigation_dataProperty.libNavigationRef.dispatch(popAction)
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
    try {
      LibNavigation_dataProperty.libNavigationRef.dispatch(StackActions.popToTop());
    } catch (error) {
    }
  }

  static Injector(props: LibNavigationInjector): any {
    if (!props.children) return null
    return React.cloneElement(props.children, { navigation: { state: { params: props.args } } })
  }
}