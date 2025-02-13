// noPage

import {
  AntDesign, Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  Fontisto,
  Foundation, Ionicons, MaterialCommunityIcons, MaterialIcons,
  Octicons, SimpleLineIcons, Zocial
} from '@expo/vector-icons';
import {
  AntDesignTypes,
  EntypoTypes,
  EvilIconsTypes,
  FeatherTypes,
  FontAwesomeTypes,
  FontistoTypes,
  FoundationTypes,
  IoniconsTypes,
  MaterialCommunityIconsTypes,
  MaterialIconsTypes,
  OcticonsTypes,
  SimpleLineIconsTypes,
  ZocialTypes
} from '@expo/vector-icons/build/esoftplay_icons';
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import React from 'react';
import { TextStyle } from 'react-native';

export interface LibAntDesignIconProps {
  name: AntDesignTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibEvilIconsIconProps {
  name: EvilIconsTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibFeatherIconProps {
  name: FeatherTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibFontAwesomeIconProps {
  name: FontAwesomeTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibFontistoIconProps {
  name: FontistoTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibFoundationIconProps {
  name: FoundationTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibMaterialIconsIconProps {
  name: MaterialIconsTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibEntypoIconProps {
  name: EntypoTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibOcticonsIconProps {
  name: OcticonsTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibZocialIconProps {
  name: ZocialTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibSimpleLineIconProps {
  name: SimpleLineIconsTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}
export interface LibIoniconsProps {
  name: IoniconsTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}

export interface LibIconProps {
  name: MaterialCommunityIconsTypes,
  size?: number,
  color?: string,
  style?: TextStyle
}

export type LibIconStyle = MaterialCommunityIconsTypes

export interface LibIconState {

}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md) untuk melihat dokumentasi*/
export default class m extends LibComponent<LibIconProps, LibIconState> {

  constructor(props: LibIconProps) {
    super(props);
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#Ionicons) untuk melihat dokumentasi*/
  static Ionicons(props: LibIoniconsProps): any {
    const size = props.size || 23
    return <Ionicons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#AntDesign) untuk melihat dokumentasi*/
  static AntDesign(props: LibAntDesignIconProps): any {
    const size = props.size || 23
    return <AntDesign size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#EvilIcons) untuk melihat dokumentasi*/
  static EvilIcons(props: LibEvilIconsIconProps): any {
    const size = props.size || 23
    return <EvilIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#Feather) untuk melihat dokumentasi*/
  static Feather(props: LibFeatherIconProps): any {
    const size = props.size || 23
    return <Feather size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#FontAwesome) untuk melihat dokumentasi*/
  static FontAwesome(props: LibFontAwesomeIconProps): any {
    const size = props.size || 23
    return <FontAwesome size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#Fontisto) untuk melihat dokumentasi*/
  static Fontisto(props: LibFontistoIconProps): any {
    const size = props.size || 23
    return <Fontisto size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#Foundation) untuk melihat dokumentasi*/
  static Foundation(props: LibFoundationIconProps): any {
    const size = props.size || 23
    return <Foundation size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#Octicons) untuk melihat dokumentasi*/
  static Octicons(props: LibOcticonsIconProps): any {
    const size = props.size || 23
    return <Octicons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#Zocial) untuk melihat dokumentasi*/
  static Zocial(props: LibZocialIconProps): any {
    const size = props.size || 23
    return <Zocial size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#MaterialIcons) untuk melihat dokumentasi*/
  static MaterialIcons(props: LibMaterialIconsIconProps): any {
    const size = props.size || 23
    return <MaterialIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#SimpleLineIcons) untuk melihat dokumentasi*/
  static SimpleLineIcons(props: LibSimpleLineIconProps): any {
    const size = props.size || 23
    return <SimpleLineIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/icon.md#EntypoIcons) untuk melihat dokumentasi*/
  static EntypoIcons(props: LibEntypoIconProps): any {
    const size = props.size || 23
    return <Entypo size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }

  render(): any {
    const size = this.props.size || 23
    return <MaterialCommunityIcons size={size} color={'#222'} {...this.props} style={{ width: size, height: size + 1, ...this.props.style }} />
  }
}