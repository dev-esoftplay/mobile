import React from "react";
import { Component } from "react"
import { WebView } from 'react-native-webview'
import { esp, _global } from 'esoftplay'
import { connect } from "react-redux";
import { View } from 'native-base';
import { PixelRatio } from 'react-native';

export interface LibImage_workerInit {
  task: string,
  taskName: string,
  result: (res: string) => void
}

export interface LibImage_workerProps {
  tasks?: LibImage_workerInit[],
}
export interface LibImage_workerState {

}


_global.LibImage_worker = React.createRef<WebView>()
_global.LibImage_workerReady = 0
_global.LibImage_workerCount = 0
class m extends Component<LibImage_workerProps, LibImage_workerState> {

  static initState = {
    tasks: []
  }

  static reducer(state: any, action: any): any {
    if (!state) {
      state = m.initState
    }
    switch (action.type) {
      case "lib_image_worker_add":
        return {
          tasks: [...state.tasks, action.payload]
        }
        break;
      case "lib_image_worker_del":
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
      type: "lib_image_worker_del",
      payload: taskName
    })
  }

  static mapStateToProps(state: any): any {
    return {
      tasks: state.lib_image_worker.tasks
    }
  }

  constructor(props: LibImage_workerProps) {
    super(props)
  }

  static compress(base64: string, toSize: number, result: (r: string) => void): void {
    const doCurl = () => {
      if (_global.LibImage_workerReady) {
        _global.LibImage_workerCount++
        var _task = `toDataURL("` + _global.LibImage_workerCount + `","` + base64 + `", ` + PixelRatio.getPixelSizeForLayoutSize(toSize) + `)`;
        esp.dispatch({
          type: "lib_image_worker_add",
          payload: {
            taskName: _global.LibImage_workerCount,
            task: _task,
            result: result
          }
        })
        _global.LibImage_worker.current!.injectJavaScript(_task)
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
          ref={_global.LibImage_worker}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={`
          function toDataURL(id, base64, toSize) {
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
            img.src = String(base64)
          }
          window.ReactNativeWebView.postMessage(\"WorkerImageIsReady\")`}
          originWhitelist={["*"]}
          source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") }}
          onMessage={(e: any) => {
            if (e.nativeEvent.data == 'WorkerImageIsReady') {
              _global.LibImage_workerReady = 1
              return
            }
            if (tasks) {
              const x = JSON.parse(e.nativeEvent.data)
              const index = tasks.findIndex((item: LibImage_workerInit) => item.taskName == x.id)
              if (tasks && index > -1) {
                tasks[index].result(x.data)
                m.delete(tasks[index].taskName)
              }
            }
          }}
        />
      </View>
    )
  }
}

export default connect(m.mapStateToProps)(m)