import React from 'react';
import { LibComponent } from 'esoftplay';
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
  ZocialTypes,
} from '@expo/vector-icons/build/esoftplay_icons'
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  SimpleLineIcons,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  Fontisto,
  Foundation,
  MaterialIcons,
  Octicons,
  Zocial,
} from '@expo/vector-icons'

export interface LibAntDesignIconProps {
  name: AntDesignTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibEvilIconsIconProps {
  name: EvilIconsTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFeatherIconProps {
  name: FeatherTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFontAwesomeIconProps {
  name: FontAwesomeTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFontistoIconProps {
  name: FontistoTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFoundationIconProps {
  name: FoundationTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibMaterialIconsIconProps {
  name: MaterialIconsTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibEntypoIconProps {
  name: EntypoTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibOcticonsIconProps {
  name: OcticonsTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibZocialIconProps {
  name: ZocialTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibSimpleLineIconProps {
  name: SimpleLineIconsTypes,
  size?: number,
  color?: string,
  style?: any
}
export interface LibIoniconsProps {
  name: IoniconsTypes,
  size?: number,
  color?: string,
  style?: any
}

export interface LibIconProps {
  name: MaterialCommunityIconsTypes,
  size?: number,
  color?: string,
  style?: any
}

export type LibIconStyle = MaterialCommunityIconsTypes

export interface LibIconState {

}

export default class icon extends LibComponent<LibIconProps, LibIconState>{

  constructor(props: LibIconProps) {
    super(props);
  }

  static Ionicons(props: LibIoniconsProps): any {
    const size = props.size || 23
    return <Ionicons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static AntDesign(props: LibAntDesignIconProps): any {
    const size = props.size || 23
    return <AntDesign size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static EvilIcons(props: LibEvilIconsIconProps): any {
    const size = props.size || 23
    return <EvilIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Feather(props: LibFeatherIconProps): any {
    const size = props.size || 23
    return <Feather size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static FontAwesome(props: LibFontAwesomeIconProps): any {
    const size = props.size || 23
    return <FontAwesome size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Fontisto(props: LibFontistoIconProps): any {
    const size = props.size || 23
    return <Fontisto size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Foundation(props: LibFoundationIconProps): any {
    const size = props.size || 23
    return <Foundation size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Octicons(props: LibOcticonsIconProps): any {
    const size = props.size || 23
    return <Octicons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Zocial(props: LibZocialIconProps): any {
    const size = props.size || 23
    return <Zocial size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static MaterialIcons(props: LibMaterialIconsIconProps): any {
    const size = props.size || 23
    return <MaterialIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static SimpleLineIcons(props: LibSimpleLineIconProps): any {
    const size = props.size || 23
    return <SimpleLineIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static EntypoIcons(props: LibEntypoIconProps): any {
    const size = props.size || 23
    return <Entypo size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }

  render(): any {
    const size = this.props.size || 23
    return <MaterialCommunityIcons size={size} color={'#222'} {...this.props} style={{ width: size, height: size + 1, ...this.props.style }} />
  }
}