// useLibs

import { useLazyState } from "esoftplay";
import { useRef } from "react";

export default function m<T>(task: (item: T) => Promise<void>, onDone?: () => void): [(data: T[], success?: (isSuccess: boolean) => void) => void, number] {
  const [counter, setCounter, getCounter] = useLazyState(0)
  const onProcess = useRef(false)

  function run(data: any[], cb?: (isSuccess: boolean) => void) {
    if (onProcess.current == true || data.length == 0) {
      if (cb) cb?.(false);
    } else {
      onProcess.current = true;
      if (cb) cb?.(true);
      setCounter(0)()
      try {
        (async () => {
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            await task(item);
            if (i == (data.length - 1)) {
              if (onDone)
                onDone()
              onProcess.current = false;
            }
            setCounter(getCounter() + 1)()
          }
        })()
      } catch (err) { }
    }
  };

  return [run, counter]
}