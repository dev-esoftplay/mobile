import React from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ImageEditor
} from 'react-native';
import { Icon } from 'native-base';
import { LibStyle, LibComponent, LibCurl, esp, LibProgress } from 'esoftplay';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { store } from '../../../../App';
import { connect } from 'react-redux';
import { SaveFormat } from 'expo-image-manipulator';
const { height, width } = LibStyle;

export interface LibImageProps {
  show?: boolean,
  image?: string
}

export interface LibImageState {
  type: any,
  loading: boolean,
  image: any
}

class m extends LibComponent<LibImageProps, LibImageState> {
  static initState = {
    show: false,
    image: undefined
  }

  static reducer(state: any, action: any): any {
    if (state == undefined) state = m.initState
    switch (action.type) {
      case "lib_image_camera_show":
        return {
          ...state,
          show: true,
          image: undefined
        }
        break;
      case "lib_image_camera_hide":
        return {
          ...state,
          show: false,
          image: undefined
        }
        break;
      case "lib_image_result":
        return {
          ...state,
          image: action.payload,
          show: false
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
    }
  }

  static setResult(image: string): void {
    console.log(image)
    store.dispatch({
      type: 'lib_image_result',
      payload: image
    })
  }

  static show(): void {
    store.dispatch({
      type: 'lib_image_camera_show'
    })
  }

  static hide(): void {
    store.dispatch({
      type: 'lib_image_camera_hide'
    })
  }

  camera: any;
  constructor(props: LibImageProps) {
    super(props);
    this.state = {
      type: Camera.Constants.Type.back,
      loading: false,
      image: null
    }
    this.camera = React.createRef()
    this.takePicture = this.takePicture.bind(this);
  }

  async takePicture(): Promise<void> {
    if (this.camera) {
      this.setState({ loading: true })
      const result = await this.camera.takePictureAsync()
      this.setState({ image: result, loading: false })
    }
  }

  static fromCamera(): void {
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
      if (Platform.OS == 'android') {
        m.show()
      } else {
        ImagePicker.launchCameraAsync().then(async (result: any) => {
          let imageUri = await m.processImage(result)
          m.setResult(imageUri)
        })
      }
    }, 1);
  }

  static fromGallery(): void {
    setTimeout(async () => {
      const { status } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
      var finalStatus = status
      if (finalStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        finalStatus = status
      }
      if (finalStatus != 'granted') {
        esp.log('PERMISSION DENIED')
      }
      ImagePicker.launchImageLibraryAsync().then(async (result: any) => {
        let imageUri = await m.processImage(result)
        m.setResult(imageUri)
      })
    }, 1)
  }

  static processImage(result: any): Promise<string> {
    return new Promise((r) => {
      if (!result.cancelled) {
        LibProgress.show("MOHON TUNGGU, SEDANG MENGUNGGAH FOTO ")
        var wantedMaxSize = 1280
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

        // new Promise(async (resolve, reject) => {
        //   ImageEditor.cropImage(result.uri, {
        //     offset: {
        //       x: 0,
        //       y: 0
        //     },
        //     size: {
        //       width: result.width,
        //       height: result.height
        //     },
        //     displaySize: {
        //       width: wantedwidth,
        //       height: wantedheight
        //     },
        //     resizeMode: 'contain',
        //   },
        //     (uri) => resolve(uri),
        //     () => reject(),
        //   )
        // }).then((resizedUri) => {
        //   new LibCurl().upload('image_upload', "image", String(resizedUri), 'image/jpeg',
        //     (res: any, msg: string) => {
        //       r(res);
        //       LibProgress.hide()
        //     },
        //     (msg: string) => {
        //       LibProgress.hide()
        //       r(msg);
        //     }, 1)
        // })
      }
    })
  }

  render(): any {
    const { image, type, loading } = this.state
    const { show } = this.props
    if (!show) return null
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} >
        <View style={{ flex: 1 }} >
          <Camera
            ref={(camera: any) => this.camera = camera}
            type={type}
            style={{ flex: 1 }}>
            <View style={{ height: height, width: width, backgroundColor: 'transparent' }} >
              {image ? <Image source={image} style={{ height: height, width: width, transform: [{ scaleX: this.state.type == Camera.Constants.Type.back ? 1 : -1 }] }} /> : null}
            </View>
          </Camera>
          <View style={{ position: 'absolute', top: width * 4 / 3, bottom: 0, left: 0, right: 0, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', flex: 1 }} >
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
                        }, 1);
                    }} >
                      <Icon name='ios-checkmark-circle' style={{ fontSize: 40, color: 'white' }} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => {
                      setTimeout(
                        async () => {
                          m.hide()
                          this.setState({ image: null })
                        }, 1);
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