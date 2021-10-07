// withHooks
// noPage

import React, { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { useSafeState } from 'esoftplay';


export interface LibLazyProps {
  children?: any
}
export default function m(props: LibLazyProps): any {
  const [done, setDone] = useSafeState(false)

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => setDone(true))
  }, [])

  if (!done)
    return null
  return props.children || null
}