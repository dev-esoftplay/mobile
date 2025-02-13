
// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibInput } from 'esoftplay/cache/lib/input/import';
import { LibKeyboard_avoid } from 'esoftplay/cache/lib/keyboard_avoid/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTheme } from 'esoftplay/cache/lib/theme/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import React from 'react';
import { Button, StyleProp, TextStyle, TouchableOpacity, View } from 'react-native';

export interface ComponentEditboxProps {
  defaultValue?: string,
  onSubmit?: (e: string) => void,
  label?: string,
  placeholder?: string,
  error?: string,
  helper?: string
  allowFontScaling?: boolean,
  autoCapitalize?: "none" | "sentences" | "words" | "characters",
  autoCorrect?: boolean,
  autoFocus?: boolean,
  blurOnSubmit?: boolean,
  caretHidden?: boolean,
  contextMenuHidden?: boolean,
  editable?: boolean,
  inactive?: boolean,
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad",
  maxLength?: number,
  multiline?: boolean,
  onSubmitEditing?: () => void,
  onChangeText?: (text: string) => void,
  placeholderTextColor?: string,
  returnKeyType?: "done" | "go" | "next" | "search" | "send",
  secureTextEntry?: boolean,
  selectTextOnFocus?: boolean,
  selectionColor?: string,
  style?: StyleProp<TextStyle>,
  value?: string,
}

export interface ComponentEditboxState {

}
const initState = {
  defaultValue: undefined,
  onSubmit: undefined,
  label: undefined,
  keyboardType: undefined
}

const state = useGlobalState<any>(initState)
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/editbox.md) untuk melihat dokumentasi*/
class m extends LibComponent<ComponentEditboxProps, ComponentEditboxState> {

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/editbox.md#show) untuk melihat dokumentasi*/
  static show(label: string, defaultValue: string, keyboardType: "default" | "email-address" | "numeric" | "phone-pad", onSubmit: (e: string) => void): void {
    state.set(
      {
        label: label,
        defaultValue: defaultValue,
        onSubmit: onSubmit,
        keyboardType: keyboardType
      }
    )
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/editbox.md#hide) untuk melihat dokumentasi*/
  static hide(): void {
    state.set(initState)
  }


  input = React.createRef<LibInput>()

  render(): any {
    return (
      <state.connect
        render={(props) => {
          const { label, onSubmit } = props
          if (this?.input?.current && onSubmit) {
            if (props.defaultValue)
              this?.input?.current?.setText?.(props.defaultValue);
            this?.input?.current?.focus?.()
          }
          if (!onSubmit) return null
          return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}  >
              <TouchableOpacity onPress={() => m.hide()} activeOpacity={1} style={{ flex: 1 }} >
                <LibKeyboard_avoid style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 24 }} >
                  <TouchableOpacity onPress={() => { }} activeOpacity={1}>
                    <View style={[{ backgroundColor: LibTheme._colorBackgroundCardPrimary(), padding: 10 }, LibStyle.elevation(2)]} >
                      <LibInput
                        label={label}
                        ref={this.input}
                        {...props}
                      />
                      <Button title={esp.lang("lib/editbox", "btn_save")} color={LibStyle.colorPrimary} onPress={() => { onSubmit(this.input?.current?.getText?.()); m.hide(); }} />
                    </View>
                  </TouchableOpacity>
                </LibKeyboard_avoid>
              </TouchableOpacity>
            </View>
          )
        }}
      />
    )
  }
}

export default m