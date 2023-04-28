// withHooks

import useGlobalState from 'esoftplay/global';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import SpInAppUpdates, { IAUInstallStatus, IAUUpdateKind, NeedsUpdateResponse, StartUpdateOptions, StatusUpdateEvent } from 'sp-react-native-in-app-updates';


export interface LibAuto_updateArgs {

}
export interface LibAuto_updateProps {

}


const HIGH_PRIORITY_UPDATE = 5;
const stateOtherData = useGlobalState<any>(null)
const stateNeedsUpdate = useGlobalState<boolean>(false)
const stateError = useGlobalState('')


export function startUpdating() {
  checkForUpdates()
}

export function checkForUpdates() {
  const inAppUpdates = new SpInAppUpdates(true)
  inAppUpdates.checkNeedsUpdate().then((result: NeedsUpdateResponse) => {
    stateNeedsUpdate.set(result.shouldUpdate)
    stateOtherData.set(result)
    if (result.shouldUpdate) {
      doUpdate()
    }
  }).catch((e) => {
    stateError.set(e)
  })
}

function doUpdate() {
  const inAppUpdates = new SpInAppUpdates(true)

  const onStatusUpdate = (status: StatusUpdateEvent) => {
    if (status.status === IAUInstallStatus.DOWNLOADED) {
      inAppUpdates.installUpdate();
      inAppUpdates.removeStatusUpdateListener(finalStatus => { });
    }
  }

  if (!!stateNeedsUpdate?.get()) {
    let updateOptions: StartUpdateOptions = {};
    if (Platform.OS === 'android' && stateOtherData.get()) {
      if (stateOtherData.get()?.updatePriority >= HIGH_PRIORITY_UPDATE) {
        updateOptions = {
          updateType: IAUUpdateKind.IMMEDIATE,
        };
      } else {
        updateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE,
        };
      }
    }
    inAppUpdates.addStatusUpdateListener(onStatusUpdate);
    inAppUpdates.startUpdate(updateOptions)
  }
}

export default function m(props: LibAuto_updateProps): any {

  useEffect(() => {
    checkForUpdates()
  }, [])

  return null
}