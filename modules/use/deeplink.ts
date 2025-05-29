// useLibs
// noPage
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/deeplink.md#params) untuk melihat dokumentasi*/
export const params = useGlobalState<any>(undefined)
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/deeplink.md) untuk melihat dokumentasi*/
export default function m(defaultUrl?: string): void {
  const doLink = useCallback(({ url }: { url: string }) => {
    const { domain, uri, protocol } = esp.config()
    if (url?.includes(defaultUrl || domain))
      esp.mod("lib/utils").debounce(() => {
        url = url.replace((domain + uri), (domain + uri + 'deeplink/'))
        url = url.replace(/^[a-z]+\:\/\//g, protocol + "://")
        function removeLastDot(url: string) {
          if (url.endsWith('.')) {
            url = url.substring(0, url.length - 1)
            return removeLastDot(url)
          }
          return url
        }
        new (esp.mod("lib/curl"))().custom(removeLastDot(url), null,
          (res) => {
            if (res.ok == 1) {
              params.set(res.result.params)
              function nav(module: string, url: string, action: any) {
                if (!esp.mod("lib/navigation").getIsReady()) {
                  setTimeout(() => {
                    nav(module, url, action)
                  }, 500);
                } else {
                  const [cmodule] = module.split("#")
                  if (cmodule == "" || cmodule == "bigbang/index" || cmodule == "home") {
                    // Alert.alert("SSS", JSON.stringify(action.scroll))
                    if (action?.tab)
                      esp.modProp("bigbang/index").setTab(action.tab || 0)
                    if (action?.scroll)
                      esp.modProp("bigbang/main").scrollToIndex(action.scroll)
                  } else {
                    //@ts-ignore
                    esp.mod("lib/navigation").push(cmodule, { url: url, action: res.result.action })
                  }
                }
              }
              if (res.result.module)
                nav(res.result.module, res.result.url, res.result.action)
            } else {
              Alert.alert(esp.lang("use/deeplink", "msg_err"), res.message)
            }
          }
        )
      }, 500)
  }, [])

  useEffect(() => {
    (async () => {
      const url = await Linking.getInitialURL();
      if (url)
        doLink({ url: url })
    })()

    Linking.addEventListener('url', doLink);
    return () => Linking.removeAllListeners('url')
  }, [])
}