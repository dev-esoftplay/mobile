import React from "react";
import { Component } from "react"
import { WebView } from 'react-native-webview'
import { esp, _global } from 'esoftplay'
import { connect } from "react-redux";
import { View } from 'native-base';

export interface LibCurl_workerInit {
  task: string,
  taskName: string,
  result: (res: string) => void
}

export interface LibCurl_workerProps {
  tasks?: LibCurl_workerInit[],
}
export interface LibCurl_workerState {

}

_global.LibCurl_worker = React.createRef<WebView>()
_global.LibCurl_workerReady = 0
_global.LibCurl_workerCounter = 0
class Worker extends Component<LibCurl_workerProps, LibCurl_workerState> {

  static initState = {
    tasks: []
  }

  static reducer(state: any, action: any): any {
    if (!state) {
      state = Worker.initState
    }
    switch (action.type) {
      case "lib_curl_worker_add":
        return {
          tasks: [...state.tasks, action.payload]
        }
        break;
      case "lib_curl_worker_del":
        return {
          tasks: state.tasks.filter((value: any) => value.taskName != action.payload)
        }
        break;
      default:
        return state
    }
  }

  static delete(taskName: string): void {
    esp.dispatch({
      type: "lib_curl_worker_del",
      payload: taskName
    })
  }

  static mapStateToProps(state: any): any {
    return {
      tasks: state.lib_curl_worker.tasks
    }
  }

  constructor(props: LibCurl_workerProps) {
    super(props)
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

    const doCurl = () => {
      if (_global.LibCurl_workerReady) {
        _global.LibCurl_workerCounter++
        var _task = `doCurl(` + _global.LibCurl_workerCounter + `,"` + url + `",` + parseObject(options) + `)`;
        esp.dispatch({
          type: "lib_curl_worker_add",
          payload: {
            taskName: _global.LibCurl_workerCounter,
            task: _task,
            result: result
          }
        })
        _global.LibCurl_worker.current!.injectJavaScript(_task)
      } else {
        setTimeout(() => {
          doCurl()
        }, 1000);
      }
    }
    doCurl()
  }

  render(): any {
    const { tasks } = this.props
    return (
      <View style={{ height: 0, width: 0 }} >
        <WebView
          ref={_global.LibCurl_worker}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={`
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
          window.ReactNativeWebView.postMessage(\"WorkerCurlIsReady\")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://api." + esp.config("domain") + esp.config("uri") }}
          onMessage={(e: any) => {
            if (e.nativeEvent.data == 'WorkerCurlIsReady') {
              _global.LibCurl_workerReady = 1
              return
            }
            if (tasks) {
              const x = JSON.parse(e.nativeEvent.data)
              const index = tasks.findIndex((item: LibCurl_workerInit) => item.taskName == x.id)
              if (tasks && index > -1) {
                tasks[index].result(x.data)
                Worker.delete(tasks[index].taskName)
              }
            }
          }}
        />
      </View>
    )
  }
}

export default connect(Worker.mapStateToProps)(Worker)