// useLibs
import { LibCrypt } from 'esoftplay/cache/lib/crypt/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import useGlobalState from 'esoftplay/global';


export interface LibNotifyItem {
  to: string,
  sound: string,
  title: string,
  body: string,
  data: any,
}
export interface LibNotifyProps {
  notifications: LibNotifyItem[]
}

const state = useGlobalState([], { persistKey: 'lib_notify', inFile: true })

export default function libnotify(res: LibNotifyProps): any {
  if (res.notifications && Array.isArray(res.notifications)) {
    res.notifications.forEach(curl)
  }
}

const curl = (data: LibNotifyItem) => {
  let dData: any = data
  if (!dData.to.includes("ExponentPushToken")) {
    dData['to'] = new LibCrypt().decode(dData.to)
  }
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dData),
  }).then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
      const x = LibObject.push(state.get(), dData)()
      state.set(x)
    });
}
