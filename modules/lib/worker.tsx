import React from "react";
import { Component } from "react"
import { WebView } from 'react-native-webview'
import { esp, _global, LibEffect } from 'esoftplay'
import { connect } from "react-redux";
import { View } from 'native-base';
import { PixelRatio, InteractionManager } from 'react-native';

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


_global.LibWorkerBase = React.createRef<WebView>()
_global.LibWorkerApi = React.createRef<WebView>()
_global.LibWorkerData = React.createRef<WebView>()
_global.LibWorkerTasks = []

_global.LibWorkerReady = 0
_global.LibWorkerCount = 0
class m extends Component<LibWorkerProps, LibWorkerState> {

  static delete(taskId: string): void {
    _global.LibWorkerTasks = _global.LibWorkerTasks.filter((value: any) => value.taskId != taskId)
  }

  constructor(props: LibWorkerProps) {
    super(props)
    this.renderWorkers = this.renderWorkers.bind(this);
  }

  static curl(url: string, options: any, result: (r: any) => void): void {
    function parseObject(obj: any): string {
      let x = ""
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
        fetch(url)
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
                window.ReactNativeWebView.postMessage(JSON.stringify({ id: id, data: x }))
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

      if (_global.LibWorkerReady == 3) {
        _global.LibWorkerCount++
        var _task = task(_global.LibWorkerCount)
        _global.LibWorkerTasks.push({
          taskId: _global.LibWorkerCount,
          task: _task,
          result: result
        })
        if (url.indexOf(knownUrl[0]) > -1)
          _global.LibWorkerBase.current!.injectJavaScript(_task)
        else if (url.indexOf(knownUrl[1]) > -1)
          _global.LibWorkerApi.current!.injectJavaScript(_task)
        else
          _global.LibWorkerData.current!.injectJavaScript(_task)
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
          fetch(url)
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
                  window.ReactNativeWebView.postMessage(JSON.stringify({ id: id, data: x }))
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
      const tasks = _global.LibWorkerTasks
      if (e.nativeEvent.data == withRefName) {
        _global.LibWorkerReady += 1
        return
      }
      if (tasks) {
        const x = JSON.parse(e.nativeEvent.data)
        const index = tasks.findIndex((item: LibWorkerInit) => item.taskId == x.id)
        // if (!x.data.includes("data:image/png;base64"))
        if (tasks && index > -1) {
          tasks[index].result(x.data)
          m.delete(tasks[index].taskId)
        }
      }
    }
    return (
      <>
        <WebView
          ref={_global.LibWorkerBase}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript + `\nwindow.ReactNativeWebView.postMessage("BaseWorkerIsReady")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") }}
          onMessage={(e) => onMessage(e)('BaseWorkerIsReady')}
        />
        <WebView
          ref={_global.LibWorkerApi}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript + `\nwindow.ReactNativeWebView.postMessage("ApiWorkerIsReady")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://api." + esp.config("domain") + esp.config("uri") }}
          onMessage={(e) => onMessage(e)('ApiWorkerIsReady')}
        />
        <WebView
          ref={_global.LibWorkerData}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript + `\nwindow.ReactNativeWebView.postMessage("DataWorkerIsReady")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://data." + esp.config("domain") + esp.config("uri") }}
          onMessage={(e) => onMessage(e)('DataWorkerIsReady')}
        />
      </>
    )
  }

  render(): any {
    return (
      <View style={{ height: 0, width: 0 }} >
        {this.renderWorkers()}
      </View>
    )
  }
}

export default m