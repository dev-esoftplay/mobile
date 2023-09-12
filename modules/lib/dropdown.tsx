// withHooks
// noPage
import { esp } from 'esoftplay';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Modal, Platform, Pressable, TextInput, View, ViewProps } from "react-native";

export interface LibDropdownArgs {

}

export interface LibDropdownOption {
  id: string | number,
  value: any
}

export interface LibDropdownProps {
  value: LibDropdownOption,
  options: LibDropdownOption[],
  renderItem: (item: LibDropdownOption, index: number) => any
  label?: string,
  fixOffsetTop?: boolean,
  style?: ViewProps,
  popupStyle?: ViewProps,
  maxPopupHeight?: number,
}

export default function m(props: LibDropdownProps) {
  const MAX_HEIGHT = props?.maxPopupHeight || 140;
  const [currentValue, setCurrentValue] = useState<LibDropdownOption>();
  const DropdownRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popUpSize, setPopUpSize] = useState({
    width: 0,
    top: 0,
    left: 0,
    bottom: 0,
  });

  useEffect(() => {
    setCurrentValue(props.value);
    setIsOpen(false);
  }, [props.value]);

  const togglePopup = () => {
    DropdownRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setPopUpSize({
        width: _w,
        left: _px,
        top: py + (props?.style?.height || 40) + (Platform.OS == 'android' ? (props.fixOffsetTop ? -LibStyle.STATUSBAR_HEIGHT : 0) : 0),
        bottom: py,
      });
    });
    setIsOpen(!isOpen);
  };
  return (
    <View ref={DropdownRef} collapsable={false} >
      <Pressable onPress={togglePopup} collapsable={false} >
        <TextInput
          pointerEvents="none"
          editable={false}
          style={[{ height: 40, borderWidth: 1, borderRadius: 2, borderColor: '#ccc' }, Platform.OS == 'web' ? { outlineWidth: 0 } : {}, props?.style]}
          placeholder={props?.label || esp.lang("lib/dropdown", "select")}
          value={currentValue?.value}
        />
      </Pressable>
      <Modal visible={isOpen} transparent animationType="none">
        <Pressable onPress={() => setIsOpen(false)} style={{ flex: 1, alignItems: 'center' }}>
          <View style={[{ position: 'absolute', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 8, borderRadius: 4, backgroundColor: '#fff', ...LibStyle.elevation(2) }, props.popupStyle, { top: popUpSize.top, width: popUpSize.width, left: popUpSize.left }]}>
            <FlatList
              data={props.options}
              style={{ maxHeight: MAX_HEIGHT }}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item, index }) => props.renderItem(item, index)}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
