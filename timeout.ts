import { useEffect } from "react";

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
  const smartTimeout = createTimeout();

  useEffect(() => {
    return () => smartTimeout.clear();
  }, [smartTimeout]);

  return smartTimeout.set;
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
  const smartInterval = createInterval();

  useEffect(() => {
    return () => smartInterval.clear();
  }, [smartInterval]);

  return smartInterval.set;
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
  const smartDebounce = createDebounce();

  useEffect(() => {
    return () => smartDebounce.clear();
  }, [smartDebounce]);

  return smartDebounce.set;
}
