import { LibCurl, LibNavigation } from 'esoftplay';
// useLibs

import { LibUtils, esp } from 'esoftplay';
import { useCallback, useEffect } from 'react';
import { Linking, Alert } from 'react-native';

export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: any) => {
    const { domain, uri } = esp.config()
    if (url?.includes(defaultUrl || domain))
      LibUtils.debounce(() => {
        url = url.replace((domain + uri), (domain + uri + 'deeplink/'))
        new LibCurl(url, null,
          (res, msg) => {
            LibNavigation.push(res.module, { url: res.url })
          }, (msg) => {
            Alert.alert('Oops', msg)
          }
        )
      }, 500)
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