// withHooks
// noPage
// withHooks
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import React from 'react';


export interface LibGlobalArgs {

}
export interface LibGlobalProps {
  waitForFinish: boolean,
  waitingView?: any,
  children?: any
}
const globalReady = useGlobalState(false, {
  persistKey: "__globalReady",
  onFinish: () => {
    globalReady.set(true)
  }
})

export default function m(props: LibGlobalProps): any {

  const [ready] = globalReady.useState();
  if (props.waitForFinish) {
    const LibLoading = esp.mod("lib/loading")
    return ready ? props.children : props.waitingView || <LibLoading />
  }
  else
    return props.children
}