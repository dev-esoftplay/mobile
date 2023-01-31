import { esp } from "esoftplay";
import _global from "esoftplay/_global";
import React, { useRef } from "react";
import { Platform, View } from 'react-native';
import WebView from "react-native-webview";

_global.WorkerBase = React.createRef()
_global.WorkerTasks = new Map()
_global.injectedJavaScripts = []
_global.WorkerReady = 0
_global.WorkerCount = 0

const Worker = {
  delete(taskId: string) {
    _global.WorkerTasks.delete(taskId)
  },
  useWorker(name: string, func: (...fparams: any[]) => Promise<any>): (params: any[], res: (data: any) => void) => void {
    const ref = useRef(Worker.registerJobAsync(name, func)).current
    return ref
  },
  registerJob(name: string, func: Function): (params: any[], res: (data: any) => void) => void {
    'show source';
    const x = func.toString().replace('function', 'function ' + name)
    _global.injectedJavaScripts.push(x)
    Worker.dispatch(() => x, '', () => { })
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      if (Platform.OS == 'android')
        if (Platform.Version <= 22) {
          return res(func(...params))
        }
      Worker.dispatch(
        (id: number) => {
          let _params = params.map((param) => {
            if (typeof param == 'string')
              return `"` + param + `"`
            return param
          })
          return (`window.ReactNativeWebView.postMessage(JSON.stringify({ data: ` + name + `(` + _params.join(", ") + `), id: ` + id + ` }));true;`)
        }
        , '', res)
    }
  },
  registerJobAsync(name: string, func: (...fparams: any[]) => Promise<any>): (params: any[], res: (data: any) => void) => void {
    'show source';
    const x = func.toString().replace('function', 'function ' + name)
    _global.injectedJavaScripts.push(x)
    Worker.dispatch(() => x, '', () => { })
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      if (Platform.OS == 'android')
        if (Platform.Version <= 22) {
          (async () => res(await func(...params)))()
          return
        }

      Worker.dispatch(
        (id: number) => {
          let _params = params.map((param) => {
            if (typeof param == 'string')
              return `"` + param + `"`
            return param
          })
          return (`(async () => window.ReactNativeWebView.postMessage(JSON.stringify({ data: await ` + name + `(` + _params.join(", ") + `), id: ` + id + ` })))();true;`)
        }
        , '', res)
    }
  },
  objToString(data: any): string {
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return JSON.stringify(data)
      }
    return JSON.stringify(JSON.stringify(data)).slice(1, -1);
  },
  jobAsync(func: (...fparams: any[]) => Promise<any>, params: (string | number | boolean)[], res: (data: any) => void): void {
    'show source';
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        (async () => res(await func(...params)))()
        return
      }
    Worker.dispatch(
      (id: number) => {
        const nameFunction = func.toString().replace('function', 'function tempFunction')
        let _params = params.map((param) => {
          if (typeof param == 'string')
            return `"` + param + `"`
          return param
        })
        return (`(async () => window.ReactNativeWebView.postMessage(JSON.stringify({ data: await ` + nameFunction + `(` + _params.join(", ") + `), id: ` + id + ` })))();true;`)
      }
      , '', res)
  },
  job(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
    'show source';
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return res(func(...params))
      }
    Worker.dispatch(
      (id: number) => {
        const nameFunction = func.toString().replace('function', 'function tempFunction')
        let _params = params.map((param) => {
          if (typeof param == 'string')
            return `"` + param + `"`
          return param
        })

        const out = nameFunction + `\nwindow.ReactNativeWebView.postMessage(JSON.stringify({ data: tempFunction` + `(` + _params.join(",") + `), id: ` + id + ` }));true;`
        return out
      }
      , '', res)
  },
  dispatch(task: (id: number) => string, url: string, result: (r: string) => void): void {
    if (_global.WorkerReady > 0 && typeof _global.WorkerBase?.current?.injectJavaScript == 'function') {
      _global.WorkerCount++
      var _task = task(_global.WorkerCount)
      _global.WorkerTasks.set(String(_global.WorkerCount), {
        task: _task,
        result: result
      })
      _global.WorkerBase?.current?.injectJavaScript?.(_task)
    } else {
      setTimeout(() => {
        Worker.dispatch(task, url, result)
      }, 1000);
    }
  },
  onMessage(withRefName: string): any {
    return (e: any) => {
      if (e.nativeEvent.data == withRefName) {
        _global.WorkerReady += 1
        return
      }
      const dt = e.nativeEvent.data
      const x = JSON.parse(dt)
      const itemTask = _global.WorkerTasks.get(String(x.id))
      if (itemTask) {
        itemTask.result(x.data)
        Worker.delete(x.id)
      }
    }
  },
  Provider(props: any): any {
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return props.children
      }
    return (
      <View style={{ flex: 1 }} >
        <View style={{ height: 0, width: 0 }} >
          <WebView
            ref={_global.WorkerBase}
            style={{ width: 0, height: 0 }}
            javaScriptEnabled={true}
            injectedJavaScript={`\nwindow.ReactNativeWebView.postMessage("BaseWorkerIsReady")\n` + _global.injectedJavaScripts.join('\n') + '\ntrue;'}
            originWhitelist={["*"]}
            source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
            onMessage={Worker.onMessage('BaseWorkerIsReady')}
          />
        </View>
        {props.children}
      </View>
    )
  }
}
export default Worker