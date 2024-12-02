import { useEffect, useRef } from "react";

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/timeout.md#createTimeout) untuk melihat dokumentasi*/
export function createTimeout() {
  let timeoutId: any = undefined;
  function set(callback: Function, delay: number) {
    clear();
    timeoutId = setTimeout(() => {
      callback();
      clear()
    }, delay);
  }

  function clear() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  }

  return { set, clear };
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/timeout.md#useTimeout) untuk melihat dokumentasi*/
export function useTimeout() {
  const smartTimeout = useRef(createTimeout());

  useEffect(() => {
    return () => smartTimeout.current?.clear();
  }, [smartTimeout]);

  return smartTimeout.current?.set;
}


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/timeout.md#createInterval) untuk melihat dokumentasi*/
export function createInterval() {
  let timeoutId: any = undefined;
  function set(callback: Function, delay: number) {
    clear();
    timeoutId = setInterval(() => {
      callback();
    }, delay);
  }

  function clear() {
    if (timeoutId !== undefined) {
      clearInterval(timeoutId);
      timeoutId = undefined;
    }
  }

  return { set, clear };
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/timeout.md#useInterval) untuk melihat dokumentasi*/
export function useInterval() {
  const smartInterval = useRef(createInterval());

  useEffect(() => {
    return () => smartInterval.current?.clear();
  }, [smartInterval]);

  return smartInterval.current?.set;
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/timeout.md#createDebounce) untuk melihat dokumentasi*/
export function createDebounce() {
  let timeoutId: any = undefined;
  function set(callback: Function, delay: number) {
    clear();
    timeoutId = setTimeout(() => {
      callback();
      clear()
    }, delay);
  }

  function clear() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  }

  return { set, clear };
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/timeout.md#useDebounce) untuk melihat dokumentasi*/
export function useDebounce() {
  const smartDebounce = useRef(createDebounce());

  useEffect(() => {
    return () => smartDebounce.current?.clear();
  }, [smartDebounce]);

  return smartDebounce.current?.set;
}
