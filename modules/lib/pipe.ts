// useLibs  
// noPage

export default function m<T>(input: T) {
  let data: T = input;
  return {
    to: (func: (data: T) => T, log?: (res: T) => void) => {
      data = func(data)
      if (log)
        log?.(data)
      return m(data)
    },
    log: (log: (res: T) => void) => {
      log(data)
      return m(data)
    },
    getValue: () => data
  }
}
