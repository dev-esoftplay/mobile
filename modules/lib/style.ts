// noPage

import { Dimensions, Platform, StatusBar } from "react-native";

const { height, width } = Dimensions.get("window");
const STATUSBAR_HEIGHT = (Platform.OS === "ios" ? isIphoneX() ? 44 : 20 : StatusBar.currentHeight) || 0;
const STATUSBAR_HEIGHT_MASTER = (Platform.OS === "ios" ? isIphoneX() ? 44 : 20 : StatusBar.currentHeight) || 0;
const colorPrimary = "#3E50B4"
const colorPrimaryDark = "#3E50B4"
const colorAccent = "#FFF"
const colorGrey = "#F1F1F3"
const colorRed = "darkred"
const colorTextPrimary = "#353535"
const colorTextBody = "#353535"
const colorTextCaption = "#686868"
const colorLightGrey = "#fbfbfb"
const colorNavigationBar = "white"

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

export default class m {
  static isIphoneX = isIphoneX()
  static STATUSBAR_HEIGHT = STATUSBAR_HEIGHT
  static STATUSBAR_HEIGHT_MASTER = STATUSBAR_HEIGHT_MASTER
  static colorPrimary = colorPrimary
  static colorPrimaryDark = colorPrimaryDark
  static colorNavigationBar = colorNavigationBar
  static colorAccent = colorAccent
  static colorGrey = colorGrey
  static colorRed = colorRed
  static colorTextPrimary = colorTextPrimary
  static colorTextBody = colorTextBody
  static colorTextCaption = colorTextCaption
  static colorLightGrey = colorLightGrey
  static width = width
  static height = height
  static defaultStyle = defaultStyle
  static elevation = (val: number): any => { return elevation(val) }
}


function elevation(value: any): any {
  if (Platform.OS === "ios") {
    if (value == 0) return {}
    return { shadowColor: "black", shadowOffset: { width: 0, height: value / 2 }, shadowRadius: value, shadowOpacity: 0.24 }
  } else if (Platform.OS == 'web') {
    return { boxShadow: `${0 * value}px ${0.5 * value}px ${value}px ${'rgba(0,0,0,0.24)'}` }
  }

  return { elevation: value }
}
function isIphoneX() {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 780 ||
      dimen.width === 780 ||
      dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 844 ||
      dimen.width === 844 ||
      dimen.height === 896 ||
      dimen.width === 896 ||
      dimen.height === 926 ||
      dimen.width === 926)
  );
}