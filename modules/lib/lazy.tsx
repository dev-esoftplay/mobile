// withHooks
// noPage

import useSafeState from 'esoftplay/state';
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

export interface LibLazyProps {
  children?: any;
}

// const renderList = useGlobalState<Function[]>([])
// const useTasks = UseTasks<Function>()

// let timeoutId: NodeJS.Timeout;
// function debounce(cb: () => void, delay: number) {
//   clearTimeout(timeoutId);
//   timeoutId = setTimeout(function () {
//     cb()
//   }, delay);
// }
// let timeoutIdB: NodeJS.Timeout;
// function debounceB(cb: () => void, delay: number) {
//   clearTimeout(timeoutIdB);
//   timeoutIdB = setTimeout(function () {
//     cb()
//   }, delay);
// }

export default function m(props: LibLazyProps): any {
  const [done, setDone] = useSafeState(false);

  useEffect(() => {
    const int = InteractionManager.runAfterInteractions(() => {
      setDone(true)
    })
    return () => int.cancel()
  }, [])

  // const [sync] = useTasks((item) => new Promise((next) => {
  //   InteractionManager.runAfterInteractions(() => {
  //     startTransition(() => {
  //       item(true)
  //       const timer = setTimeout(() => {
  //         next()
  //         clearTimeout(timer)
  //       }, 50);
  //     })
  //   })
  // }))

  // useEffect(() => {
  //   if (done) {
  //     debounceB(() => {
  //       sync(renderList.get())
  //     }, 100);
  //   }
  // }, [done])

  // useEffect(() => {
  //   renderList.set((x) => [...x, setDone])
  //   debounce(() => {
  //     sync(renderList.get())
  //   }, 100);
  //   return () => {
  //     renderList.set((x) => x.filter((c) => c !== setDone))
  //   }
  // }, [])

  return done ? (props.children ?? null) : null;
}


