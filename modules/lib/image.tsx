//[moved] change native cropper
// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibCurl } from 'esoftplay/cache/lib/curl/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibProgress } from 'esoftplay/cache/lib/progress/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import { CameraView } from 'expo-camera';
import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import ImagePicker from "react-native-image-crop-picker";
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

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md) untuk melihat dokumentasi*/
class m extends LibComponent<LibImageProps, LibImageState> {

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#setResult) untuk melihat dokumentasi*/
  static setResult(image: string): void {
    state.set({
      ...state.get(),
      image: image,
      show: false,
    })
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#show) untuk melihat dokumentasi*/
  static show(): void {
    state.set({
      ...state.get(),
      show: true,
      image: undefined,
    })
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#hide) untuk melihat dokumentasi*/
  static hide(): void {
    state.set(initState)
  }

  camera: any;
  constructor(props: LibImageProps) {
    super(props);
    this.state = {
      type: 'back',
      loading: false,
      image: null,
      flashLight: 'off'
    }
    this.camera = React.createRef()
    this.takePicture = this.takePicture.bind(this);
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#takePicture) untuk melihat dokumentasi*/
  async takePicture(): Promise<void> {
    if (this.camera) {
      this.setState({ loading: true })
      let result = await this.camera.takePictureAsync({})
      this.setState({ image: result, loading: false })
    }
  }


  private static ratio2Size(ratio: string, maxDimension: number = 1200): [width: number, height: number] {
    if (maxDimension <= 0 || !isFinite(maxDimension)) {
      console.error("Invalid maxDimension provided, returning [0, 0].");
      return [0, 0];
    }
    
    const parts = ratio?.split(":");
    if (parts?.length !== 2) {
      return [maxDimension, maxDimension];
    }

    const [aspectRatioWidth, aspectRatioHeight] = parts.map(Number);

    if (isNaN(aspectRatioWidth) || isNaN(aspectRatioHeight) || aspectRatioWidth <= 0 || aspectRatioHeight <= 0) {
      return [maxDimension, maxDimension];
    }

    if (aspectRatioWidth > aspectRatioHeight) {
      const width = maxDimension;
      const height = (aspectRatioHeight / aspectRatioWidth) * width;
      return [width, height];
    } else {
      const height = maxDimension;
      const width = (aspectRatioWidth / aspectRatioHeight) * height;
      return [width, height];
    }
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#fromCamera) untuk melihat dokumentasi*/
  static fromCamera(options?: LibImageCameraOptions): Promise<string> {
    return new Promise((_r) => {
      const [w, h] = m.ratio2Size(options?.crop?.ratio)
      ImagePicker.openCamera({
        width: w,
        height: h,
        cropping: true,
      }).then(async (image) => {
        let imageUri = await m.processImage(image.path, options?.maxDimension)
        m.setResult(imageUri)
        _r(imageUri)
      });

    })
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#fromGallery) untuk melihat dokumentasi*/
  static fromGallery(options?: LibImageGalleryOptions): Promise<string | string[]> {
    const [w, h] = m.ratio2Size(options?.crop?.ratio)
    return new Promise(async (_r) => {
      ImagePicker.openPicker({
        width: w,
        height: h,
        cropping: true,
      }).then(async (z) => {
        if (z) {
          let imageUri = await m.processImage(z.path, options?.maxDimension)
          m.setResult(imageUri)
          _r(imageUri)
        }
      });
    })
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/image.md#processImage) untuk melihat dokumentasi*/
  static processImage(result: any, maxDimension?: number): Promise<string> {
    return new Promise((r) => {
      if (result) {
        LibProgress.show(esp.lang("lib/image", "wait_upload"))
        new LibCurl().upload('image_upload', "image", String(result), 'image/jpeg',
          (res: any, msg: string) => {
            r(res);
            LibProgress.hide()
          },
          (msg: any) => {
            LibProgress.hide()
            r(msg.message);
          }, 1)
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
                <CameraView
                  ref={(camera: any) => this.camera = camera}
                  facing={type}
                  ratio={'4:3'}
                  flash={flashLight}
                  zoom={0.1}
                  style={{ height: LibStyle.width * 4 / 3, width: LibStyle.width }}>
                  <View style={{ height: height, width: width, backgroundColor: 'transparent' }} >
                    {image ? <Image source={image} style={{ height: LibStyle.width * 4 / 3, width: width, resizeMode: 'cover', transform: [{ scaleX: this.state.type == 'back' ? 'front' : 'back' }] }} /> : null}
                  </View>
                </CameraView>
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
                            <LibIcon.Ionicons name='close-circle' style={{ fontSize: 40, color: 'white' }} />
                          </TouchableOpacity>
                          :
                          <TouchableOpacity onPress={() => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' })} >
                            <LibIcon.Ionicons name='refresh-circle' style={{ fontSize: 40, color: 'white' }} />
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
                            const timer = setTimeout(
                              async () => {
                                let imageUri = await m.processImage(image, maxDimension)
                                m.setResult(imageUri)
                                this.setState({ image: null })
                                clearTimeout(timer)
                              });
                          }} >
                            <LibIcon.Ionicons name='checkmark-circle' style={{ fontSize: 40, color: 'white' }} />
                          </TouchableOpacity>
                          :
                          <TouchableOpacity onPress={() => {
                            const timer = setTimeout(
                              async () => {
                                m.hide()
                                this.setState({ image: null })
                              });
                            clearTimeout(timer)
                          }} >
                            <LibIcon.Ionicons name='close-circle' style={{ fontSize: 40, color: 'white' }} />
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