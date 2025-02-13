// useLibs
// noPage

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/pipe.md) untuk melihat dokumentasi*/
export default function m<T>(input: T) {
  let data: T = input;
  return {
    /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/pipe.md#to) untuk melihat dokumentasi*/
    to: (func: (data: T) => T, log?: (res: T) => void) => {
      data = func(data)
      if (log)
        log?.(data)
      return m(data)
    },
    /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/pipe.md#log) untuk melihat dokumentasi*/
    log: (log: (res: T) => void) => {
      log(data)
      return m(data)
    },
    /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/pipe.md#getValue) untuk melihat dokumentasi*/
    getValue: () => data
  }
}
