// noPage
// withObject
import { CommonActions, StackActions } from '@react-navigation/native';
import { LibNavigationRoutes } from 'esoftplay';
import _global from 'esoftplay/_global';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';
import esp from 'esoftplay/esp';
import React from "react";

export interface LibNavigationInjector {
  args: any,
  children?: any
}

let libNavigationData: any = {}
let libNavigationRedirect: any = {}
export default {
  setRef(ref: any): void {
    _global.libNavigationRef = ref
  },
  setNavigation(nav: any): void {
    libNavigationData._navigation = nav
  },
  getArgs(props: any, key: string, defOutput?: any): any {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params?.[key] || defOutput;
  },
  getArgsAll<S>(props: any, defOutput?: any): S {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params || defOutput;
  },
  navigation(): any {
    return libNavigationData?._navigation
  },
  setRedirect(func: Function, key?: number) {
    if (!key) key = 1
    libNavigationRedirect = {
      ...libNavigationRedirect,
      [key]: { func }
    }
  },
  delRedirect(key?: number) {
    if (!key) key = 1
    delete libNavigationRedirect[key]
  },
  redirect(key?: number) {
    if (!key) key = 1
    if (libNavigationRedirect?.[key]) {
      const { func } = libNavigationRedirect?.[key]
      if (typeof func == 'function')
        func()
      delete libNavigationRedirect[key]
    }
  },
  navigate<S>(route: LibNavigationRoutes, params?: S): void {
    _global.libNavigationRef?.navigate?.(route, params)
  },
  getResultKey(props: any): number {
    return this.getArgs(props, "_senderKey", 0)
  },
  cancelBackResult(key?: number): void {
    if (!key) {
      key = 1
    }
    try {
      delete libNavigationData[key]
    } catch (error) { }
  },
  sendBackResult(result: any, key?: number): void {
    if (!key) {
      key = 1
    }
    if (libNavigationData[key] != undefined) {
      libNavigationData[key](result)
      delete libNavigationData[key]
    }
    this.back()
  },
  navigateForResult<S>(route: LibNavigationRoutes, params?: S | any, key?: number): Promise<any> {
    if (!key) {
      key = 1
    }
    return new Promise((r) => {
      if (!params) {
        params = {}
      }
      params['_senderKey'] = key
      if (!libNavigationData.hasOwnProperty(key) && key != undefined) {
        libNavigationData[key] = (value: any) => {
          r(value)
        };
      }
      this.push(route, params)
    })
  },
  replace<S>(route: LibNavigationRoutes, params?: S): void {
    _global.libNavigationRef.dispatch(
      StackActions.replace(route, params)
    )
  },
  push<S>(route: LibNavigationRoutes, params?: S): void {
    _global.libNavigationRef?.dispatch?.(
      StackActions.push(
        route,
        params
      )
    )
  },
  reset(route?: LibNavigationRoutes, ...routes: LibNavigationRoutes[]): void {
    const user = UserClass.state().get()
    let _route = [route || esp.config('home', (user && (user.id || user.user_id)) ? 'member' : 'public')]
    if (routes && routes.length > 0) {
      _route = [..._route, ...routes]
    }
    const resetAction = CommonActions.reset({
      index: _route.length - 1,
      routes: _route.map((rn) => ({ name: rn }))
    });
    _global.libNavigationRef?.dispatch?.(resetAction);
  },
  back(deep?: number): void {
    let _deep = deep || 1
    const popAction = StackActions.pop(_deep);
    _global.libNavigationRef?.dispatch?.(popAction)
  },

  /* return `root` on initialRoute otherwise return the route was active  */
  getCurrentRouteName(): string {
    return UserRoutes.getCurrentRouteName()
  },
  isFirstRoute(): boolean {
    return this.getCurrentRouteName() == 'root'
  },
  backToRoot(): void {
    _global.libNavigationRef?.dispatch?.(StackActions.popToTop());
  },
  Injector(props: LibNavigationInjector): any {
    if (!props.children) return null
    return React.cloneElement(props.children, { navigation: { state: { params: props.args } } })
  }
}