// noPage
import { LibComponent, LibTextstyle, LibTheme, LibUtils } from 'esoftplay';
import React from 'react';
import { TextInput, View } from 'react-native';

export interface LibInputProps {
  icon?: (color: string) => any,
  label?: string,
  placeholder?: string,
  mask?: string,
  maskFrom?: 'start' | 'end',
  base?: boolean,
  children?: any,
  suffix?: string,
  onPress?: () => void,
  helper?: string
  allowFontScaling?: boolean,
  autoCapitalize?: "none" | "sentences" | "words" | "characters",
  autoCorrect?: boolean,
  autoFocus?: boolean,
  blurOnSubmit?: boolean,
  caretHidden?: boolean,
  contextMenuHidden?: boolean,
  defaultValue?: string,
  editable?: boolean,
  inactive?: boolean,
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad",
  maxLength?: number,
  multiline?: boolean,
  onSubmitEditing?: () => void,
  onChangeText?: (text: string, maskedText?: string) => void,
  placeholderTextColor?: string,
  returnKeyType?: "done" | "go" | "next" | "search" | "send",
  secureTextEntry?: boolean,
  selectTextOnFocus?: boolean,
  selectionColor?: string,
  style?: any,
  value?: string,
}

export interface LibInputState {
  hasFocus: boolean,
  error?: string,
  helper?: string
}
export default class m extends LibComponent<LibInputProps, LibInputState>{
  text: string
  ref: any
  constructor(props: LibInputProps) {
    super(props);
    this.state = { hasFocus: false }
    this.text = ''
    this.ref = React.createRef()
    this.getText = this.getText.bind(this);
    this.mask = this.mask.bind(this);
    this.unmask = this.unmask.bind(this);
    this.setError = this.setError.bind(this);
    this.clearError = this.clearError.bind(this);
    this.setHelper = this.setHelper.bind(this);
    this.clearHelper = this.clearHelper.bind(this);
    this.getTextMasked = this.getTextMasked.bind(this);
  }

  getText(): string {
    return this.unmask(this.text)
  }

  getTextMasked(): string {
    return this.text
  }

  focus(): void {
    this.ref.focus()
  }

  blur(): void {
    this.ref.blur()
  }

  setHelper(msg: string): void {
    this.setState({ helper: msg })
  }

  clearHelper(msg: string): void {
    this.setState({ helper: undefined })
  }

  setError(msg: string): void {
    this.setState({ error: msg })
  }

  clearError(): void {
    this.setState({ error: undefined })
  }

  mask(text: string): string {
    let _text = text
    let { mask, maskFrom } = this.props
    if (mask) {
      if (!maskFrom) maskFrom = 'start'
      let rMask = mask.split("")
      let rText = this.unmask(_text)?.split?.("")
      if (maskFrom == 'end') {
        rMask = [...rMask?.reverse?.()]
        rText = [...rText?.reverse?.()]
      }
      let maskedText = ''
      var _addRange = 0
      var _addMaskChar = ''
      for (let i = 0; i < rMask.length; i++) {
        const iMask = rMask[i];
        if (iMask == '#') {
          if (rText[i - _addRange] != undefined) {
            maskedText += _addMaskChar + rText[i - _addRange]
          }
          else {
            break
          }
          _addMaskChar = ''
        }
        else {
          _addMaskChar += iMask
          _addRange++
        }
      }
      if (maskFrom == 'end') {
        maskedText = maskedText.split('').reverse().join('')
      }
      this.ref.setNativeProps({ text: maskedText })
      return maskedText
    }
    return _text
  }

  unmask(text: string): string {
    let _text = text
    let { mask } = this.props
    if (mask) {
      let masks = mask.match(/((?!\#).)/g)
      if (masks) {
        for (let i = 0; i < masks.length; i++) {
          _text = _text?.replace?.(new RegExp(LibUtils.escapeRegExp(masks[i]), 'g'), '')
        }
      }
      return _text
    }
    return _text
  }

  setText(text: string): void {
    if (this.ref) {
      this.ref.setNativeProps({ text: this.mask(text) })
      this.text = this.mask(text)
    }
  }

  componentDidUpdate(prevProps: LibInputProps, prevState: LibInputState): void {
    if (this.ref) {
      this.ref.setNativeProps({ text: this.mask(this.text) })
    }
    if (this.props.base && this.text == '') {
      if (this.props.defaultValue != prevProps.defaultValue) {
        this.ref.setNativeProps({ text: this.mask(this.props.defaultValue) })
      }
    }
  }

  componentDidMount(): void {
    super.componentDidMount()
    setTimeout(() => {
      if (this.props.defaultValue) {
        this.setText(this.props.defaultValue)
      }
    });
  }

  render(): any {
    if (this.props.base) {
      const setups = {
        ref: (x) => this.ref = x,
        ...this.props,
        onChangeText: (t: string) => {
          this.text = this.mask(t)
          const unmaskedText = this.unmask(t)
          this.props.onChangeText(unmaskedText, this.text)
        },
        maxLength: this.props.mask ? this.props.mask.length : undefined,
      }
      return this.props.children ? React.cloneElement(this.props.children, { ...setups }) : <TextInput {...setups} />
    }
    const { label, placeholder, defaultValue, helper, editable, inactive, mask, suffix, icon, onPress } = this.props
    const { hasFocus, error } = this.state
    const stateHelper = this.state.helper
    let errorFocusOrIdle = error ? 'red' : hasFocus ? LibTheme._colorPrimary() : LibTheme._colorTextTertiary()

    let inputView = () => (
      <View style={{ marginTop: 3, paddingHorizontal: 16, paddingVertical: 1 }} >
        <LibTextstyle text={label || ''} textStyle={'caption1'} style={{ color: errorFocusOrIdle }} />
        <View>
          <TextInput
            ref={(e) => this.ref = e}
            onFocus={() => this.setState({ hasFocus: true })}
            onTouchEnd={() => editable == false && onPress ? onPress() : {}}
            onBlur={() => this.setState({ hasFocus: false })}
            placeholder={placeholder || ''}
            selectionColor={LibUtils.hexToRgba(LibTheme._colorPrimary(), 0.5)}
            placeholderTextColor={LibTheme._colorTextTertiary()}
            underlineColorAndroid={'transparent'}
            maxLength={mask ? mask.length : undefined}
            allowFontScaling={false}
            {...this.props}
            style={[{
              paddingVertical: 8,
              marginBottom: 2,
              paddingRight: suffix ? (suffix.length * 14) : 0,
              fontSize: 17.5,
              color: error
                ? 'red'
                : inactive == true
                  ? LibTheme._colorTextTertiary()
                  : hasFocus
                    ? LibTheme._colorPrimary()
                    : LibTheme._colorTextPrimary(),
            }, { ...this.props.style }]}
            onChangeText={(e) => {
              this.text = this.mask(e)
              if (error != undefined)
                this.clearError()
              if (this.props.onChangeText) this.props.onChangeText(e)
            }}
          />
          {
            suffix &&
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, justifyContent: 'flex-end', alignItems: 'flex-end' }} >
              <LibTextstyle text={suffix} textStyle={'body'} style={{ marginBottom: 11, fontSize: 17, color: errorFocusOrIdle }} />
            </View>
          }
        </View>
        <View style={{ flexDirection: 'row', borderTopColor: errorFocusOrIdle, borderTopWidth: 1 }} >
          {
            error ?
              <LibTextstyle text={error} textStyle={'caption1'} style={{ color: 'red', fontSize: 11 }} />
              :
              <LibTextstyle text={' '} textStyle={'caption1'} style={{ color: 'red', opacity: 0, }} />
          }
          <View style={{ flex: 1 }} />
          {
            stateHelper ?
              <LibTextstyle text={stateHelper} textStyle={'caption1'} style={{ color: errorFocusOrIdle, textAlign: 'right', marginLeft: 100, fontSize: 11 }} />
              :
              <LibTextstyle text={' '} textStyle={'caption1'} style={{ color: 'red', opacity: 0 }} />
          }
          {
            helper ?
              <LibTextstyle text={helper} textStyle={'caption1'} style={{ color: errorFocusOrIdle, textAlign: 'right', marginLeft: 100, fontSize: 11 }} />
              :
              <LibTextstyle text={' '} textStyle={'caption1'} style={{ color: 'red', opacity: 0 }} />
          }
        </View>
      </View>
    )
    return icon ?
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-end' }} >
        <View style={{ marginBottom: 27, marginLeft: 16 }} >
          {icon(errorFocusOrIdle)}
        </View>
        <View style={{ flex: 1 }} >
          {inputView()}
        </View>
      </View>
      :
      inputView()
  }
}