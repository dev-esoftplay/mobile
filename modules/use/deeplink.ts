// useLibs

import { LibUtils, esp } from 'esoftplay';
import { useCallback, useEffect } from 'react';
import { Linking, Alert } from 'react-native';

export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: any) => {
    if (url?.includes(defaultUrl || esp.config('domain')))
      LibUtils.debounce(() => Alert.alert('Deeplink', url), 500)
  }, [])

  useEffect(() => {
    (async () => {
      const url = await Linking.getInitialURL();
      doLink({ url: url })
    })()

    Linking.addEventListener('url', doLink);
    return () => Linking.removeEventListener('url', doLink)
  }, [])
}