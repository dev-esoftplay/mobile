// noPage

import React from 'react';
import { View, TouchableOpacity, BackHandler, Keyboard } from 'react-native';
import { LibComponent, LibTheme, LibStyle, LibTextstyle, LibIcon, LibIconStyle, useGlobalState } from 'esoftplay';

export interface LibDialogProps {
  visible?: boolean,
  style: 'default' | 'danger',
  view?: any,
  icon?: LibIconStyle,
  title?: string,
  msg?: string,
  ok?: string,
  cancel?: string,
  onPressOK?: () => void,
  onPressCancel?: () => void,
}

export interface LibDialogState {

}

const state = useGlobalState<LibDialogProps>({
  visible: false,
  style: 'default',
  view: undefined,
  title: undefined,
  msg: undefined,
  ok: undefined,
  cancel: undefined,
  onPressOK: undefined,
  onPressCancel: undefined,
})


export default class m extends LibComponent<LibDialogProps, LibDialogState>{

  static initState = {
    visible: false,
    style: 'default',
    view: undefined,
    title: undefined,
    msg: undefined,
    ok: undefined,
    cancel: undefined,
    onPressOK: undefined,
    onPressCancel: undefined,
  }

  static hide(): void {
    state.set({
      visible: false,
      style: 'default',
      view: undefined,
      title: undefined,
      icon: undefined,
      msg: undefined,
      onPressOK: undefined,
      onPressCancel: undefined,
      ok: undefined,
      cancel: undefined,
    })
  }

  static info(title: string, msg: string): void {
    m.show("default", 'information', title, msg, "OK", undefined, () => m.hide(), undefined)
  }

  static confirm(title: string, msg: string, ok: string, onPressOK: () => void, cancel: string, onPressCancel: () => void): void {
    m.show("default", 'help-circle', title, msg, ok, cancel, onPressOK, onPressCancel)
  }

  static warningConfirm(title: string, msg: string, ok: string, onPressOK: () => void, cancel: string, onPressCancel: () => void): void {
    m.show("danger", 'help-circle', title, msg, ok, cancel, onPressOK, onPressCancel)
  }

  static failed(title: string, msg: string): void {
    m.show("danger", 'alert-circle', title, msg, "OK", undefined, () => m.hide(), undefined)
  }

  static warning(title: string, msg: string): void {
    m.show("danger", 'alert-circle', title, msg, "OK", undefined, () => m.hide(), undefined)
  }

  static show(style: 'default' | 'danger', icon: LibIconStyle, title: string, msg: string, ok?: string, cancel?: string, onPressOK?: () => void, onPressCancel?: () => void): void {
    Keyboard.dismiss()
    state.set({
      visible: true,
      style: style,
      icon: icon,
      title: title,
      msg: msg,
      ok: ok,
      cancel: cancel,
      onPressOK: onPressOK,
      onPressCancel: onPressCancel,
    })

  }

  static custom(view: any): void {
    Keyboard.dismiss()
    state.set({
      visible: true,
      view: view,
      style: undefined,
      icon: undefined,
      title: undefined,
      msg: undefined,
      ok: undefined,
      cancel: undefined,
      onPressOK: undefined,
      onPressCancel: undefined,
    })
  }

  constructor(props: LibDialogProps) {
    super(props);
  }

  render(): any {
    return <Dialog />
  }
}

function handleBack(): boolean {
  return true
}

function Dialog(): any {
  const { visible, icon, view, style, title, msg, ok, cancel, onPressOK, onPressCancel } = state.useSelector(s => s)
  if (!visible)
    BackHandler.removeEventListener("hardwareBackPress", handleBack)
  else
    BackHandler.addEventListener("hardwareBackPress", handleBack)

  if (!visible) return null
  var color = LibTheme._colorPrimary()
  if (style == 'danger') {
    color = '#DE204C'
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', flex: 1 }} >
      <View style={{ backgroundColor: LibTheme._colorBackgroundCardPrimary(), padding: 10, borderRadius: 4, width: LibStyle.width - 80 }} >
        {
          view ?
            view
            :
            <View>
              <View style={{ marginTop: 16, marginHorizontal: 10 }} >
                <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                  {icon && <View style={{ marginBottom: 10 }} ><LibIcon name={icon} size={48} color={color} /></View>}
                  {title && <LibTextstyle textStyle={"body"} text={title} style={{ marginBottom: 10, color: color, fontWeight: 'bold', textAlign: 'center' }} />}
                  {msg && <LibTextstyle textStyle="callout" text={msg || ''} style={{ textAlign: 'center', lineHeight: 20 }} />}
                </View>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: -5, marginHorizontal: -5, borderRadius: 4, overflow: 'hidden', marginTop: 24 }} >
                {onPressCancel &&
                  <TouchableOpacity onPress={() => { onPressCancel(); m.hide() }} style={{ alignItems: "center", justifyContent: "center", padding: 10, flex: 1, marginRight: 2, borderRadius: 4, backgroundColor: LibTheme._colorBackgroundPrimary() }} >
                    <LibTextstyle textStyle={"body"} text={cancel || ''} />
                  </TouchableOpacity>
                }
                {onPressOK &&
                  <TouchableOpacity onPress={() => { onPressOK(); m.hide() }} style={{ alignItems: "center", justifyContent: "center", padding: 10, flex: 1, borderRadius: 4, backgroundColor: LibTheme._colorBackgroundPrimary() }} >
                    <LibTextstyle textStyle={"body"} text={ok || ''} style={{ color: color }} />
                  </TouchableOpacity>
                }
              </View>
            </View>
        }
      </View>
    </View>
  )

}