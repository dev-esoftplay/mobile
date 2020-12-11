import React from 'react';
import { LibComponent } from 'esoftplay';
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  SimpleLineIcons,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  Foundation,
  MaterialIcons,
  Octicons,
  Zocial
} from '@expo/vector-icons'

export interface LibAntDesignIconProps {
  name: typeof AntDesign,
  size?: number,
  color?: string,
  style?: any
}
export interface LibEvilIconsIconProps {
  name: typeof EvilIcons,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFeatherIconProps {
  name: typeof Feather,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFontAwesomeIconProps {
  name: typeof FontAwesome,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFontAwesome5IconProps {
  name: typeof FontAwesome5,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFontistoIconProps {
  name: typeof Fontisto,
  size?: number,
  color?: string,
  style?: any
}
export interface LibFoundationIconProps {
  name: typeof Foundation,
  size?: number,
  color?: string,
  style?: any
}
export interface LibMaterialIconsIconProps {
  name: typeof MaterialIcons,
  size?: number,
  color?: string,
  style?: any
}
export interface LibEntypoIconProps {
  name: typeof Entypo,
  size?: number,
  color?: string,
  style?: any
}
export interface LibOcticonsIconProps {
  name: typeof Octicons,
  size?: number,
  color?: string,
  style?: any
}
export interface LibZocialIconProps {
  name: typeof Zocial,
  size?: number,
  color?: string,
  style?: any
}
export interface LibSimpleLineIconProps {
  name: typeof SimpleLineIcons,
  size?: number,
  color?: string,
  style?: any
}
export interface LibIonIconProps {
  name: typeof Ionicons,
  size?: number,
  color?: string,
  style?: any
}

export interface LibIconProps {
  name: typeof MaterialCommunityIcons,
  size?: number,
  color?: string,
  style?: any
}

export interface LibIconState {

}

export default class icon extends LibComponent<LibIconProps, LibIconState>{

  constructor(props: LibIconProps) {
    super(props);
  }

  static Ionicons(props: LibIonIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Ionicons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static AntDesign(props: LibAntDesignIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <AntDesign size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static EvilIcons(props: LibEvilIconsIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <EvilIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Feather(props: LibFeatherIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Feather size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static FontAwesome(props: LibFontAwesomeIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <FontAwesome size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static FontAwesome5(props: LibFontAwesome5IconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <FontAwesome5 size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Fontisto(props: LibFontistoIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Fontisto size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Foundation(props: LibFoundationIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Foundation size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Octicons(props: LibOcticonsIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Octicons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static Zocial(props: LibZocialIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Zocial size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static MaterialIcons(props: LibMaterialIconsIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <MaterialIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static SimpleLineIcons(props: LibSimpleLineIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <SimpleLineIcons size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }
  static EntypoIcons(props: LibEntypoIconProps): any {
    const size = props.size || 23
    //@ts-ignore
    return <Entypo size={size} color={'#222'} {...props} style={{ width: size, height: size + 1, ...props.style }} />
  }

  render(): any {
    const size = this.props.size || 23
    //@ts-ignore
    return <MaterialCommunityIcons size={size} color={'#222'} {...this.props} style={{ width: size, height: size + 1, ...this.props.style }} />
  }
}