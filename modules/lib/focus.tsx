import React from 'react';
import { View } from 'react-native';
import { LibComponent } from 'esoftplay';
import { withNavigationFocus } from 'react-navigation';


export interface LibFocusProps {
  isFocused?: boolean
  blurView?: any,
  onFocus?: () => void,
  onBlur?: () => void,
  style?: any
}
export interface LibFocusState {

}

class m extends LibComponent<LibFocusProps, LibFocusState> {
  constructor(props: LibFocusProps) {
    super(props);
  }

  componentDidUpdate(prevProps: LibFocusProps, prevState: LibFocusState): void {
    if (prevProps.isFocused == false && this.props.isFocused == true) {
      this.props.onFocus && this.props.onFocus()
    } else if (prevProps.isFocused == true && this.props.isFocused == false) {
      this.props.onBlur && this.props.onBlur()
    }
  }

  render(): any {
    if (!this.props.isFocused) {
      if (this.props.blurView)
        return this.props.blurView
      if (this.props.style)
        return <View style={this.props.style} />
      return null
    }
    return this.props.children ? this.props.children : null
  }
}

export default withNavigationFocus<any>(m)