// useLibs
// noPage
import { esp } from 'esoftplay';
import _global from 'esoftplay/_global';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';

export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: { url: string }) => {
    const { domain, uri, protocol } = esp.config()
    if (url?.includes(defaultUrl || domain))
      LibUtils.debounce(() => {
        url = url.replace((domain + uri), (domain + uri + 'deeplink/'))
        url = url.replace(/^[a-z]+\:\/\//g, protocol + "://")
        function removeLastDot(url: string) {
          if (url.substr(url.length - 1, 1) == '.') {
            url = url.substring(0, url.length - 1)
            return removeLastDot(url)
          }
          return url
        }
        new LibCurl().custom(removeLastDot(url), null,
          (res) => {
            if (res.ok == 1) {
              function nav(module: string, url: string) {
                if (!_global.NavsIsReady) {
                  setTimeout(() => {
                    nav(module, url)
                  }, 500);
                } else {
                  //@ts-nocheck
                  LibNavigation.push(module, { url: url })
                }
              }
              if (res.result.module)
                nav(res.result.module, res.result.url)
            }
            else {
              Alert.alert(esp.lang("use/deeplink", "msg_err"), res.message)
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