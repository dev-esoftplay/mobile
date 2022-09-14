// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import React from "react";
import { StyleSheet, Text } from "react-native";

export interface LibTextstyleProps {
  textStyle: "largeTitle" | "title1" | "title2" | "title3" | "headline" | "body" | "callout" | "subhead" | "footnote" | "caption1" | "caption2" | "m_h1" | "m_h2" | "m_h3" | "m_h4" | "m_h5" | "m_h6" | "m_subtitle1" | "m_subtitle2" | "m_body1" | "m_body2" | "m_button" | "m_caption" | "m_overline",
  style?: any,
  children?: string | "",
  numberOfLines?: number,
  ellipsizeMode?: string,
  text: string | ""
}

export interface LibTextstyleState {

}

export default class m extends LibComponent<LibTextstyleProps, LibTextstyleState>{
  props: any

  constructor(props: LibTextstyleProps) {
    super(props)
    this.props = props
  }

  scale: number = 1

  styles = {
    m_h1: {
      fontSize: 96,
      fontWeight: '100',
      letterSpacing: -1.5,
    },
    m_h2: {
      fontSize: 60,
      fontWeight: '100',
      letterSpacing: -0.5,
    },
    m_h3: {
      fontSize: 48,
      fontWeight: '400',
      letterSpacing: 0,
    },
    m_h4: {
      fontSize: 34,
      fontWeight: '400',
      letterSpacing: 0.25,
    },
    m_h5: {
      fontSize: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    m_h6: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: 0.15,
    },
    m_subtitle1: {
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.15,
    },
    m_subtitle2: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    m_body1: {
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.5,
    },
    m_body2: {
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
    },
    m_button: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 1.25,
      textTransform: 'uppercase'
    },
    m_caption: {
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0.4,
    },
    m_overline: {
      fontSize: 10,
      fontWeight: '400',
      letterSpacing: 1.5,
      textTransform: 'uppercase'
    },
    largeTitle: {
      fontSize: 34,
      fontWeight: "400",
      lineHeight: 41,
      letterSpacing: 34 * 11 / 1000,
    },
    title1: {
      fontSize: 28,
      fontWeight: "400",
      lineHeight: 34,
      letterSpacing: 28 * 13 / 1000,
    },
    title2: {
      fontSize: 22,
      fontWeight: "400",
      lineHeight: 28,
      letterSpacing: 22 * 16 / 1000,
    },
    title3: {
      fontSize: 20,
      fontWeight: "400",
      lineHeight: 25,
      letterSpacing: 20 * 19 / 1000,
    },
    headline: {
      fontSize: 17,
      fontWeight: "600",
      lineHeight: 22,
      letterSpacing: 17 * -24 / 1000,
    },
    body: {
      fontSize: 17,
      fontWeight: "400",
      lineHeight: 22,
      letterSpacing: 17 * -24 / 1000,
    },
    callout: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 21,
      letterSpacing: 16 * -20 / 1000,
    },
    subhead: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 20,
      letterSpacing: 15 * -16 / 1000,
    },
    footnote: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 18,
      letterSpacing: 13 * -6 / 1000,
    },
    caption1: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 16,
      letterSpacing: 12 * 0 / 1000,
    },
    caption2: {
      fontSize: 11,
      fontWeight: "400",
      lineHeight: 13,
      letterSpacing: 11 * 6 / 1000,
    }
  }

  render(): any {
    var st;
    if (typeof this.props.style === "object") {
      st = Object.assign({}, this.styles[this.props.textStyle], {
        fontSize: this.styles[this.props.textStyle].fontSize * this.scale,
        letterSpacing: this.styles[this.props.textStyle].letterSpacing * this.scale
      }, this.props.style)
    } else {
      st = StyleSheet.flatten([this.styles[this.props.textStyle], {
        fontSize: this.styles[this.props.textStyle].fontSize * this.scale,
        letterSpacing: this.styles[this.props.textStyle].letterSpacing * this.scale
      }, this.props.style])
    }
    return (
      <Text {...this.props} style={st}>
        {this.props.text ? String(this.props.text) : this.props.children ? String(this.props.children) : ''}
      </Text>
    );
  }
}