import React, { createRef } from "react";
import { Component } from "react"
import { WebView } from 'react-native-webview'
import { esp, _global } from 'esoftplay'
import { PixelRatio, Platform, View } from 'react-native';

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

export default (() => {
  let LibWorkerTasks = new Map()
  let injectedJavaScripts = []
  let LibWorkerReady = 0
  let LibWorkerCount = 0
  return class m extends Component<LibWorkerProps, LibWorkerState> {
    constructor(props: LibWorkerProps) {
      super(props)
      this.onMessage = this.onMessage.bind(this);
    }

    static delete(taskId: string): void {
      LibWorkerTasks.delete(taskId)
    }

    // static setData(name: string, data: any): void {
    //   m.dispatch(() => `
    //   if (!_esoftplay) var esoftplay = {};
    //   if (!_esoftplay.LibWorker) var esoftplay.LibWorker = {};
    //   _esoftplay.LibWorker[`+ name + `]=JSON.parse(` + LibWorker.objToString(data) + ')', '', () => { })
    // }

    // static data: any = {}

    static registerJob(name: string, func: Function): (params: any[], res: (data: any) => void) => void {
      const x = func.toString().replace('function', 'function ' + name)
      injectedJavaScripts.push(x)
      m.dispatch(() => x, '', () => { })
      return (params: (string | number | boolean)[], res: (data: string) => void) => {
        if (Platform.OS == 'android' && __DEV__)
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

    static registerJobAsync(name: string, func: Function): (params: any[], res: (data: any) => void) => void {
      const x = func.toString().replace('function', 'function ' + name).replace('\n', `\n\tconst _esoftplay = { LibWorker: { jobOutput: (data) => { window.ReactNativeWebView.postMessage(JSON.stringify({ data: data, id: arguments[arguments.length-1] })) } } }\n\n`)
      injectedJavaScripts.push(x)
      m.dispatch(() => x, '', () => { })
      return (params: (string | number | boolean)[], res: (data: string) => void) => {
        if (Platform.OS == 'android' && __DEV__)
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
            if (!Array.isArray(_params)) _params = []
            _params.push(id)
            return (name + `(` + _params.join(", ") + `)`)
          }
          , '', res)
      }
    }

    static objToString(data: any): string {
      if (Platform.OS == 'android' && __DEV__)
        if (Platform.Version <= 22) {
          return JSON.stringify(data)
        }
      return JSON.stringify(JSON.stringify(data)).slice(1, -1);
    }

    static jobOutput(data: any): void {
      return data
    }

    static jobAsync(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
      if (Platform.OS == 'android' && __DEV__)
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

          const out = nameFunction.replace('\n', `\n\tconst _esoftplay = { LibWorker: { jobOutput: (data) => { window.ReactNativeWebView.postMessage(JSON.stringify({ data: data, id: ` + id + ` })) } } }\n`)
            + `\n` +
            `tempFunction` + `(` + _params.join(",") + `)`
          return out
        }
        , '', res)
    }

    static job(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
      if (Platform.OS == 'android' && __DEV__)
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

    static curl(url: string, options: any, result: (r: any) => void): void {
      function parseObject(obj: any): string {
        let x = ""
        obj.pragma = "no-cache"
        obj.cache = "no-store"
        obj["cache-control"] = "no-store"
        if (obj._post) {
          obj.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
          let post = obj._post
          x = Object.keys(post).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(post[key]);
          }).join('&');
          obj.body = x
        }
        delete obj._post
        x = JSON.stringify(obj)
        return x
      }
      m.dispatch((id) => `
            if (doCurl != undefined) {
              doCurl(` + id + `, "` + url + `", ` + parseObject(options) + `)
            } else {
              function doCurl(id, url, params) {
                fetch(url, params)
                  .then(async (e) => {
                    var r = await e.text();
                    window.ReactNativeWebView.postMessage(JSON.stringify({ data: r, id: id }))
                  })
                  .catch((e) => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ data: e, id: id }))
                  })
              }
              doCurl(` + id + `, "` + url + `", ` + parseObject(options) + `)
            }
            `, url, result)
    }

    static image(url: string, toSize: number, result: (r: string) => void): void {
      m.dispatch((id) => `imageCompress("` + id + `", "` + url + `", ` + PixelRatio.getPixelSizeForLayoutSize(toSize) + `)`, url, result)
    }

    static dispatch(task: (id: number) => string, url: string, result: (r: string) => void): void {
      const _dispatcher = () => {
        if (LibWorkerReady > 0 && typeof _global.LibWorkerBase?.current?.injectJavaScript == 'function') {
          LibWorkerCount++
          var _task = task(LibWorkerCount)
          LibWorkerTasks.set(String(LibWorkerCount), {
            task: _task,
            result: result
          })
          _global.LibWorkerBase?.current?.injectJavaScript?.(_task)
        } else {
          setTimeout(() => { _dispatcher() }, 1000);
        }
      }
      _dispatcher()
    }

    onMessage(e: any): any {
      return (withRefName: string) => {
        if (e.nativeEvent.data == withRefName) {
          LibWorkerReady += 1
          return
        }
        // console.log(e.nativeEvent.data)
        const dt = e.nativeEvent.data
        const x = JSON.parse(dt)
        const itemTask = LibWorkerTasks.get(String(x.id))
        if (itemTask) {
          itemTask.result(x.data)
          m.delete(x.id)
        }
      }
    }

    render(): any {
      if (Platform.OS == 'android' && __DEV__)
        if (Platform.Version <= 22) {
          return null
        }

      return (
        <View style={{ height: 0, width: 0 }} >
          <WebView
            ref={_global.LibWorkerBase}
            style={{ width: 0, height: 0 }}
            javaScriptEnabled={true}
            injectedJavaScript={`\nwindow.ReactNativeWebView.postMessage("BaseWorkerIsReady")\n` + injectedJavaScripts.join('\n') + '\n'}
            originWhitelist={["*"]}
            source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
            onMessage={(e) => this.onMessage(e)('BaseWorkerIsReady')}
          />
        </View>
      )
    }
  }
})()

