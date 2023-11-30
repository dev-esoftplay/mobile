// useLibs

import { runOnJS, runOnUI } from "react-native-reanimated";

export interface UseWorkerProps {

}

export default function m(func: (args: any[]) => void): (args: any[], callback: (res: any) => void) => void {
  return (args: any[], callback: (res: any) => void) => {
    function clbk(out: any) {
      "worklet"
      runOnJS(callback)(out)
    }
    function run() {
      "worklet"
      clbk(func(args))
    }
    runOnUI(run)()
  }
}