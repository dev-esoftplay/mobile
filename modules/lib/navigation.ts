//@ts-nocheck

import React from "react";
import { UserClass, UserRoutes } from 'esoftplay';
import { esp, LibUtils, LibNavigationRoutes, _global } from 'esoftplay';
import { CommonActions, StackActions } from '@react-navigation/native';

export interface LibNavigationInjector {
  args: any,
  children?: any
}

export default (() => {
  let libNavigationData: any = {}
  let libNavigationRedirect: any = {}
  return class m {
    static setRef(ref: any): void {
      _global.libNavigationRef = ref
    }

    static setNavigation(nav: any): void {
      libNavigationData._navigation = nav
    }

    static navigation(): any {
      return libNavigationData?._navigation
    }

    static setRedirect(func: Function, key?: number) {
      if (!key) key = 1
      libNavigationRedirect = {
        ...libNavigationRedirect,
        [key]: { func }
      }
    }

    static delRedirect(key?: number) {
      if (!key) key = 1
      libNavigationRedirect[key] = undefined
    }

    static redirect(key?: number) {
      if (!key) key = 1
      if (libNavigationRedirect?.[key]) {
        const { func } = libNavigationRedirect?.[key]
        if (typeof func == 'function')
          func()
        libNavigationRedirect[key] = undefined
      }
    }

    static navigate<S>(route: LibNavigationRoutes, params?: S): void {
      _global.libNavigationRef?.navigate?.(route, params)
    }

    static getResultKey(props: any): number {
      return LibUtils.getArgs(props, "_senderKey", 0)
    }

    static cancelBackResult(key?: number): void {
      if (!key) {
        key = 1
      }
      try {
        delete libNavigationData[key] 
      } catch (error) { }
    }

    static sendBackResult(result: any, key?: number): void {
      if (!key) {
        key = 1
      }
      if (libNavigationData[key] != undefined) {
        libNavigationData[key](result)
        delete libNavigationData[key] 
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
        if (!libNavigationData.hasOwnProperty(key)) {
          libNavigationData[key] = (value: any) => {
            r(value)
          };
        }
        m.navigate(route, params)
      })
    }

    static replace<S>(routeName: LibNavigationRoutes, params?: S): void {
      _global.libNavigationRef.dispatch(
        StackActions.replace(routeName, params)
      )
    }

    static push<S>(routeName: LibNavigationRoutes, params?: S): void {
      _global.libNavigationRef?.dispatch?.(
        StackActions.push(
          routeName,
          params
        )
      )
    }

    static reset(routeName?: LibNavigationRoutes, ...routeNames: LibNavigationRoutes[]): void {
      const user = UserClass.state().get()
      let _routeName = [routeName || esp.config('home', (user && (user.id || user.user_id)) ? 'member' : 'public')]
      if (routeNames && routeNames.length > 0) {
        _routeName = [..._routeName, ...routeNames]
      }
      const resetAction = CommonActions.reset({
        index: _routeName.length - 1,
        routes: _routeName.map((rn) => ({ name: rn }))
      });
      _global.libNavigationRef?.dispatch?.(resetAction);
    }

    static back(deep?: number): void {
      let _deep = deep || 1
      const popAction = StackActions.pop(_deep);
      _global.libNavigationRef?.dispatch?.(popAction)
    }

    /* return `root` on initialRoute otherwise return the routeName was active  */
    static getCurrentRouteName(): string {
      return UserRoutes.getCurrentRouteName()
    }

    static isFirstRoute(): boolean {
      return m.getCurrentRouteName() == 'root'
    }

    static backToRoot(): void {
      _global.libNavigationRef?.dispatch?.(StackActions.popToTop());
    }

    static Injector(props: LibNavigationInjector): any {
      if (!props.children) return null
      return React.cloneElement(props.children, { navigation: { state: { params: props.args } } })
    }
  }
})()