import React from 'react';
import { InteractionManager, View } from 'react-native';
import { LibComponent, _global } from 'esoftplay';
import { WebView } from 'react-native-webview'

export interface LibWorkloopProps {

}
export interface LibWorkloopState {

}

_global.workloopTasks = []
_global.workloopHasTask = false
export default class m extends LibComponent<LibWorkloopProps, LibWorkloopState> {
  isReady = false
  ref = React.createRef<WebView>()

  constructor(props: LibWorkloopProps) {
    super(props)
  }

  html = `
  <!DOCTYPE html>
  <html></html>
  `

  // static addTimeStop(milisecond: number, func: Function): void {
  //   _global.timeStop.push([milisecond / 1000, func])
  // }

  static execNextTix(func: Function, params?: any[]): void {
    _global.workloopTasks.push([func, params])
    _global.workloopHasTask = true
  }

  static onMessage = (e: any) => {
    if (_global.workloopHasTask) {
      InteractionManager.runAfterInteractions(() => {
        const ctask = _global.workloopTasks[0]
        if (ctask.length == 2) {
          ctask[0](...ctask[1])
        } else {
          ctask[0]()
        }
        _global.workloopTasks = _global.workloopTasks.slice(1, _global.workloopTasks.length)
        if (_global.workloopTasks.length == 0) {
          _global.workloopHasTask = false
        }
      })
    }
  }

  render(): any {
    return (
      <View style={{ height: 0, width: 0 }} >
        <WebView
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          injectedJavaScript={`(function () {
            let times = 0
            function next() {
              setTimeout(() => {
                // times += 1
                window.ReactNativeWebView.postMessage(times)
                next()
              }, `+ 500 + `)
            }
            next()
          })()`}
          originWhitelist={["*"]}
          source={{ html: this.html }}
          onMessage={m.onMessage}
        />
      </View>
    )
  }
}