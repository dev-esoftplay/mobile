// useLibs
// noPage

export default function m<T>(): (task: (item: T) => Promise<void>, onDone?: () => void) => [(data: T[], success?: ((isSuccess: boolean) => void) | undefined) => void] {
  let onProcess = false
  return (task: (item: T) => Promise<void>, onDone?: () => void): [(data: T[], success?: (isSuccess: boolean) => void) => void] => {
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
                if (onDone)
                  onDone()
                onProcess = false;
              }

            }
          })()
        } catch (err) { }
      }
    };
    return [run]
  }
}
