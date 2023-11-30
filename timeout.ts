import { useEffect, useRef } from "react";

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

export function useTimeout() {
  const smartTimeout = useRef(createTimeout());

  useEffect(() => {
    return () => smartTimeout.current?.clear();
  }, [smartTimeout]);

  return smartTimeout.current?.set;
}


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

export function useInterval() {
  const smartInterval = useRef(createInterval());

  useEffect(() => {
    return () => smartInterval.current?.clear();
  }, [smartInterval]);

  return smartInterval.current?.set;
}

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

export function useDebounce() {
  const smartDebounce = useRef(createDebounce());

  useEffect(() => {
    return () => smartDebounce.current?.clear();
  }, [smartDebounce]);

  return smartDebounce.current?.set;
}
