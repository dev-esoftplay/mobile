// withHooks

import esp from 'esoftplay/esp';
import useSafeState from 'esoftplay/state';
import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';


export interface LibCustomArgs {

}
export interface LibCustomProps {

}


/**
 *
  json_to_view
  https://api.test.bbo.co.id/main?module=lib.custom&link=https%3A%2F%2Ftest.bbo.co.id%2Fsaya-tidak-bisa-login-akun-bbo_432.htm

  deeplink
  https://api.test.bbo.co.id/main?module=lib.custom&link=bbt%3A%2F%2Ftest.bbo.co.id%2Fjual%2Farcanealley2024
*/
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/custom.md) untuk melihat dokumentasi*/
export default function m(props: LibCustomProps): any {
	const LibCompose = useRef(esp.mod("lib/compose")).current

  const { url, title } = esp.mod("lib/navigation").getArgsAll(props)
  const [schema, setSchema] = useSafeState<any>(null)

  useEffect(() => {
    if (!String(url).startsWith("http")) {
      Linking.openURL(url)
      esp.mod("lib/navigation").back()
    } else {
      new (esp.mod("lib/curl"))(url, null,
        (res, msg) => {
          setSchema(res)
        },
        (err) => {
          esp.modProp("lib/toast").show(err?.message)
          esp.mod("lib/navigation").back()
        }
      )
    }
  }, [])

  if (String(url).startsWith("http") && schema)
    return <LibCompose schema={schema} />
  else
    return null
}