// noPage
// withObject
import { CommonActions, StackActions } from '@react-navigation/native';
import { LibNavigationRoutes } from 'esoftplay';
import { EspArgsInterface } from 'esoftplay/cache/args';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { EspRouterInterface } from 'esoftplay/cache/routers';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';

import esp from 'esoftplay/esp';
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';
import React, { useEffect } from "react";

export interface LibNavigationTabConfigReturn<S extends keyof EspArgsInterface> {
  activeIndex: number,
  defaultIndex: number,
  modules: EspRouterInterface[S][]
}

export interface LibNavigationInjector {
  args: any,
  children?: any
}

export const lastArgs = useGlobalState(undefined, { persistKey: "lib/navigation/lastargs" })

function logArgs(params: any) {
  lastArgs.set(params)
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md) untuk melihat dokumentasi*/
export default {
  _redirect: {} as any,
  _data: {} as any,
  _ref: {} as any,
  _isReady: false,
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#setRef) untuk melihat dokumentasi*/
  setRef(ref: any): void {
    this._ref = ref
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#setIsReady) untuk melihat dokumentasi*/
  setIsReady(isReady: boolean): void {
    this._isReady = isReady;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#getIsReady) untuk melihat dokumentasi*/
  getIsReady(): boolean {
    return this._isReady;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#setNavigation) untuk melihat dokumentasi*/
  setNavigation(nav: any): void {
    this._data._navigation = nav
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#getArgs) untuk melihat dokumentasi*/
  getArgs(props: any, key: string, defOutput?: any): any {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params?.[key] || defOutput;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#getArgsAll) untuk melihat dokumentasi*/
  getArgsAll<S extends keyof EspArgsInterface>(props: any, defOutput?: any): EspArgsInterface[S] {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params || defOutput;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#navigation) untuk melihat dokumentasi*/
  navigation(): any {
    return this._data?._navigation
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#setRedirect) untuk melihat dokumentasi*/
  setRedirect(func: Function, key?: number) {
    if (!key) key = 1
    this._redirect[key] = { func }
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#delRedirect) untuk melihat dokumentasi*/
  delRedirect(key?: number) {
    if (!key) key = 1
    delete this._redirect[key]
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#redirect) untuk melihat dokumentasi*/
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
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#navigate) untuk melihat dokumentasi*/
  navigate<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S]): void {
    logArgs(params)
    this._ref?.navigate?.(replaceModuleByUrlParam(params, route), params)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#navigateTab) untuk melihat dokumentasi*/
  navigateTab<S extends keyof EspArgsInterface>(route: S, tabIndex: number, params?: EspArgsInterface[S]): void {
    logArgs(params)
    this._ref?.navigate?.(replaceModuleByUrlParam(params, route), params)
    setTimeout(() => {
      const TabConfig = esp.modProp(replaceModuleByUrlParam(params, route))?.TabConfig;
      if (TabConfig) {
        TabConfig.set(esp.mod("lib/object").set(TabConfig.get(), tabIndex)('activeIndex'))
      } else {
        console.error("TabConfig not found or exported in module " + route);
      }
    }, 100);
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#createTabConfig) untuk melihat dokumentasi*/
  createTabConfig<S extends keyof EspArgsInterface>(modules: S[], defaultIndex?: number): useGlobalReturn<LibNavigationTabConfigReturn<S>> {
    const viewModules = modules.map((string: S) => esp.mod(string))
    const tabConfig = useGlobalState({ activeIndex: defaultIndex || 0, defaultIndex: defaultIndex || 0, modules: viewModules })
    return tabConfig
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#useTabConfigState) untuk melihat dokumentasi*/
  useTabConfigState<S extends keyof EspArgsInterface>(tabConfig: useGlobalReturn<LibNavigationTabConfigReturn<S>>) {
    const [tabConfigState] = tabConfig.useState()
    useEffect(() => {
      return () => {
        tabConfig.set(esp.mod("lib/object").set(tabConfig.get(), tabConfig.get().defaultIndex)('activeIndex'))
      }
    }, [])
    return tabConfigState
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#useBackResult) untuk melihat dokumentasi*/
  useBackResult(props: any): (res: any) => void {
    const key = this.getResultKey(props)
    useEffect(() => {
      return () => this.cancelBackResult(key)
    }, [])

    return (res: any) => this.sendBackResult(res, key)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#getResultKey) untuk melihat dokumentasi*/
  getResultKey(props: any): number {
    return this.getArgs(props, "_senderKey", 0)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#cancelBackResult) untuk melihat dokumentasi*/
  cancelBackResult(key?: number): void {
    if (!key) {
      key = 1
    }
    try {
      delete this._data[key]
    } catch (error) { }
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#sendBackResult) untuk melihat dokumentasi*/
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
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#navigateForResult) untuk melihat dokumentasi*/
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
      logArgs(params)
      this.push(replaceModuleByUrlParam(params, route), params)
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#replace) untuk melihat dokumentasi*/
  replace<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S]): void {
    logArgs(params)
    this._ref.dispatch(
      StackActions.replace(replaceModuleByUrlParam(params, route), params)
    )
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#push) untuk melihat dokumentasi*/
  push<S extends keyof EspArgsInterface>(route: S, params?: EspArgsInterface[S]): void {
    logArgs(params)
    this._ref?.dispatch?.(
      StackActions.push(
        replaceModuleByUrlParam(params, route),
        params
      )
    )
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#reset) untuk melihat dokumentasi*/
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
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#back) untuk melihat dokumentasi*/
  back(deep?: number): void {
    let _deep = deep || 1
    const popAction = StackActions.pop(_deep);
    this._ref?.dispatch?.(popAction)
  },

  /* return `root` on initialRoute otherwise return the route was active  */
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#getCurrentRouteName) untuk melihat dokumentasi*/
  getCurrentRouteName(): string {
    return UserRoutes.getCurrentRouteName()
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#isFirstRoute) untuk melihat dokumentasi*/
  isFirstRoute(): boolean {
    return this.getCurrentRouteName() == 'root'
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#backToRoot) untuk melihat dokumentasi*/
  backToRoot(): void {
    this._ref?.dispatch?.(StackActions.popToTop());
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/navigation.md#Injector) untuk melihat dokumentasi*/
  Injector(props: LibNavigationInjector): any {
    if (!props.children) return null
    return React.cloneElement(props.children, { navigation: { state: { params: props.args } } })
  }
}

function replaceModuleByUrlParam<S extends keyof EspArgsInterface>(params: any, defaultModule: S) {
  let module = defaultModule
  logArgs(params)
  if (params?.url) {
    const urlParams = LibUtils.getUrlParams(params.url)
    if (urlParams?.module && urlParams?.url?.includes?.(".")) {
      module = urlParams.module?.replace(/\./g, '/')
    }
  }
  return module
}