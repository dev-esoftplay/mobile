// noPage

import { _global } from 'esoftplay';
import React, { Component } from "react";
import { Platform } from 'react-native';

export interface LibWorkerInit {
  task: string,
  taskId: string,
  result: (res: string) => void
}

export interface LibWorkerProps {
  tasks?: LibWorkerInit[],
}
export interface LibWorkerState {

}

_global.LibWorkerBase = React.createRef()
_global.LibWorkerTasks = new Map()
_global.injectedJavaScripts = []
_global.LibWorkerReady = 0
_global.LibWorkerCount = 0
export default class m extends Component<LibWorkerProps, LibWorkerState> {
  constructor(props: LibWorkerProps) {
    super(props)
  }

  static delete(taskId: string): void {
    _global.LibWorkerTasks.delete(taskId)
  }

  static registerJob(name: string, func: Function): (params: any[], res: (data: any) => void) => void {
    'show source';
    const x = func.toString().replace('function', 'function ' + name)
    _global.injectedJavaScripts.push(x)
    m.dispatch(() => x, '', () => { })
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      if (Platform.OS == 'android')
        if (Platform.Version <= 22) {
          return res(func(...params))
        }
      m.dispatch(
        (id: number) => {
          let _params = params.map((param) => {
            if (typeof param == 'string')
              return `"` + param + `"`
            return param
          })
          return (`window.ReactNativeWebView.postMessage(JSON.stringify({ data: ` + name + `(` + _params.join(", ") + `), id: ` + id + ` }))`)
        }
        , '', res)
    }
  }

  static registerJobAsync(name: string, func: (...fparams: any[]) => Promise<any>): (params: any[], res: (data: any) => void) => void {
    'show source';
    const x = func.toString().replace('function', 'function ' + name)
    _global.injectedJavaScripts.push(x)
    m.dispatch(() => x, '', () => { })
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      if (Platform.OS == 'android')
        if (Platform.Version <= 22) {
          (async () => res(await func(...params)))()
          return
        }

      m.dispatch(
        (id: number) => {
          let _params = params.map((param) => {
            if (typeof param == 'string')
              return `"` + param + `"`
            return param
          })
          return (`(async () => window.ReactNativeWebView.postMessage(JSON.stringify({ data: await ` + name + `(` + _params.join(", ") + `), id: ` + id + ` })))()`)
        }
        , '', res)
    }
  }

  static objToString(data: any): string {
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return JSON.stringify(data)
      }
    return JSON.stringify(JSON.stringify(data)).slice(1, -1);
  }

  static jobAsync(func: (...fparams: any[]) => Promise<any>, params: (string | number | boolean)[], res: (data: any) => void): void {
    'show source';
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        (async () => res(await func(...params)))()
        return
      }
    m.dispatch(
      (id: number) => {
        const nameFunction = func.toString().replace('function', 'function tempFunction')
        let _params = params.map((param) => {
          if (typeof param == 'string')
            return `"` + param + `"`
          return param
        })
        return (`(async () => window.ReactNativeWebView.postMessage(JSON.stringify({ data: await ` + nameFunction + `(` + _params.join(", ") + `), id: ` + id + ` })))()`)
      }
      , '', res)
  }

  static job(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
    'show source';
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return res(func(...params))
      }
    m.dispatch(
      (id: number) => {
        const nameFunction = func.toString().replace('function', 'function tempFunction')
        let _params = params.map((param) => {
          if (typeof param == 'string')
            return `"` + param + `"`
          return param
        })

        const out = nameFunction + `\nwindow.ReactNativeWebView.postMessage(JSON.stringify({ data: tempFunction` + `(` + _params.join(",") + `), id: ` + id + ` }))`
        return out
      }
      , '', res)
  }

  // static image(url: string, toSize: number, result: (r: string) => void): void {
  //   m.dispatch((id) => `imageCompress("` + id + `", "` + url + `", ` + PixelRatio.getPixelSizeForLayoutSize(toSize) + `)`, url, result)
  // }

  static dispatch(task: (id: number) => string, url: string, result: (r: string) => void): void {
    if (_global.LibWorkerReady > 0 && typeof _global.LibWorkerBase?.current?.injectJavaScript == 'function') {
      _global.LibWorkerCount++
      var _task = task(_global.LibWorkerCount)
      _global.LibWorkerTasks.set(String(_global.LibWorkerCount), {
        task: _task,
        result: result
      })
      _global.LibWorkerBase?.current?.injectJavaScript?.(_task)
    } else {
      setTimeout(() => {
        m.dispatch(task, url, result)
      }, 1000);
    }
  }

  static onMessage(withRefName: string): any {
    return (e: any) => {
      if (e.nativeEvent.data == withRefName) {
        _global.LibWorkerReady += 1
        return
      }
      const dt = e.nativeEvent.data
      const x = JSON.parse(dt)
      const itemTask = _global.LibWorkerTasks.get(String(x.id))
      if (itemTask) {
        itemTask.result(x.data)
        m.delete(x.id)
      }
    }
  }

  render(): any {
    return null
  }
}

