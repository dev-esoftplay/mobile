// withHooks

import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, PixelRatio, Dimensions } from 'react-native';
import { LibNavigation, LibStyle, LibUtils, LibZom, LibIcon, LibStatusbar, useSafeState, esp, LibTextstyle } from 'esoftplay';
import * as ImageManipulator from "expo-image-manipulator";
// @ts-ignore
import PinchZoomView from 'react-native-pinch-zoom-view-movable';
const { width } = Dimensions.get('window')


export interface LibImage_cropProps {

}
export default function m(props: LibImage_cropProps): any {
  const { image, ratio, forceCrop } = LibUtils.getArgsAll(props)
  const [_image, setImage] = useSafeState(image)
  const [counter, setCounter] = useSafeState(0)
  const [size, setSize] = useSafeState(LibStyle.width)
  const [cropCount, setCropCount] = useSafeState(0)

  const _ratio = ratio && ratio.includes(":") ? ratio.split(":") : [3, 2]
  const maxRatio = Math.max(_ratio)
  const marginTop = 60 + LibStyle.STATUSBAR_HEIGHT
  const viewRef = useRef<any>(null)
  const imageRef = useRef<any>(null)


  const minimalRatioSize = (LibStyle.width / size).toFixed(1) == (_ratio[0] / _ratio[1]).toFixed(1) ? LibStyle.width : Math.min(LibStyle.width, size)

  let ratioSize = [minimalRatioSize, minimalRatioSize]
  if (maxRatio == _ratio[0]) {
    ratioSize[0] = _ratio[0] / _ratio[1] * minimalRatioSize
  } else {
    ratioSize[1] = _ratio[1] / _ratio[0] * minimalRatioSize
  }

  useEffect(() => {
    Image.getSize(_image, (actualWidth, actualHeight) => {
      const h = actualHeight * LibStyle.width / actualWidth
      setSize(h)
    }, () => { })
  }, [_image])


  useEffect(() => {
    return () => LibNavigation.cancelBackResult(LibNavigation.getResultKey(props))
  }, [])

  function reset() {
    setImage(image)
    setCounter(counter + 1)
  }

  function capture() {
    let crop = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      pageX: 0,
      pageY: 0
    }
    let img = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      pageX: 0,
      pageY: 0
    }
    Image.getSize(_image, (actualWidth, actualHeight) => {
      viewRef.current!.measure((...vls: number[]) => {
        crop = {
          x: vls[0],
          y: vls[1],
          width: vls[2],
          height: vls[3],
          pageX: vls[4],
          pageY: vls[5]
        }
        imageRef.current!.measure((...vls: number[]) => {
          img = {
            x: vls[0],
            y: vls[1],
            width: vls[2],
            height: vls[3],
            pageX: vls[4],
            pageY: vls[5]
          }

          const fixPageY = crop.pageY - marginTop
          const scale = actualWidth / img.width
          const totalCropWidth = (crop.pageX + crop.width)
          const totalCropHeight = (fixPageY + crop.height)
          const cropWidth = totalCropWidth > img.width ? img.width - crop.pageX : crop.width
          const cropHeight = totalCropHeight > img.height ? img.height - fixPageY : crop.height

          ImageManipulator.manipulateAsync(
            _image,
            [{
              crop: {
                originX: scale * (crop.pageX > img.width ? 0 : crop.pageX),
                originY: scale * ((fixPageY) > img.height ? 0 : (fixPageY)),
                width: (scale * cropWidth) > 0 ? (scale * cropWidth) : 0,
                height: (scale * cropHeight) > 0 ? (scale * cropHeight) : 0,
              }
            }],
            { compress: 1, format: ImageManipulator.SaveFormat.PNG }
          ).then((x) => {
            if (x.uri) {
              setImage(x.uri)
              setCropCount(cropCount + 1)
            }
          })
        })
      })
    }, () => { })
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }} key={counter}  >
      <LibStatusbar style="light" />
      <Image
        ref={imageRef}
        style={{ resizeMode: "contain", marginTop: marginTop, height: size, width: LibStyle.width }} source={{ uri: _image }} />
      <View style={{ flex: 1, marginTop: -(LibStyle.height - marginTop - (LibStyle.isIphoneX ? 35 : 0)), alignItems: 'center', justifyContent: 'center' }} >
        <PinchZoomView
          key={_image}
          minScale={0.5}
          style={{ backgroundColor: "transparent", flex: undefined, width: LibStyle.height * 100, height: LibStyle.height * 100, alignSelf: 'center', justifyContent: 'center' }}
          maxScale={2}>
          <>
            <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} />
            <View style={{ flexDirection: "row" }} >
              <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} />
              <View ref={viewRef} style={{ height: ratioSize[1], width: ratioSize[0], backgroundColor: 'transparent', borderWidth: 1, borderColor: "white" }} />
              <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} />
            </View>
            <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} />
          </>
        </PinchZoomView>
      </View>
      <View style={{ position: "absolute", top: LibStyle.STATUSBAR_HEIGHT, left: 0, right: 0, height: 50, flexDirection: "row", justifyContent: 'space-between' }} >
        <TouchableOpacity
          onPress={() => LibNavigation.back()}
          style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
          <LibIcon name="close" color={'white'} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }} >
          <TouchableOpacity
            onPress={reset}
            style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
            <LibIcon name="reload" color={'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={capture}
            style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
            <LibIcon name="crop" color={'white'} />
          </TouchableOpacity>
        </View>
      </View>
      {
        (!forceCrop || cropCount > 0) &&
        <View style={{ position: "absolute", bottom: 10, left: 0, right: 0 }} >
          <TouchableOpacity
            onPress={() => {
              Image.getSize(_image, (width, height) => {
                LibNavigation.sendBackResult({ uri: _image, width, height }, LibNavigation.getResultKey(props))
              }, () => { })
            }}
            style={{ height: 50, alignItems: 'center', justifyContent: 'center' }} >
            <LibTextstyle textStyle="body" text="SIMPAN" style={{ color: "white" }} />
          </TouchableOpacity>
        </View>
      }
    </View>
  )
}