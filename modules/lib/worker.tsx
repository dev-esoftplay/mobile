// withHooks
import esp from 'esoftplay/esp';
import useGlobalSubscriber from 'esoftplay/subscribe';
import { createTimeout } from 'esoftplay/timeout';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

export interface LibUseworkerArgs {

}
export interface LibUseworkerProps {

}

const subs = useGlobalSubscriber()

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/worker.md#createTask) untuk melihat dokumentasi*/
export function createTask(functionName: string, ...params: string[]): (res: (data: string) => void) => void {
  return (res: (data: string) => void) => {
    subs.trigger({
      functionName,
      params,
      res
    })
  }
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/worker.md) untuk melihat dokumentasi*/
export default function m(props: LibUseworkerProps): any {
  let ref = useRef<WebView>(null)
  let isReady = useRef<number>(0)
  let workerIds = useRef<number>(1)
  let tasks = useRef(new Map())

  const dispatch = (task: (id: number) => string, result: (r: string) => void): void => {
    if (isReady.current > 0 && typeof ref.current?.injectJavaScript == 'function') {
      const idx = workerIds.current
      const _task = task(idx)
      tasks.current.set(String(idx), {
        task: _task,
        result: result
      })
      ref.current?.injectJavaScript(_task)
      workerIds.current = idx + 1
    } else {
      createTimeout().set(() => {
        dispatch(task, result)
      }, 1000)
    }
  }

  useEffect(() => {
    try {
      ref.current?.injectJavaScript(`\n${require('./out')}\n`)
    } catch (error) {

    }
  }, [])

  subs.useSubscribe(() => {
    const { functionName, params, res } = subs.getValue()
    dispatch((id: number) => `
    (async () => {
      const dt = await ${functionName}(${params.map((x: string) => JSON.stringify(x)).join(", ")});
      window.ReactNativeWebView.postMessage(JSON.stringify({
        data: dt,
        id: ${id}
      }))
    })();`, res)
  })

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/worker.md#deleteTask) untuk melihat dokumentasi*/
  const deleteTask = (taskId: string): void => {
    tasks.current.delete(String(taskId))
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/worker.md#onMessage) untuk melihat dokumentasi*/
  const onMessage = (withRefName: string): any => {
    return (e: any) => {
      if (e.nativeEvent.data == withRefName) {
        isReady.current = 1
        return
      }
      const dt = e.nativeEvent.data
      const x = JSON.parse(dt)
      const itemTask = tasks.current.get(String(x.id))
      if (itemTask) {
        itemTask.result(x.data)
        deleteTask(x.id)
      }
    }
  }

  return (
    <View style={{ height: 0, width: 0 }} >
      <WebView
        ref={ref}
        style={{ height: 0, width: 0 }}
        incognito
        javaScriptEnabled={true}
        injectedJavaScript={`\nwindow.ReactNativeWebView.postMessage("BaseWorkerIsReady")\n${require('./out')}\n`}
        originWhitelist={["*"]}
        source={{ uri: esp.config("protocol") + "://" + esp.config("domain") + esp.config("uri") + "dummyPageToBypassCORS" }}
        onMessage={onMessage('BaseWorkerIsReady')}
      />
    </View>
  )
}

