// withHooks

import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibLoading } from 'esoftplay/cache/lib/loading/import';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { UserData } from 'esoftplay/cache/user/data/import';
import FastStorage from 'esoftplay/mmkv';
import useSafeState from 'esoftplay/state';
import React, { ReactElement, useEffect } from 'react';
import { Text } from 'react-native';


export interface LibCurl_viewArgs {

}

export interface LibCurl_viewProps {
  url: string;
  post?: any;
  cache?: boolean;
  isUserData?: boolean;
  onSuccess?: (res: any, message: string) => ReactElement;
  onError?: (err: any, retry: Function) => ReactElement;
  onLoading?: ReactElement;
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/curl_view.md) untuk melihat dokumentasi*/
export default function m(props: LibCurl_viewProps): any {

  let key = ""
  let initialData: any = undefined
  if (props.cache) {

    key = "curl-view" + LibUtils.shorten(props.url + JSON.stringify(props.post))
    if (props.isUserData) {
      UserData.register(key)
    }
    try {
      initialData = JSON.parse(FastStorage.getItemSync(key))
    } catch (error) { }
  }

  const [data, setData] = useSafeState(initialData)

  function fetchData() {
    new LibCurl(props.url, props.post, (result, message) => {
      if (props.cache) {
        FastStorage.setItem(key, JSON.stringify({ result, message }))
      }
      setData({ result, message, ok: 1 })
    }, (err) => {
      setData(err)
    })
  }

  function retry() {
    setData(initialData)
    fetchData()
  }

  useEffect(fetchData, []);

  if (!data) {
    return props.onLoading ? props.onLoading : <LibLoading />
  }
  if (data.ok == 1)
    return props.onSuccess ? props.onSuccess(data.result, data.message) : null
  return props.onError ? props.onError(data, retry) : <Text>{data?.message}</Text>
}