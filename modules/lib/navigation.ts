// noPage
// withObject
import { CommonActions, StackActions } from '@react-navigation/native';
import { LibNavigationRoutes } from 'esoftplay';
import { EspArgsInterface } from 'esoftplay/cache/args';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';

import esp from 'esoftplay/esp';
import React, { useEffect } from "react";

export interface LibNavigationInjector {
  args: any,
  children?: any
}

export default {
  _redirect: {},
  _data: {},
  _ref: {},
  _isReady: false,
  setRef(ref: any): void {
    this._ref = ref
  },
  setIsReady(isReady: boolean): void {
    this._isReady = isReady;
  },
  getIsReady(): boolean {
    return this._isReady;
  },
  setNavigation(nav: any): void {
    this._data._navigation = nav
  },
  getArgs(props: any, key: string, defOutput?: any): any {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params?.[key] || defOutput;
  },
  getArgsAll<S extends keyof EspArgsInterface>(props: any, defOutput?: any): EspArgsInterface[S] {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params || defOutput;
  },
  navigation(): any {
    return this._data?._navigation
  },
  setRedirect(func: Function, key?: number) {
    if (!key) key = 1
    this._redirect[key] = { func }
  },
  delRedirect(key?: number) {
    if (!key) key = 1
    delete this._redirect[key]
  },
  redirect(key?: number) {
    if (!key) key = 1
    if (this._redirect?.[key]) {
      const { func } = this._redirect?.[key]
      if (typeof func == 'function')
        func()
      delete this._redirect[key]
    }
  },
  /* <T  EspRouterInterface>(path: T): EspRouterInterface[T] { */
  navigate<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S]): void {
    this._ref?.navigate?.(route, params)
  },
  useBackResult(props: any): (res: any) => void {
    const key = this.getResultKey(props)

    useEffect(() => {
      return () => this.cancelBackResult(key)
    }, [])

    return (res: any) => this.sendBackResult(res, key)
  },
  getResultKey(props: any): number {
    return this.getArgs(props, "_senderKey", 0)
  },
  cancelBackResult(key?: number): void {
    if (!key) {
      key = 1
    }
    try {
      delete this._data[key]
    } catch (error) { }
  },
  sendBackResult(result: any, key?: number): void {
    if (!key) {
      key = 1
    }
    if (this._data[key] != undefined) {
      this._data[key](result)
      delete this._data[key]
    }
    this.back()
  },
  navigateForResult<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S], key?: number): Promise<any> {
    if (!key) {
      key = 1
    }
    return new Promise((r) => {
      if (!params) {
        params = {}
      }
      params['_senderKey'] = key
      if (!this._data.hasOwnProperty(key) && key != undefined) {
        this._data[key] = (value: any) => {
          r(value)
        };
      }
      this.push(route, params)
    })
  },
  replace<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S]): void {
    this._ref.dispatch(
      StackActions.replace(route, params)
    )
  },
  push<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S]): void {
    this._ref?.dispatch?.(
      StackActions.push(
        route,
        params
      )
    )
  },
  reset(route?: LibNavigationRoutes, ...routes: LibNavigationRoutes[]): void {
    const user = UserClass.state().get()
    let _route = [route || esp.config('home', (user && (user.id || user.user_id || user.apikey)) ? 'member' : 'public')]
    if (routes && routes.length > 0) {
      _route = [..._route, ...routes]
    }
    const resetAction = CommonActions.reset({
      index: _route.length - 1,
      routes: _route.map((rn) => ({ name: rn }))
    });
    this._ref?.dispatch?.(resetAction);
  },
  back(deep?: number): void {
    let _deep = deep || 1
    const popAction = StackActions.pop(_deep);
    this._ref?.dispatch?.(popAction)
  },

  /* return `root` on initialRoute otherwise return the route was active  */
  getCurrentRouteName(): string {
    return UserRoutes.getCurrentRouteName()
  },
  isFirstRoute(): boolean {
    return this.getCurrentRouteName() == 'root'
  },
  backToRoot(): void {
    this._ref?.dispatch?.(StackActions.popToTop());
  },
  Injector(props: LibNavigationInjector): any {
    if (!props.children) return null
    return React.cloneElement(props.children, { navigation: { state: { params: props.args } } })
  }
}