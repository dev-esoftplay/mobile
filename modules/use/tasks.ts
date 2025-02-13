// useLibs
// noPage

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/tasks.md) untuk melihat dokumentasi*/
export default function m<T>(): (task: (item: T) => Promise<void>, onDone?: () => void) => [(data: T[], success?: ((isSuccess: boolean) => void) | undefined) => void, () => void] {
  let onProcess = false

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/tasks.md#reset) untuk melihat dokumentasi*/
  function reset() {
    onProcess = false;
  }

  return (task: (item: T) => Promise<void>, onDone?: () => void): [(data: T[], success?: (isSuccess: boolean) => void) => void, () => void] => {
    function run(data: any[], cb?: (isSuccess: boolean) => void) {
      if (data.length == 0) {
        if (cb) cb?.(false);
      } else if (onProcess == true) {
        if (cb) cb?.(false);
      } else {
        onProcess = true;
        if (cb) cb?.(true);
        try {
          (async () => {
            for (let i = 0; i < data.length; i++) {
              const item = data[i];
              await task(item);
              if (i == (data.length - 1)) {
                onProcess = false;
                if (onDone)
                  onDone()
              }

            }
          })()
        } catch (err) { }
      }
    };
    return [run, reset]
  }
}
