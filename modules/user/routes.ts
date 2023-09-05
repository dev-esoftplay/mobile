// noPage
// withObject
import { useGlobalReturn } from 'esoftplay';
import useGlobalState from 'esoftplay/global';

const state = useGlobalState(undefined)

export default {
  state(): useGlobalReturn<any> {
    return state
  },
  set(routes: any): void {
    state.set(routes)
  },
  getCurrentRouteName(): string {
    let lastIdx = state.get()?.routes?.length - 1
    let currentName = state.get()?.routes?.[lastIdx]?.name
    return currentName || 'root'
  }
}