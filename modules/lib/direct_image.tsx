import React from 'react';
import { Image, Platform, View } from 'react-native';
import { LibComponent } from 'esoftplay';

export interface LibDirect_imageSource {
  uri: string
}
export interface LibDirect_imageProps {
  style?: any
  defaultSource?: LibDirect_imageSource | any
}
export interface LibDirect_imageState {

}

export default class m extends LibComponent<LibDirect_imageProps, LibDirect_imageState> {
  ref: React.RefObject<Image> = React.createRef()
  source = this.props.defaultSource || ' '

  constructor(props: LibDirect_imageProps) {
    super(props)
    this.setSource = this.setSource.bind(this);
  }

  setSource(source: any): void {
    this.source = source
    this.ref.current?.setNativeProps({
      [Platform.OS == 'ios' ? 'source' : 'src']: [source]
    })
  }

  render(): any {
    return (
      <Image ref={this.ref} source={this.source} style={this.props.style} />
    )
  }
}