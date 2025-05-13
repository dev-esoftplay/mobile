// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibIcon } from 'esoftplay/cache/lib/icon/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import { LibTheme } from 'esoftplay/cache/lib/theme/import';
import useGlobalState from 'esoftplay/global';

import { BackHandler, Keyboard, TouchableOpacity, View } from 'react-native';
import { LibIconStyle } from './icon';

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
},
  {
    listener(data) {
      let backListener;
      if (data.visible)
        backListener = BackHandler.addEventListener("hardwareBackPress", handleBack);
      else
        backListener?.remove?.();
    },
  }
)

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibDialogProps, LibDialogState> {

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#initState) untuk melihat dokumentasi*/
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

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#hide) untuk melihat dokumentasi*/
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

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#info) untuk melihat dokumentasi*/
  static info(title: string, msg: string): void {
    m.show("default", 'information', title, msg, "OK", undefined, () => m.hide(), undefined)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#confirm) untuk melihat dokumentasi*/
  static confirm(title: string, msg: string, ok: string, onPressOK: () => void, cancel: string, onPressCancel: () => void): void {
    m.show("default", 'help-circle', title, msg, ok, cancel, onPressOK, onPressCancel)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#warningConfirm) untuk melihat dokumentasi*/
  static warningConfirm(title: string, msg: string, ok: string, onPressOK: () => void, cancel: string, onPressCancel: () => void): void {
    m.show("danger", 'help-circle', title, msg, ok, cancel, onPressOK, onPressCancel)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#failed) untuk melihat dokumentasi*/
  static failed(title: string, msg: string): void {
    m.show("danger", 'alert-circle', title, msg, "OK", undefined, () => m.hide(), undefined)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#warning) untuk melihat dokumentasi*/
  static warning(title: string, msg: string): void {
    m.show("danger", 'alert-circle', title, msg, "OK", undefined, () => m.hide(), undefined)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#show) untuk melihat dokumentasi*/
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

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#custom) untuk melihat dokumentasi*/
  static custom(view: any): void {
    Keyboard.dismiss()
    state.set({
      visible: true,
      view: view,
      style: "default",
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

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#handleBack) untuk melihat dokumentasi*/
function handleBack(): boolean {
  return true
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/dialog.md#Dialog) untuk melihat dokumentasi*/
function Dialog(): any {
  const { visible, icon, view, style, title, msg, ok, cancel, onPressOK, onPressCancel } = state.useSelector(s => s)
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