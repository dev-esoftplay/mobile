// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibProgress } from 'esoftplay/cache/lib/progress/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
const { height, width } = LibStyle;


export interface LibImageCrop {
  ratio: string,
  forceCrop: boolean,
  message?: string
}

export interface LibImageProps {
  show?: boolean,
  image?: string,
  maxDimension?: number,
}

export interface LibImageState {
  type: any,
  loading: boolean,
  image: any,
  flashLight: 'on' | 'off'
}

export interface LibImageGalleryOptions {
  crop?: LibImageCrop
  maxDimension?: number,
  multiple?: boolean,
  max?: number
}

export interface LibImageCameraOptions {
  crop?: LibImageCrop
  maxDimension?: number,
}

const initState = {
  show: false,
  image: undefined,
  maxDimension: 1280
}
const state = useGlobalState<LibImageProps>(initState)

class m extends LibComponent<LibImageProps, LibImageState> {

  static setResult(image: string): void {
    state.set({
      ...state.get(),
      image: image,
      show: false,
    })
  }

  static show(): void {
    state.set({
      ...state.get(),
      show: true,
      image: undefined,
    })
  }

  static hide(): void {
    state.set(initState)
  }

  camera: any;
  constructor(props: LibImageProps) {
    super(props);
    this.state = {
      type: Camera.Constants.Type.back,
      loading: false,
      image: null,
      flashLight: 'off'
    }
    this.camera = React.createRef()
    this.takePicture = this.takePicture.bind(this);
  }

  async takePicture(): Promise<void> {
    if (this.camera) {
      this.setState({ loading: true })
      let result = await this.camera.takePictureAsync({})
      this.setState({ image: result, loading: false })
    }
  }


  static showCropper(uri: string, forceCrop: boolean, ratio: string, message: string, result: (x: any) => void): void {
    LibNavigation.navigateForResult("lib/image_crop", { image: uri, forceCrop, ratio, message }, 81793).then(result)
  }

  static fromCamera(options?: LibImageCameraOptions): Promise<string> {
    return new Promise((_r) => {
      setTimeout(async () => {
        const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
        var finalStatus = cameraPermission.status
        if (finalStatus !== 'granted') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          finalStatus = status
        }
        if (finalStatus === 'granted') {
          const rollPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
          finalStatus = rollPermission.status
          if (finalStatus !== 'granted') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            finalStatus = status
          }
        }
        if (finalStatus != 'granted') {
          Alert.alert(esp.lang("lib/image", "cam_title", esp.appjson().expo.name), esp.lang("lib/image", "cam_msg", esp.appjson().expo.name))
        }
        ImagePicker.launchCameraAsync({
          allowsEditing: Platform.OS != 'ios' && options && options.crop ? true : false,
          aspect: options?.crop?.ratio?.split(':').map((x) => Number(x)),
          quality: 1,
          presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
        }).then(async (result: any) => {
          if (!result)
            result = ImagePicker?.getPendingResultAsync()
          if (!result?.cancelled) {
            if (Platform.OS == 'ios' && options && options.crop) {
              m.showCropper(result?.uri, options?.crop?.forceCrop, options?.crop?.ratio, options?.crop?.message, async (x) => {
                let imageUri = await m.processImage(x, options?.maxDimension)
                m.setResult(imageUri)
                _r(imageUri)
              })
            } else {
              let imageUri = await m.processImage(result, options?.maxDimension)
              m.setResult(imageUri)
              _r(imageUri)
            }
          }
        })
      }, 1);
    })
  }

  static fromGallery(options?: LibImageGalleryOptions): Promise<string | string[]> {
    return new Promise((_r) => {
      setTimeout(async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        var finalStatus = status
        if (finalStatus !== 'granted') {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          finalStatus = status
        }
        if (finalStatus != 'granted') {
          Alert.alert(esp.lang("lib/image", "gallery_title"), esp.lang("lib/image", "gallery_msg"))
          return
        }
        let max = 0
        if (options?.multiple == true) {
          max = options?.max || 0
        } else {
          max = 1
        }
        if (max == 1) {
          ImagePicker.launchImageLibraryAsync({
            presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
            allowsEditing: Platform.OS != 'ios' && options && options.crop ? true : false,
            aspect: options?.crop?.ratio?.split(':').map((x) => Number(x)),
            quality: 1,
          }).then(async (x: any) => {
            if (!x.cancelled) {
              if (Platform.OS == 'ios' && options && options.crop) {
                m.showCropper(x.uri, options.crop.forceCrop, options.crop.ratio, options.crop?.message, async (x) => {
                  let imageUri = await m.processImage(x, options?.maxDimension)
                  m.setResult(imageUri)
                  _r(imageUri)
                })
              } else {
                let imageUri = await m.processImage(x, options?.maxDimension)
                m.setResult(imageUri)
                _r(imageUri)
              }
            }
          })
          return
        }
        LibNavigation.navigateForResult("lib/image_multi", { max: max }).then((x: any[]) => {
          let a: string[] = []
          x.forEach(async (t: any, i) => {
            if (i == 0) {
              LibProgress.show(esp.lang("lib/image", "wait"))
            }
            var wantedMaxSize = options?.maxDimension || 1280
            var rawheight = t.height
            var rawwidth = t.width
            var ratio = rawwidth / rawheight
            if (rawheight > rawwidth) {
              var wantedwidth = wantedMaxSize * ratio;
              var wantedheight = wantedMaxSize;
            } else {
              var wantedwidth = wantedMaxSize;
              var wantedheight = wantedMaxSize / ratio;
            }
            const manipImage = await ImageManipulator.manipulateAsync(
              t.uri,
              [{ resize: { width: wantedwidth, height: wantedheight } }],
              { format: SaveFormat.JPEG }
            );
            new LibCurl().upload('image_upload', "image", String(manipImage.uri), 'image/jpeg',
              (res: any, msg: string) => {
                a.push(String(res));
                if (a.length == x.length) {
                  if (max == 1) {
                    _r(res)
                  } else {
                    _r(a)
                  }
                  LibProgress.hide()
                }
              },
              (msg: any) => {
                console.log(msg.message, "NOOO")
                if (x.length - 1 == i)
                  LibProgress.hide()
              }, 1)
          });
        })
      }, 1)
    })
  }

  static processImage(result: any, maxDimension?: number): Promise<string> {
    return new Promise((r) => {
      if (!result.cancelled) {
        LibProgress.show(esp.lang("lib/image", "wait_upload"))
        var wantedMaxSize = maxDimension || 1280
        var rawheight = result.height
        var rawwidth = result.width
        let doResize = false
        if (wantedMaxSize < Math.max(rawheight, rawwidth)) {
          doResize = true
          var ratio = rawwidth / rawheight
          if (rawheight > rawwidth) {
            var wantedwidth = wantedMaxSize * ratio;
            var wantedheight = wantedMaxSize;
          } else {
            var wantedwidth = wantedMaxSize;
            var wantedheight = wantedMaxSize / ratio;
          }
        }

        setTimeout(async () => {
          const manipImage = await ImageManipulator.manipulateAsync(
            result.uri,
            doResize ? [{ resize: { width: wantedwidth, height: wantedheight } }] : [],
            { format: SaveFormat.JPEG, compress: 1.0 }
          );
          new LibCurl().upload('image_upload', "image", String(manipImage.uri), 'image/jpeg',
            (res: any, msg: string) => {
              r(res);
              LibProgress.hide()
            },
            (msg: any) => {
              LibProgress.hide()
              r(msg.message);
            }, 1)
        }, 1);
      }
    })
  }

  render(): any {
    const { image, type, loading, flashLight } = this.state
    return (
      <state.connect
        render={(props) => {
          const { show, maxDimension } = props
          if (!show) return null
          return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} >
              <View style={{ flex: 1 }} >
                <Camera
                  ref={(camera: any) => this.camera = camera}
                  type={type}
                  ratio={'4:3'}
                  flashMode={flashLight}
                  zoom={0.1}
                  style={{ height: LibStyle.width * 4 / 3, width: LibStyle.width }}>
                  <View style={{ height: height, width: width, backgroundColor: 'transparent' }} >
                    {image ? <Image source={image} style={{ height: LibStyle.width * 4 / 3, width: width, resizeMode: 'cover', transform: [{ scaleX: this.state.type == Camera.Constants.Type.back ? 1 : -1 }] }} /> : null}
                  </View>
                </Camera>
                <View style={{ position: 'absolute', top: 10 + LibStyle.STATUSBAR_HEIGHT, left: 10 }} >
                  <TouchableOpacity onPress={() => this.setState({ flashLight: flashLight == 'on' ? 'off' : 'on' })} >
                    <LibIcon color={'white'} size={24} name={flashLight == 'on' ? 'flash' : "flash-off"} />
                  </TouchableOpacity>
                </View>
                <View style={{ position: 'absolute', top: width * 4 / 3, bottom: 0, left: 0, right: 0, justifyContent: 'center', backgroundColor: 'black', alignItems: 'center', flex: 1 }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                      {
                        image ?
                          <TouchableOpacity onPress={() => this.setState({ image: false })} >
                            <LibIcon.Ionicons name='ios-close-circle' style={{ fontSize: 40, color: 'white' }} />
                          </TouchableOpacity>
                          :
                          <TouchableOpacity onPress={() => this.setState({ type: this.state.type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back })} >
                            <LibIcon.Ionicons name='ios-refresh-circle' style={{ fontSize: 40, color: 'white' }} />
                          </TouchableOpacity>
                      }
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                      {
                        image ? null :
                          <TouchableOpacity onPress={() => this.takePicture()} >
                            <View style={{ height: 70, width: 70, borderRadius: 35, backgroundColor: 'black', borderWidth: 1, borderColor: 'white', justifyContent: 'center', 'alignItems': 'center' }} >
                              <View style={{ height: 62, width: 62, borderRadius: 31, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }} >
                                {
                                  loading ? <ActivityIndicator size={'large'} color={'black'} /> : null
                                }
                              </View>
                            </View>
                          </TouchableOpacity>
                      }
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                      {
                        image ?
                          <TouchableOpacity onPress={() => {
                            setTimeout(
                              async () => {
                                let imageUri = await m.processImage(image, maxDimension)
                                m.setResult(imageUri)
                                this.setState({ image: null })
                              });
                          }} >
                            <LibIcon.Ionicons name='ios-checkmark-circle' style={{ fontSize: 40, color: 'white' }} />
                          </TouchableOpacity>
                          :
                          <TouchableOpacity onPress={() => {
                            setTimeout(
                              async () => {
                                m.hide()
                                this.setState({ image: null })
                              });
                          }} >
                            <LibIcon.Ionicons name='ios-close-circle' style={{ fontSize: 40, color: 'white' }} />
                          </TouchableOpacity>
                      }
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        }}
      />
    );
  }
}

export default m