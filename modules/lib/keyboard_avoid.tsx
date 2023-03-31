// withHooks
// noPage

import NavigationContainerRefContext from '@react-navigation/core/src/NavigationContainerRefContext';
import NavigationContext from '@react-navigation/core/src/NavigationContext';
import type { NavigationProp } from '@react-navigation/core/src/types';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';


export interface LibKeyboard_avoidProps {
  children?: any,
  style?: any
}
export default function m(props: LibKeyboard_avoidProps): any {

  // const isFocussed = useIsFocused();

  // const Custom = isFocussed ? KeyboardAvoidingView : View

  return (
    <KeyboardAvoidingView behavior={Platform.OS == 'android' ? 'height' : 'padding'} style={[{ flex: 1 }, props.style]} >
      {props.children}
    </KeyboardAvoidingView>
  )
}


/**
 * Hook to access the navigation prop of the parent screen anywhere.
 *
 * @returns Navigation prop of the parent screen.
 */
function useNavigation<T = NavigationProp<ReactNavigation.RootParamList>>(): T {
  const root = React.useContext(NavigationContainerRefContext);
  const navigation = React.useContext(NavigationContext);

  if (navigation === undefined && root === undefined) {

  }
  return (navigation ?? root) as unknown as T;
}

function useIsFocused(): boolean {
  const navigation = useNavigation();

  const forceTrue = useRef(false)

  if (navigation == undefined) {
    forceTrue.current = true
  }

  const [isFocused, setIsFocused] = useState(navigation?.isFocused);

  const valueToReturn = !!navigation?.isFocused?.();

  if (isFocused !== valueToReturn) {
    setIsFocused(valueToReturn);
  }

  React.useEffect(() => {
    const unsubscribeFocus = navigation?.addListener?.('focus', () =>
      setIsFocused(true)
    );

    const unsubscribeBlur = navigation?.addListener?.('blur', () =>
      setIsFocused(false)
    );

    return () => {
      unsubscribeFocus?.();
      unsubscribeBlur?.();
    };
  }, [navigation]);

  React.useDebugValue(valueToReturn);

  return (forceTrue.current || valueToReturn);
}
