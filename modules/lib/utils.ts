// noPage
// withObject
import { LibLocale } from 'esoftplay/cache/lib/locale/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import moment from "esoftplay/moment";
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { Linking, Platform, Share } from "react-native";
import shorthash from "shorthash";
const Buffer = require('buffer/').Buffer
const isEqual = require("react-fast-compare");

export interface LibUtilsDate {
  year: string,
  month: string,
  date: string,
}

export type LibUtilsTravelMode = 'driving' | 'walking'
let installationIdDefault
const installationId = useGlobalState(installationIdDefault, { persistKey: 'deviceId', loadOnInit: true })
const cache = useGlobalState<any>({ inDebounce: undefined })

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md) untuk melihat dokumentasi*/
export default {
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#checkUndefined) untuk melihat dokumentasi*/
  checkUndefined(obj: any, cursorsAsString: string): boolean {
    var args = cursorsAsString.split('.')
    for (var i = 0; i < args.length; i++) {
      if (!obj || !obj.hasOwnProperty(args[i])) {
        return false;
      }
      obj = obj[args[i]];
    }
    return true;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#debounce) untuk melihat dokumentasi*/
  debounce(func: () => any, delay: number): void {
    clearTimeout(cache.get()?.inDebounce)
    cache.set({ ...cache.get(), inDebounce: setTimeout(() => func(), delay) })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#decodeBase64) untuk melihat dokumentasi*/
  decodeBase64(chipper: string): string {
    return Buffer.from(chipper, 'base64').toString('ascii')
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#encodeBase64) untuk melihat dokumentasi*/
  encodeBase64(plain: string): string {
    return Buffer.from(plain, 'ascii').toString('base64')
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#qrGenerate) untuk melihat dokumentasi*/
  qrGenerate(string: string, size?: number): string {
    size = size || 20
    return 'http://qrcode.kaywa.com/img.php?s=' + size + '&d=' + string
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#uniqueArray) untuk melihat dokumentasi*/
  uniqueArray(array: any[]): any[] {
    let cleanArray: any[] = []
    array.forEach((item) => {
      if (cleanArray.filter((ca) => isEqual(ca, item)).length == 0) {
        cleanArray.push(item)
      }
    })
    return cleanArray
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getArgs) untuk melihat dokumentasi*/
  getArgs(props: any, key: string, defOutput?: any): any {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params?.[key] || defOutput;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getArgsAll) untuk melihat dokumentasi*/
  getArgsAll<S>(props: any, defOutput?: any): S {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params || defOutput;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#objectToUrlParam) untuk melihat dokumentasi*/
  objectToUrlParam(obj: any): string {
    return Object.keys(obj).map((key, index) => {
      let out = ''
      out += index == 0 ? '?' : '&'
      out += [key] + '=' + obj[key]
      return out
    }).join('')
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#moment) untuk melihat dokumentasi*/
  moment(date?: string, locale?: any) {
    if (locale) {
      moment().locale(locale)
    }
    return moment(date)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getUrlParams) untuk melihat dokumentasi*/
  getUrlParams(url: string): any {
    let hashes = url.slice(url.indexOf('?') + 1).split('&')
    let params = {}
    hashes.map(hash => {
      let [key, val] = hash.split('=')
      params[key] = decodeURIComponent(val)
    })
    return params
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getTimezoneByConfig) untuk melihat dokumentasi*/
  getTimezoneByConfig(datetime?: Date | string): string {
    let timezone = esp.config("timezone")
    if (!datetime) {
      datetime = new Date()
    }
    return moment(datetime).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getRatingValue) untuk melihat dokumentasi*/
  getRatingValue(rating: string): number {
    return rating?.split?.(',')?.map?.((item) => parseInt(item))?.reduce?.((acc, curr, index) => acc + (curr * (index + 1)))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getRatingCount) untuk melihat dokumentasi*/
  getRatingCount(rating: string): number {
    return rating?.split?.(',')?.map?.((item) => parseInt(item))?.reduce?.((acc, curr) => acc + curr)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getRating) untuk melihat dokumentasi*/
  getRating(rating: string, decimalPlaces?: number): string {
    if (decimalPlaces == undefined) {
      decimalPlaces = 1
    }
    return (this.getRatingValue(rating) / this.getRatingCount(rating))?.toFixed?.(decimalPlaces)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#money) untuk melihat dokumentasi*/
  money(value: string | number, currency?: string): string {
    if (!value) value = 0;

    let numberValue = typeof value === "number" ? value : parseFloat(value);

    // Dapatkan locale & tentukan currency
    const locale = LibLocale.state().get();
    if (!currency) {
      currency = locale === "id" ? "Rp" : "IDR";
    }

    // Cek apakah IDR/Rp → format Indonesia
    const isIDR = currency === "IDR" || currency === "Rp";

    // Jika IDR, bulatkan angkanya
    numberValue = isIDR ? Math.round(numberValue) : numberValue;

    let val = isIDR ? numberValue.toFixed(0) : String(Math.round(numberValue * 100) / 100)
    // let val = isIDR?  numberValue.toFixed(isIDR ? 0 : isInteger ? 0 : 2);

    // Pisahkan jadi integer dan decimal
    const parts = val.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1] || "";

    // Format ribuan
    integerPart = isIDR
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") // ribuan titik
      : integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // ribuan koma

    // Gabungkan dengan desimal sesuai format
    val = decimalPart && !isIDR
      ? `${integerPart}.${decimalPart}`
      : integerPart;

    return currency.replace(/\./g, "") + " " + val;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#numberAbsolute) untuk melihat dokumentasi*/
  numberAbsolute(toNumber: string | number): number {
    let _toNumber = typeof toNumber == 'string' ? Number(toNumber) : toNumber
    return Math.abs(_toNumber || 0)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#number) untuk melihat dokumentasi*/
  number(toNumber: string | number): string {
    if (!toNumber) toNumber = '0'
    var toNumb = typeof toNumber === "number" ? toNumber.toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1,") : parseInt(toNumber).toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1,")
    return String(toNumb).replace(/,/g, ".");
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#countDays) untuk melihat dokumentasi*/
  countDays(start: string | Date, end: string | Date): number {
    var _start = start instanceof Date ? start.getTime() : new Date(start).getTime()
    var _end = end instanceof Date ? end.getTime() : new Date(end).getTime()
    var diff = Math.abs(_end - _start)
    var oneDay = 1000 * 60 * 60 * 24
    var day = Math.floor(diff / oneDay)
    return day
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getDateTimeSeconds) untuk melihat dokumentasi*/
  getDateTimeSeconds(start: string | Date, end: string | Date): number {
    var mStart = start instanceof Date ? start : moment(start).toDate()
    var mEnd = end instanceof Date ? end : moment(end).toDate()
    var stampStart = mStart.getTime()
    var stampEnd = mEnd.getTime()
    if (stampStart >= stampEnd) {
      return 0
    } else {
      return Math.round((stampEnd - stampStart) / 1000)
    }
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#ucwords) untuk melihat dokumentasi*/
  ucwords(str: string): string {
    return str?.replace?.(/\w\S*/g, function (txt) {
      return txt?.charAt?.(0)?.toUpperCase?.() + txt?.substr?.(1)?.toLowerCase?.();
    });
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getCurrentDateTime) untuk melihat dokumentasi*/
  getCurrentDateTime(format?: string): string {
    if (!format) {
      format = "YYYY-MM-DD kk:mm:ss";
    }
    moment().locale(esp.langId());
    return String(moment(new Date()).format(format))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getDateRange) untuk melihat dokumentasi*/
  getDateRange(start_date: string, end_date: string, separator?: string, format?: LibUtilsDate): string {
    if (!separator) {
      separator = ' - '
    }
    let _format: any = format || {}
    if (!format) {
      _format.year = ' YYYY'
      _format.month = ' MMMM'
      _format.date = 'DD'
    }
    let out = ''
    if (start_date == end_date) {
      out = moment(start_date).format(_format.date + _format.month + _format.year)
    } else {
      var ds = moment(start_date).toDate()
      var de = moment(end_date).toDate()
      if (ds.getFullYear() == de.getFullYear()) {
        if (ds.getMonth() == de.getMonth()) {
          out = moment(start_date).format(_format.date) + separator + moment(end_date).format(_format.date) + moment(start_date).format(_format.month + _format.year)
        } else {
          out = moment(start_date).format(_format.date + _format.month) + separator + moment(end_date).format(_format.date + _format.month) + moment(start_date).format(_format.year)
        }
      } else {
        out = moment(start_date).format(_format.date + _format.month + _format.year) + separator + moment(end_date).format(_format.date + _format.month + _format.year)
      }
    }
    return out
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getDateAsFormat) untuk melihat dokumentasi*/
  getDateAsFormat(input: string, format?: string): string {
    if (!format) {
      format = "dddd, DD MMMM YYYY";
    }
    moment().locale(esp.langId());
    return moment(input).format(format)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#telTo) untuk melihat dokumentasi*/
  telTo(number: string | number): void {
    if (typeof number == "string")
      number = number.match(/\d+/g)?.join('')
    Linking.openURL("tel:" + number)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#smsTo) untuk melihat dokumentasi*/
  smsTo(number: string | number, message?: string): void {
    if (typeof number == 'string')
      number = number.match(/\d+/g)?.join('')
    if (!message) {
      message = "";
    }
    var sparator = Platform.OS == "ios" ? "&" : "?"
    Linking.openURL("sms:" + number + sparator + "body=" + message)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#mailTo) untuk melihat dokumentasi*/
  mailTo(email: string, subject?: string, message?: string): void {
    if (!subject) {
      subject = "";
    }
    if (!message) {
      message = "";
    }
    Linking.openURL("mailto:" + email + "?subject=" + subject + "&body=" + message)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#waTo) untuk melihat dokumentasi*/
  waTo(number: string, message?: string): void {
    number = number.match(/\d+/g)?.join('')
    if (!message) {
      message = "";
    }
    Linking.openURL("https://api.whatsapp.com/send?phone=" + number + "&text=" + encodeURI(message))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#mapTo) untuk melihat dokumentasi*/
  mapTo(title: string, latlong: string): void {
    Linking.openURL("http://maps.google.com/maps?q=loc:" + latlong + "(" + title + ")")
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#isValidLatLong) untuk melihat dokumentasi*/
  isValidLatLong(latlong: string): boolean {
    let _latlong: any = latlong
    let valid = true
    if (valid && !_latlong.includes(',')) {
      valid = false
    }
    if (valid && Math.abs(_latlong.split(',')[0] * 1) > 90) {
      valid = false
    }
    if (valid && Math.abs(_latlong.split(',')[1] * 1) > 180) {
      valid = false
    }
    return valid
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#mapDirectionTo) untuk melihat dokumentasi*/
  mapDirectionTo(latlongFrom: string, latlongTo: string, travelmode: LibUtilsTravelMode): void {
    if (!this.isValidLatLong(latlongFrom)) {
      return esp.modProp("lib/toast").show(esp.lang("lib/utils", "toas_latlongfrom"))
    }
    if (!this.isValidLatLong(latlongTo)) {
      return esp.modProp("lib/toast").show(esp.lang("lib/utils", "toas_latlongto"))
    }
    Linking.openURL("https://www.google.com/maps/dir/?api=1&travelmode="
      + travelmode
      + "&dir_action=navigate&destination="
      + encodeURI(latlongTo)
      + "&origin="
      + encodeURI(latlongFrom))
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#copyToClipboard) untuk melihat dokumentasi*/
  copyToClipboard(string: string): Promise<any> {
    return new Promise((r) => {
      Clipboard.setString(string)
      r(true)
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#colorAdjust) untuk melihat dokumentasi*/
  colorAdjust(hex: string, lum: number): string {
    hex = hex.replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#escapeRegExp) untuk melihat dokumentasi*/
  escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#hexToRgba) untuk melihat dokumentasi*/
  hexToRgba(hex: string, alpha: number): string {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => { return r + r + g + g + b + b; });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result)
      return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + alpha + ")"
    return hex
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#shorten) untuk melihat dokumentasi*/
  shorten(string: string): string {
    return shorthash.unique(string)
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#share) untuk melihat dokumentasi*/
  share(url: string, message?: string): void {
    Share.share({
      message: url + (message ? ('\n' + message) : "")
    });
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#getInstallationID) untuk melihat dokumentasi*/
  getInstallationID(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let out = installationId.get()
      if (!out) {
        if (Platform.OS == "android")
          resolve(String(Application.androidId || Application.getAndroidId()))
        if (Platform.OS == "ios") {
          let code = await SecureStore.getItemAsync('installationId');
          if (!code) {
            code = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            }))
          }
          installationId.set(code);
          SecureStore.setItemAsync('installationId', String(code));
          resolve(code);
        }
      }
      resolve(out)
    })
  },
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/utils.md#sprintf) untuk melihat dokumentasi*/
  sprintf(string: string, ...stringToBe: any[]): string {
    function spf(string: string, index: number) {
      if (stringToBe[index] != undefined) {
        string = string.replace("%s", stringToBe[index])
        if (string.includes("%s")) {
          return spf(string, index + 1)
        }
      }
      return string
    }
    if (string.includes("%s")) {
      string = spf(string, 0)
    }
    return string
  }
}