// noPage
// withObject
import useGlobalState, { useGlobalReturn } from 'esoftplay/global';

const state = useGlobalState(undefined)

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/routes.md) untuk melihat dokumentasi*/
export default {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/routes.md#state) untuk melihat dokumentasi*/
  state(): useGlobalReturn<any> {
    return state
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/routes.md#set) untuk melihat dokumentasi*/
  set(routes: any): void {
    state.set(routes)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/user/routes.md#getCurrentRouteName) untuk melihat dokumentasi*/
  getCurrentRouteName(): string {
    let lastIdx = state.get()?.routes?.length - 1
    let currentName = state.get()?.routes?.[lastIdx]?.name
    return currentName || 'root'
  }
}