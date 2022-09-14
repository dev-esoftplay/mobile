// withHooks
// noPage
import { useSafeState } from 'esoftplay';

import { useEffect } from 'react';
import { InteractionManager } from 'react-native';


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