// noPage
import { Dimensions, Platform, StatusBar } from "react-native";
function isIphoneX() {
  const dimen = Dimensions.get('window');
  const dimenHeight = [780, 812, 844, 852, 896, 926, 932, 1170]
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (dimenHeight.includes(dimen.height) || dimenHeight.includes(dimen.width))
  );
}
/* LIVE */

const { height, width } = Dimensions.get("window");
const STATUSBAR_HEIGHT = (Platform.OS === "ios" ? isIphoneX() ? 44 : 20 : StatusBar.currentHeight) || 0;
const STATUSBAR_HEIGHT_MASTER = (Platform.OS === "ios" ? isIphoneX() ? 44 : 20 : StatusBar.currentHeight) || 0;
const colorPrimary = "#FFC523";
const colorPrimaryMarket = "#A62287";
const colorPrimaryMart = "#40CEFF";
const colorPrimaryDark = "#FFC523";
const colorAccent = "#FFF";
const colorGrey = "#F1F1F3";
const colorTextPrimary = "#9e9e9e";
const headerHeight = 56
const colorBgGrey = '#EEF1F8';

const colorBrown = '#704728'
const colorBrownLight = '#C5906C'
const colorRed = "#dc143c";
const colorBlue = "#3EA4DC";
const colorGreen = "#2CB159";
const colorLightGrey = "#EDEDED";
const colorTextBody = "#909090";
const colorTextCaption = "#BEBEBE";

function elevation(value: any): any {
  if (Platform.OS === "ios") {
    if (value == 0) return {}
    return { shadowColor: "black", shadowOffset: { width: 0, height: value / 2 }, shadowRadius: value, shadowOpacity: 0.24 }
  }
  return { elevation: value }
}
// Add your default style here
/*
Sample :

###################
le
const styles = StyleSheet.create({
  container: {
    ...defaultStyle.container
  },
});

##################

*/

const defaultStyle = {
  container: {
    flex: 1,
  },
  imageSliderSize: {
    width: width,
    height: width * 0.8 // make image ratio square
  },
  statusBar: {
    height: STATUSBAR_HEIGHT_MASTER,
    backgroundColor: colorPrimaryDark
  },
  overflowHidden: {
    overflow: "hidden"
  },
  textPrimary13: {
    fontSize: 13,
    color: colorPrimary
  },
  textPrimaryDark13: {
    fontSize: 13,
    color: colorPrimaryDark
  },
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/style.md) untuk melihat dokumentasi*/
export default class Style {
  static isIphoneX: boolean = isIphoneX();
  static STATUSBAR_HEIGHT: number = STATUSBAR_HEIGHT;
  static STATUSBAR_HEIGHT_MASTER: number = STATUSBAR_HEIGHT_MASTER;
  static colorPrimary: string = colorPrimary;
  static colorPrimaryDark: string = colorPrimaryDark;
  static colorPrimaryMarket: string = colorPrimaryMarket;
  static colorPrimaryMart: string = colorPrimaryMart;
  static colorAccent: string = colorAccent;
  static colorGrey: string = colorGrey;
  static colorBrownLight: string = colorBrownLight;
  static colorBgGrey: string = colorBgGrey;
  static colorBrown: string = colorBrown;
  static colorGreen: string = colorGreen;
  static colorBlue: string = colorBlue;
  static colorRed: string = colorRed;
  static colorTextPrimary: string = colorTextPrimary;
  static colorTextBody: string = colorTextBody;
  static colorTextCaption: string = colorTextCaption;
  static colorLightGrey: string = colorLightGrey;
  static elevation(val: number): any { return elevation(val) };
  static width: number = width;
  static height: number = height;
  static defaultStyle: any = defaultStyle;
  static headerHeight: number = headerHeight;
}