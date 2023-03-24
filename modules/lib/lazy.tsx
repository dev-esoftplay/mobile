// withHooks
// noPage
import { useSafeState } from 'esoftplay';
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

export interface LibLazyProps {
  children?: any;
}

export default function m(props: LibLazyProps): any {
  const [done, setDone] = useSafeState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setDone(true);
    });
    return () => {
      task.cancel();
    };
  }, []);

  return done ? props.children ?? null : null;
}


