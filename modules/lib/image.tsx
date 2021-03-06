import React from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LibStyle, LibComponent, LibCurl, esp, LibProgress, LibIcon, LibNavigation, useGlobalState } from 'esoftplay';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { SaveFormat } from 'expo-image-manipulator';
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
  editor?: boolean,
}

export interface LibImageState {
  type: any,
  loading: boolean,
  image: any,
  flashLight: 'on' | 'off'
}

export interface LibImageGalleryOptions {
  crop?: LibImageCrop
  editor?: boolean,
  maxDimension?: number,
  multiple?: boolean,
  max?: number
}

export interface LibImageCameraOptions {
  crop?: LibImageCrop
  maxDimension?: number,
  editor?: boolean
}

const initState = {
  show: false,
  image: undefined,
  editor: false,
  maxDimension: 1280
}
const state = useGlobalState(initState)

class m extends LibComponent<LibImageProps, LibImageState> {

  static setResult(image: string): void {
    state.set({
      ...state.get(),
      image: image,
      show: false,
      editor: false,
    })
  }

  static show(editor?: boolean): void {
    state.set({
      ...state.get(),
      show: true,
      image: undefined,
      editor: editor,
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
      const { editor } = this.props
      let result = await this.camera.takePictureAsync({})
      this.setState({ image: result, loading: false })
      if (editor) {
        m.showEditor(result.uri, (d) => {
          this.setState({ image: d, loading: false })
        })
      }
    }
  }

  static showEditor(uri: string, result: (x: any) => void): void {
    LibNavigation.navigateForResult("lib/image_edit", { uri }, 81793).then(result)
  }
  static showCropper(uri: string, forceCrop: boolean, ratio: string, message: string, result: (x: any) => void): void {
    LibNavigation.navigateForResult("lib/image_crop", { image: uri, forceCrop, ratio, message }, 81793).then(result)
  }


  static fromCamera(options?: LibImageCameraOptions): Promise<string> {
    return new Promise((_r) => {
      setTimeout(async () => {
        const cameraPermission = await Permissions.getAsync(Permissions.CAMERA);
        var finalStatus = cameraPermission.status
        if (finalStatus !== 'granted') {
          const { status } = await Permissions.askAsync(Permissions.CAMERA);
          finalStatus = status
        }
        const rollPermission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        finalStatus = rollPermission.status
        if (finalStatus !== 'granted') {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          finalStatus = status
        }
        if (finalStatus != 'granted') {
          Alert.alert(esp.appjson().expo.name + " tidak dapat mengakses kamera ", "Mohon Pastikan anda memberikan izin " + esp.appjson().expo.name + " untuk dapat mengambil foto")
        }
        ImagePicker.launchCameraAsync().then(async (result: any) => {
          if (!result)
            result = ImagePicker?.getPendingResultAsync()
          if (!result?.cancelled) {
            if (options && options.crop) {
              m.showCropper(result?.uri, options?.crop?.forceCrop, options?.crop?.ratio, options?.crop?.message, async (x) => {
                let imageUri = await m.processImage(x, options?.maxDimension)
                m.setResult(imageUri)
                _r(imageUri)
              })
            } else
              if (options && options.editor) {
                m.showEditor(result.uri, async (x) => {
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
        // }
      }, 1);
    })
  }

  static fromGallery(options?: LibImageGalleryOptions): Promise<string | string[]> {
    return new Promise((_r) => {
      setTimeout(async () => {
        const { status } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        var finalStatus = status
        if (finalStatus !== 'granted') {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          finalStatus = status
        }
        if (finalStatus != 'granted') {
          Alert.alert(esp.appjson().expo.name + " tidak dapat mengakses galeri ", "Mohon Pastikan anda memberikan izin " + esp.appjson().expo.name + " untuk dapat mengambil foto")
          return
        }
        let max = 0
        if (options?.multiple == true) {
          max = options?.max || 0
        } else {
          max = 1
        }
        if (max == 1) {
          ImagePicker.launchImageLibraryAsync().then(async (x: any) => {
            if (!x.cancelled) {
              if (options && options.crop) {
                m.showCropper(x.uri, options.crop.forceCrop, options.crop.ratio, options.crop?.message, async (x) => {
                  let imageUri = await m.processImage(x, options?.maxDimension)
                  m.setResult(imageUri)
                  _r(imageUri)
                })
              } else
                if (options?.editor == true) {
                  m.showEditor(x.uri, async (x) => {
                    let imageUri = await m.processImage(x, options?.maxDimension)
                    m.setResult(imageUri)
                    _r(imageUri)
                  })
                  return
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
          if (max == 1 && x.length == 1) {
            if (options && options.crop) {
              m.showCropper(x[0].uri, options.crop.forceCrop, options.crop.ratio, options.crop?.message, async (x) => {
                let imageUri = await m.processImage(x, options?.maxDimension)
                m.setResult(imageUri)
                _r(imageUri)
              })
            } else if (options?.editor == true)
              m.showEditor(x[0].uri, async (x) => {
                let imageUri = await m.processImage(x, options?.maxDimension)
                m.setResult(imageUri)
                _r(imageUri)
              })
            return
          }
          let a: string[] = []
          x.forEach(async (t: any, i) => {
            if (i == 0) {
              LibProgress.show("Mohon Tunggu, Sedang mengunggah foto")
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
              (msg: string) => {
                console.log(msg, "NOOO")
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
        LibProgress.show("Mohon Tunggu, Sedang mengunggah foto")
        var wantedMaxSize = maxDimension || 1280
        var rawheight = result.height
        var rawwidth = result.width
        var ratio = rawwidth / rawheight
        if (rawheight > rawwidth) {
          var wantedwidth = wantedMaxSize * ratio;
          var wantedheight = wantedMaxSize;
        } else {
          var wantedwidth = wantedMaxSize;
          var wantedheight = wantedMaxSize / ratio;
        }

        setTimeout(async () => {
          const manipImage = await ImageManipulator.manipulateAsync(
            result.uri,
            [{ resize: { width: wantedwidth, height: wantedheight } }],
            { format: SaveFormat.JPEG }
          );
          new LibCurl().upload('image_upload', "image", String(manipImage.uri), 'image/jpeg',
            (res: any, msg: string) => {
              r(res);
              LibProgress.hide()
            },
            (msg: string) => {
              LibProgress.hide()
              r(msg);
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
          const { show, editor, maxDimension } = props
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