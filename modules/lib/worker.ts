// useLibs
// noPage
import { runOnJS, runOnUI } from "react-native-reanimated";

export interface LibWorkerProps {

}

/* 
const run = LibWorker((arg: any[], cb: (out: any) => void) => {
  "worklet";
  let out = 0
  for (let i = 0; i < arg[0]; i++) {
    out += i
  }
  cb(out)
})
run([99999999], res => {
  setState(res)
})

*/

export default function m(func: (args: any[], cb: (res: any) => void) => void): (args: any[], cb: (res: any) => void) => void {
  return (args: any[], cb: (res: any) => void) => {
    function callback(out: any) {
      "worklet"
      runOnJS(cb)(out)
    }

    function run() {
      "worklet"
      func(args, callback)
    }

    runOnUI(run)()
  }
}