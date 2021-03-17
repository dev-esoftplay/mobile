import React from 'react';
import { InteractionManager, View } from 'react-native';
import { LibComponent, _global } from 'esoftplay';
import { WebView } from 'react-native-webview'

export interface LibWorkloopProps {

}
export interface LibWorkloopState {

}


export default (() => {
  let workloopRef = React.createRef<WebView>()
  let workloopTasks = []
  let workloopHasTask = false
  return class m extends LibComponent<LibWorkloopProps, LibWorkloopState> {
    isReady = false

    // constructor(props: LibWorkloopProps) {
    //   super(props)
    // }

    html = `
    <!DOCTYPE html>
    <html></html>
    `

    static execNextTix(func: Function, params?: any[]): void {
      workloopTasks.push([func, params])
      if (workloopHasTask == false) {
        workloopHasTask = true
        workloopRef.current?.injectJavaScript(`
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
      if (workloopHasTask) {
        InteractionManager.runAfterInteractions(() => {
          const ctask = workloopTasks?.[0]
          if (ctask) {
            if (ctask.length == 2) {
              ctask[0](...ctask[1])
            } else {
              ctask[0]()
            }
            workloopTasks = workloopTasks.slice(1, workloopTasks.length)
            if (workloopTasks.length == 0) {
              workloopHasTask = false
              workloopRef.current?.injectJavaScript(`var stop = true`)
            }
          }
        })
      }
    }

    render(): any {
      return (
        <View style={{ height: 0, width: 0 }} >
          <WebView
            ref={workloopRef}
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
})()

