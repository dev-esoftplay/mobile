import React from 'react';
import { Image, Platform, View } from 'react-native';
import { LibComponent } from 'esoftplay';

export interface LibDirect_imageProps {
  style?: any
  defaultUri?: string,
}
// defaultLocalUri?: number
export interface LibDirect_imageState {

}

export default class m extends LibComponent<LibDirect_imageProps, LibDirect_imageState> {
  ref: React.RefObject<Image> = React.createRef()
  uri = this.props.defaultUri

  constructor(props: LibDirect_imageProps) {
    super(props)
    this.setUri = this.setUri.bind(this);
    // this.setLocalUri = this.setLocalUri.bind(this);
  }

  setUri(uri: string | any): void {
    this.uri = uri
    this.ref.current?.setNativeProps({
      [Platform.OS == 'ios' ? 'source' : 'src']: [{ uri: uri }]
    })
  }

  // setLocalUri(uri: string): void {
  //   //@ts-ignore
  //   this.setUri(Image.resolveAssetSource(uri))
  // }

  render(): any {
    return (
      <Image ref={this.ref} source={/* this.props.defaultLocalUri || */ { uri: this.uri }} style={this.props.style} />
    )
  }
}