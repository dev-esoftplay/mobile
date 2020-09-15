import React from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  InteractionManager,
} from 'react-native';
import { Icon } from 'native-base';
import { LibStyle, LibComponent, LibCurl, esp, LibProgress, LibIcon, LibNavigation, LibUtils } from 'esoftplay';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { connect } from 'react-redux';
import { SaveFormat } from 'expo-image-manipulator';
const { height, width } = LibStyle;


export interface LibImageCrop {
  ratio: string,
  forceCrop: boolean
}

export interface LibImageProps {
  show?: boolean,
  image?: string,
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
  multiple?: boolean,
  max?: number
}

export interface LibImageCameraOptions {
  crop?: LibImageCrop
  editor?: boolean
}

class m extends LibComponent<LibImageProps, LibImageState> {
  static initState = {
    show: false,
    image: undefined,
    editor: false
  }

  static reducer(state: any, action: any): any {
    if (state == undefined) state = m.initState
    switch (action.type) {
      case "lib_image_camera_show":
        return {
          ...state,
          show: true,
          image: undefined,
          editor: action.payload
        }
        break;
      case "lib_image_camera_hide":
        return {
          ...state,
          show: false,
          image: undefined,
          editor: false
        }
        break;
      case "lib_image_result":
        return {
          ...state,
          image: action.payload,
          show: false,
          editor: false
        }
        break;
      default:
        return state

    }
  }

  static mapStateToProps(state: any): any {
    return {
      show: state.lib_image.show,
      image: state.lib_image.image,
      editor: state.lib_image.editor,
    }
  }

  static setResult(image: string): void {
    // console.log(image)/
    esp.dispatch({
      type: 'lib_image_result',
      payload: image
    })
  }

  static show(editor?: boolean): void {
    esp.dispatch({
      type: 'lib_image_camera_show',
      payload: editor
    })
  }

  static hide(): void {
    esp.dispatch({
      type: 'lib_image_camera_hide'
    })
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
  static showCropper(uri: string, forceCrop: boolean, ratio: string, result: (x: any) => void): void {
    LibNavigation.navigateForResult("lib/image_crop", { image: uri, forceCrop, ratio }, 81793).then(result)
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
          esp.log('PERMISSION DENIED')
        }

        // if (Platform.OS == 'android') {
        //   m.show(options && options.editor)
        //   async function checkImage(): Promise<string> {
        //     return new Promise(async (__r) => {
        //       setTimeout(async () => {
        //         const state: any = _global.store.getState()
        //         const image = state.lib_image.image
        //         const show = state.lib_image.show
        //         if (image) {
        //           __r(image)
        //         } else if (show) {
        //           __r(await checkImage())
        //         }
        //       }, 300);
        //     })
        //   }
        //   _r(checkImage())
        // } else {
        ImagePicker.launchCameraAsync().then(async (result: any) => {
          if (!result.cancelled) {
            if (options && options.crop) {
              m.showCropper(result.uri, options.crop.forceCrop, options.crop.ratio, async (x) => {
                let imageUri = await m.processImage(x)
                m.setResult(imageUri)
                _r(imageUri)
              })
            } else
              if (options && options.editor) {
                m.showEditor(result.uri, async (x) => {
                  let imageUri = await m.processImage(x)
                  m.setResult(imageUri)
                  _r(imageUri)
                })
              } else {
                let imageUri = await m.processImage(result)
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
          Alert.alert("Oops..!", "PERMISSION DENIED")
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
                m.showCropper(x.uri, options.crop.forceCrop, options.crop.ratio, async (x) => {
                  let imageUri = await m.processImage(x)
                  m.setResult(imageUri)
                  _r(imageUri)
                })
              } else
                if (options?.editor == true) {
                  m.showEditor(x.uri, async (x) => {
                    let imageUri = await m.processImage(x)
                    m.setResult(imageUri)
                    _r(imageUri)
                  })
                  return
                } else {
                  let imageUri = await m.processImage(x)
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
              m.showCropper(x[0].uri, options.crop.forceCrop, options.crop.ratio, async (x) => {
                let imageUri = await m.processImage(x)
                m.setResult(imageUri)
                _r(imageUri)
              })
            } else if (options?.editor == true)
              m.showEditor(x[0].uri, async (x) => {
                let imageUri = await m.processImage(x)
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
            var wantedMaxSize = 780
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

  static processImage(result: any): Promise<string> {
    return new Promise((r) => {
      if (!result.cancelled) {
        LibProgress.show("Mohon Tunggu, Sedang mengunggah foto")
        var wantedMaxSize = 780
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
    const { show, editor } = this.props
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
                      <Icon name='ios-close-circle' style={{ fontSize: 40, color: 'white' }} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => this.setState({ type: this.state.type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back })} >
                      <Icon name='ios-refresh-circle' style={{ fontSize: 40, color: 'white' }} />
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
                          let imageUri = await m.processImage(image)
                          m.setResult(imageUri)
                          this.setState({ image: null })
                        });
                    }} >
                      <Icon name='ios-checkmark-circle' style={{ fontSize: 40, color: 'white' }} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => {
                      setTimeout(
                        async () => {
                          m.hide()
                          this.setState({ image: null })
                        });
                    }} >
                      <Icon name='ios-close-circle' style={{ fontSize: 40, color: 'white' }} />
                    </TouchableOpacity>
                }
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default connect(m.mapStateToProps)(m)