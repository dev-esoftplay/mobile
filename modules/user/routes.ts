// noPage

import { useGlobalReturn, useGlobalState } from 'esoftplay';

const state = useGlobalState(undefined)

export default class m {
  static state(): useGlobalReturn<any> {
    return state
  }

  static set(routes: any): void {
    state.set(routes)
  }

  static getCurrentRouteName(): string {
    let lastIdx = state.get()?.routes?.length - 1
    let currentName = state.get()?.routes?.[lastIdx]?.name
    return currentName || 'root'
  }

}