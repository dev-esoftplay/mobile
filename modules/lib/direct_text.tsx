// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import React from 'react';
import { TextInput } from 'react-native';

export interface LibDirect_textProps {
  style?: any,
  initialText?: string
}
export interface LibDirect_textState {

}

export default class m extends LibComponent<LibDirect_textProps, LibDirect_textState> {
  ref: React.RefObject<TextInput> = React.createRef()
  text = this.props.initialText

  constructor(props: LibDirect_textProps) {
    super(props)
    this.setText = this.setText.bind(this);
  }

  setText(text: string): void {
    this.text = text
    this.ref.current?.setNativeProps({ text })
  }

  render(): any {
    return (
      <TextInput
        ref={this.ref}
        underlineColorAndroid={'transparent'}
        editable={false}
        defaultValue={this.text}
        style={this.props.style} />
    )
  }
}