import { LibCurl, LibNavigation } from 'esoftplay';
// useLibs
import { reportApiError } from '../../error'
import { LibUtils, esp } from 'esoftplay';
import { useCallback, useEffect } from 'react';
import { Linking, Alert } from 'react-native';

export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: any) => {
    const { domain, uri } = esp.config()
    if (url?.includes(defaultUrl || domain))
      LibUtils.debounce(() => {
        url = url.replace((domain + uri), (domain + uri + 'deeplink/'))
        new LibCurl().custom(url, null,
          (res) => {
            if (res.ok == 1)
              LibNavigation.push(res.result.module, { url: res.result.url })
            else {
              Alert.alert('Oops...!', res.message)
            }
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