// useLibs
// noPage

import { LibUtils, esp } from 'esoftplay';
import { useCallback, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { LibCurl, LibNavigation, _global } from 'esoftplay';

export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: any) => {
    const { domain, uri } = esp.config()
    if (url?.includes(defaultUrl || domain))
      LibUtils.debounce(() => {
        url = url.replace((domain + uri), (domain + uri + 'deeplink/'))
        new LibCurl().custom(url, null,
          (res) => {
            if (res.ok == 1) {
              function nav(module: string, url: string) {
                if (!_global.NavsIsReady) {
                  setTimeout(() => {
                    nav(module, url)
                  }, 500);
                } else {
                  LibNavigation.push(module, { url: url })
                }
              }
              if (res.result.module)
                nav(res.result.module, res.result.url)
            }
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