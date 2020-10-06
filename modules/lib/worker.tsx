import React from "react";
import { Component } from "react"
import { WebView } from 'react-native-webview'
import { esp, LibWorker_dataProperty } from 'esoftplay'
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

class m extends Component<LibWorkerProps, LibWorkerState> {
  constructor(props: LibWorkerProps) {
    super(props)
    LibWorker_dataProperty.libWorkerData.LibWorkerBase = React.createRef<WebView>()
    LibWorker_dataProperty.libWorkerData.LibWorkerApi = React.createRef<WebView>()
    LibWorker_dataProperty.libWorkerData.LibWorkerData = React.createRef<WebView>()
    LibWorker_dataProperty.libWorkerData.LibWorkerTasks = new Map()
    LibWorker_dataProperty.libWorkerData.LibWorkerReady = 0
    LibWorker_dataProperty.libWorkerData.LibWorkerCount = 0
    this.renderWorkers = this.renderWorkers.bind(this);
  }

  static delete(taskId: string): void {
    LibWorker_dataProperty.libWorkerData.LibWorkerTasks.delete(taskId)
  }

  static registerJob(name: string, func: Function): (params: any[], res: (data: any) => void) => void {
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      if (Platform.OS == 'android')
        if (Platform.Version <= 22) {
          return res(func(...params))
        }
      m.dispatch(
        (id: string) => {
          const nameFunction = func.toString().replace('function', 'function ' + name)
          let _params = params.map((param) => {
            if (typeof param == 'string')
              return `"` + param + `"`
            return param
          })
          return (
            `if (!` + name + `){\n` +
            nameFunction + `\nwindow.ReactNativeWebView.postMessage(JSON.stringify({ data: ` + name + `(` + _params.join(",") + `), id: ` + id + ` }))` +
            `} else {
               window.ReactNativeWebView.postMessage(JSON.stringify({ data: ` + name + `(` + _params.join(", ") + `), id: ` + id + ` }))` +
            `}`
          )
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

  static jobOutput(data: any): void {
    return data
  }

  static jobAsync(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return res(func(...params))
      }
    m.dispatch(
      (id: string) => {
        const nameFunction = func.toString().replace('function', 'function tempFunction')
        let _params = params.map((param) => {
          if (typeof param == 'string')
            return `"` + param + `"`
          return param
        })

        const out = nameFunction.replace('\n', `\n\tconst _esoftplay = { LibWorker: { jobOutput: (data) => { window.ReactNativeWebView.postMessage(JSON.stringify({ data: data,id: ` + id + `}))}}}\n`)
          + `\n` +
          `tempFunction` + `(` + _params.join(",") + `)`
        return out
      }
      , '', res)
  }

  static job(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return res(func(...params))
      }
    m.dispatch(
      (id: string) => {
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
    if (doCurl != undefined){
      doCurl(` + id + `,"` + url + `",` + parseObject(options) + `)
    } else {
      function doCurl(id, url, params){
        fetch(url, params)
        .then(async (e) => {
          var r = await e.text();
          window.ReactNativeWebView.postMessage(JSON.stringify({ data: r, id: id }))
        })
        .catch((e) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ data: e, id: id }))
        })
      }
      doCurl(` + id + `,"` + url + `",` + parseObject(options) + `)
    }
    `, url, result)
  }

  static image(url: string, toSize: number, result: (r: string) => void): void {
    m.dispatch((id) => `
    if (imageCompress != undefined){
      imageCompress("` + id + `","` + url + `", ` + PixelRatio.getPixelSizeForLayoutSize(toSize) + `)
    } else {
      function imageCompress(id, url, toSize) {
        fetch(url, { mode: 'cors'})
        .then(response => response.blob())
        .then(blob => {
          var reader = new FileReader();
          reader.onload = function () {
            var img = document.createElement('img');
            img.onload = function () {
              var wantedMaxSize = toSize
              var rawheight = img.height
              var rawwidth = img.width
              var ratio = rawwidth / rawheight
              if (rawheight > rawwidth) {
                var wantedwidth = wantedMaxSize * ratio;
                var wantedheight = wantedMaxSize;
              } else {
                var wantedwidth = wantedMaxSize;
                var wantedheight = wantedMaxSize / ratio;
              }
              var canvas = document.createElement('canvas');
              var ctx = canvas.getContext('2d');
              canvas.width = wantedwidth;
              canvas.height = wantedheight;
              ctx.drawImage(this, 0, 0, wantedwidth, wantedheight);
              let x = canvas.toDataURL();
              window.ReactNativeWebView.postMessage(JSON.stringify({ id: id, data: x.replace("data:image/png;base64,", "") }))
            }
            img.src = String(reader.result)
          };
          reader.readAsDataURL(blob);
        });
      }
      
      imageCompress("` + id + `","` + url + `", ` + PixelRatio.getPixelSizeForLayoutSize(toSize) + `)
    }
    `, url, result)
  }

  static dispatch(task: (id: string) => string, url: string, result: (r: string) => void): void {
    const knownUrl = [ // prevent CORS
      esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri"),
      esp.config("protocol") + "://api." + esp.config("domain") + esp.config("uri"),
      esp.config("protocol") + "://data." + esp.config("domain") + esp.config("uri"),
    ]
    const _dispatcher = () => {
      if (LibWorker_dataProperty.libWorkerData.LibWorkerReady == 3) {
        LibWorker_dataProperty.libWorkerData.LibWorkerCount++
        var _task = task(LibWorker_dataProperty.libWorkerData.LibWorkerCount)
        LibWorker_dataProperty.libWorkerData.LibWorkerTasks.set(LibWorker_dataProperty.libWorkerData.LibWorkerCount, {
          task: _task,
          result: result
        })
        if (url == '') {
          let x = [
            LibWorker_dataProperty.libWorkerData.LibWorkerBase.current!,
            LibWorker_dataProperty.libWorkerData.LibWorkerApi.current!,
            LibWorker_dataProperty.libWorkerData.LibWorkerData.current!
          ]
          x[Math.floor(Math.random() * 3)].injectJavaScript(_task)
        }
        if (url.indexOf(knownUrl[0]) > -1)
          LibWorker_dataProperty.libWorkerData.LibWorkerBase.current!.injectJavaScript(_task)
        else if (url.indexOf(knownUrl[1]) > -1)
          LibWorker_dataProperty.libWorkerData.LibWorkerApi.current!.injectJavaScript(_task)
        else
          LibWorker_dataProperty.libWorkerData.LibWorkerData.current!.injectJavaScript(_task)
      } else {
        setTimeout(() => {
          _dispatcher()
        }, 1000);
      }
    }
    _dispatcher()
  }

  renderWorkers(): any {
    let injectedJavaScript = ""
    injectedJavaScript += `
      function imageCompress(id, url, toSize) {
          fetch(url, { mode: 'cors'})
            .then(response => response.blob())
            .then(blob => {
              var reader = new FileReader();
              reader.onload = function () {
                var img = document.createElement('img');
                img.onload = function () {
                  var wantedMaxSize = toSize
                  var rawheight = img.height
                  var rawwidth = img.width
                  var ratio = rawwidth / rawheight
                  if (rawheight > rawwidth) {
                    var wantedwidth = wantedMaxSize * ratio;
                    var wantedheight = wantedMaxSize;
                  } else {
                    var wantedwidth = wantedMaxSize;
                    var wantedheight = wantedMaxSize / ratio;
                  }
                  var canvas = document.createElement('canvas');
                  var ctx = canvas.getContext('2d');
                  canvas.width = wantedwidth;
                  canvas.height = wantedheight;
                  ctx.drawImage(this, 0, 0, wantedwidth, wantedheight);
                  let x = canvas.toDataURL();
                  window.ReactNativeWebView.postMessage(JSON.stringify({ id: id, data: x.replace("data:image/png;base64,", "") }))
                }
                img.src = String(reader.result)
              };
              reader.readAsDataURL(blob);
          });
        }
        function doCurl(id, url, params){
            fetch(url, params)
              .then(async (e) => {
                var r = await e.text();
                alert(r);
                window.ReactNativeWebView.postMessage(JSON.stringify({ data: r, id: id }))
              })
              .catch((e) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ data: e, id: id }))
              })
          }
      `
    const onMessage = (e: any) => (withRefName: string) => {
      if (e.nativeEvent.data == withRefName) {
        LibWorker_dataProperty.libWorkerData.LibWorkerReady += 1
        return
      }
      const dt = e.nativeEvent.data
      const x = JSON.parse(dt)
      if (LibWorker_dataProperty.libWorkerData.LibWorkerTasks.has(x.id)) {
        const itemTask = LibWorker_dataProperty.libWorkerData.LibWorkerTasks.get(x.id)
        itemTask.result(x.data)
        m.delete(x.id)
      }
    }
    return (
      <>
        <WebView
          ref={LibWorker_dataProperty.libWorkerData.LibWorkerBase}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript + `\nwindow.ReactNativeWebView.postMessage("BaseWorkerIsReady")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
          onMessage={(e) => onMessage(e)('BaseWorkerIsReady')}
        />
        <WebView
          ref={LibWorker_dataProperty.libWorkerData.LibWorkerApi}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript + `\nwindow.ReactNativeWebView.postMessage("ApiWorkerIsReady")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://api." + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
          onMessage={(e) => onMessage(e)('ApiWorkerIsReady')}
        />
        <WebView
          ref={LibWorker_dataProperty.libWorkerData.LibWorkerData}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript + `\nwindow.ReactNativeWebView.postMessage("DataWorkerIsReady")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://data." + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
          onMessage={(e) => onMessage(e)('DataWorkerIsReady')}
        />
      </>
    )
  }

  render(): any {
    if (Platform.OS == 'android')
      if (Platform.Version <= 22) {
        return null
      }

    return (
      <View style={{ height: 0, width: 0 }} >
        {this.renderWorkers()}
      </View>
    )
  }
}

export default m