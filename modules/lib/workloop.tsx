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
_global.workloopRef = React.createRef<WebView>()
export default class m extends LibComponent<LibWorkloopProps, LibWorkloopState> {
  isReady = false

  // constructor(props: LibWorkloopProps) {
  //   super(props)
  // }

  html = `
  <!DOCTYPE html>
  <html></html>
  `

  static execNextTix(func: Function, params?: any[]): void {
    _global.workloopTasks.push([func, params])
    if (_global.workloopHasTask == false) {
      _global.workloopHasTask = true
      _global.workloopRef.current?.injectJavaScript(`
      var stop = false
      var next
      if (typeof next == Function) {
        next()
      } else {
        next = () => {
          setTimeout(() => {
            if (!stop){
              window.ReactNativeWebView.postMessage('next')
              next()
            }
          }, 500)
        }
        next()
      }
      `)
    }
  }

  static onMessage(e: any): void {
    if (_global.workloopHasTask) {
      InteractionManager.runAfterInteractions(() => {
        const ctask = _global?.workloopTasks?.[0]
        if (ctask) {
          if (ctask.length == 2) {
            ctask[0](...ctask[1])
          } else {
            ctask[0]()
          }
          _global.workloopTasks = _global.workloopTasks.slice(1, _global.workloopTasks.length)
          if (_global.workloopTasks.length == 0) {
            _global.workloopHasTask = false
            _global.workloopRef.current?.injectJavaScript(`var stop = true`)
          }
        }
      })
    }
  }

  render(): any {
    return (
      <View style={{ height: 0, width: 0 }} >
        <WebView
          ref={_global.workloopRef}
          style={{ width: 0, height: 0 }}
          javaScriptEnabled={true}
          originWhitelist={["*"]}
          source={{ html: this.html }}
          onMessage={m.onMessage}
        />
      </View>
    )
  }
}