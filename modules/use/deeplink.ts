// useLibs
// noPage
import esp from 'esoftplay/esp';
import { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';

export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: { url: string }) => {
    const { domain, uri, protocol } = esp.config()
    if (url?.includes(defaultUrl || domain))
      esp.mod("lib/utils").debounce(() => {
        url = url.replace((domain + uri), (domain + uri + 'deeplink/'))
        url = url.replace(/^[a-z]+\:\/\//g, protocol + "://")
        function removeLastDot(url: string) {
          if (url.endsWith('.')) {
            url = url.slice(0, -1);
            return removeLastDot(url);
          }
          return url;
        }
        const LibCurl = esp.mod("lib/curl")
        new LibCurl().custom(removeLastDot(url), null,
          (res) => {
            if (res.ok == 1) {
              function nav(module: string, url: string) {
                const LibNavigation = esp.mod("lib/navigation")
                if (!LibNavigation.getIsReady()) {
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
      if (url) {
        doLink({ url: url })
      }
    })()

    Linking.addEventListener('url', doLink);
    return () => Linking.removeAllListeners('url')
  }, [])
}