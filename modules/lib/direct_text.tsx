import React from 'react';
import { TextInput } from 'react-native';
import { LibComponent } from 'esoftplay';

export interface LibDirect_textProps {
  style?: any,
  initialText?: string
}
export interface LibDirect_textState {

}

export default class m extends LibComponent<LibDirect_textProps, LibDirect_textState> {
  ref: React.RefObject<TextInput> = React.createRef()

  setText(text: string): void {
    this.ref.current?.setNativeProps({ text })
  }

  render(): any {
    return (
      <TextInput
        ref={this.ref}
        underlineColorAndroid={'transparent'}
        editable={false}
        defaultValue={this.props.initialText}
        style={this.props.style} />
    )
  }
}