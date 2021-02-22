// withHooks

import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
//@ts-ignore
import { ImageManipulator } from 'expo-image-crop'
import { LibUtils, LibNavigation, useSafeState } from 'esoftplay';

export interface LibImage_editProps {

}
export default function m(props: LibImage_editProps): any {
  const { uri } = LibUtils.getArgsAll(props)
  const [show, setShow] = useSafeState(true)
  
  useEffect(() => {
    return () => LibNavigation.cancelBackResult(LibNavigation.getResultKey(props))
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: "#000", position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 10 }} >
      <ImageManipulator
        photo={{ uri }}
        isVisible={show}
        onPictureChoosed={(x: any) => {
          Image.getSize(x.uri, (width, height) => {
            LibNavigation.sendBackResult({ uri: x.uri, width, height }, LibNavigation.getResultKey(props))
          }, () => { })
        }}
        onToggleModal={() => {
          setShow(!show)
          LibNavigation.back()
        }}
      />
    </View>
  )
}