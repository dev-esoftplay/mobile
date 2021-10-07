// noPage

import { fastFilter, fastLoop } from './../../fast';
import moment from "../../moment"
import { Linking, Platform, Share } from "react-native"
import { esp, LibToastProperty, _global, createCache } from "esoftplay"
import shorthash from "shorthash"
import * as Clipboard from 'expo-clipboard';
const Buffer = require('buffer/').Buffer
const isEqual = require("react-fast-compare");

export interface LibUtilsDate {
  year: string,
  month: string,
  date: string,
}

export type LibUtilsTravelMode = 'driving' | 'walking'
let installationIdDefault
const installationId = createCache(installationIdDefault, { persistKey: 'installationId' })
const cache = createCache<any>({ inDebounce: undefined })
export default class eutils {

  static checkUndefined(obj: any, cursorsAsString: string): boolean {
    var args = cursorsAsString.split('.')
    for (var i = 0; i < args.length; i++) {
      if (!obj || !obj.hasOwnProperty(args[i])) {
        return false;
      }
      obj = obj[args[i]];
    }
    return true;
  }

  static debounce(func: () => any, delay: number): void {
    clearTimeout(cache.get()?.inDebounce)
    cache.set({ ...cache.get(), inDebounce: setTimeout(() => func(), delay) })
  }

  static decodeBase64(chipper: string): string {
    return Buffer.from(chipper, 'base64').toString('ascii')
  }
  static encodeBase64(plain: string): string {
    return Buffer.from(plain, 'ascii').toString('base64')
  }

  static qrGenerate(string: string, size?: number): string {
    size = size || 20
    return 'http://qrcode.kaywa.com/img.php?s=' + size + '&d=' + string
  }

  static uniqueArray(array: any[]): any[] {
    let cleanArray = []
    fastLoop(array, (item) => {
      if (fastFilter(cleanArray, (ca) => isEqual(ca, item)).length == 0) {
        cleanArray.push(item)
      }
    })
    return cleanArray
  }

  static getArgs(props: any, key: string, defOutput?: any): any {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params?.[key] || defOutput;
  }
  static getArgsAll<S>(props: any, defOutput?: any): S {
    if (defOutput == undefined) {
      defOutput = "";
    }
    return props?.route?.params || defOutput;
  }

  static objectToUrlParam(obj: any): string {
    return Object.keys(obj).map((key, index) => {
      let out = ''
      out += index == 0 ? '?' : '&'
      out += [key] + '=' + obj[key]
      return out
    }).join('')
  }

  static moment(date?: string, locale?: any) {
    if (locale) {
      moment().locale(locale)
    }
    return moment(date)
  }

  static getUrlParams(url: string): any {
    let hashes = url.slice(url.indexOf('?') + 1).split('&')
    let params = {}
    hashes.map(hash => {
      let [key, val] = hash.split('=')
      params[key] = decodeURIComponent(val)
    })
    return params
  }

  static getTimezoneByConfig(datetime?: Date | string): string {
    let timezone = esp.config("timezone")
    if (!datetime) {
      datetime = new Date()
    }
    return moment(datetime).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
  }

  static getRatingValue(rating: string): number {
    return rating?.split?.(',')?.map?.((item) => parseInt(item))?.reduce?.((acc, curr, index) => acc + (curr * (index + 1)))
  }

  static getRatingCount(rating: string): number {
    return rating?.split?.(',')?.map?.((item) => parseInt(item))?.reduce?.((acc, curr) => acc + curr)
  }

  static getRating(rating: string, decimalPlaces?: number): string {
    if (decimalPlaces == undefined) {
      decimalPlaces = 1
    }
    return (eutils.getRatingValue(rating) / eutils.getRatingCount(rating))?.toFixed?.(decimalPlaces)
  }

  static money(value: string | number, currency?: string): string {
    if (!value) value = 0
    var val;
    if (typeof value === "number") {
      val = value?.toFixed?.(0)?.replace?.(/(\d)(?=(\d{3})+$)/g, "$1,")
    } else {
      val = parseInt(value)?.toFixed?.(0)?.replace?.(/(\d)(?=(\d{3})+$)/g, "$1,")
    }
    if ((typeof value == "string" ? parseInt(value) : value) <= 0) {
      val = "0"
    }
    if (!currency) {
      currency = "Rp"
    }
    if (typeof val === "number") {
      return currency?.replace?.(/\./g, "") + " " + String(val)?.replace?.(/,/g, ".");
    } else {
      return currency?.replace?.(/\./g, "") + " " + val?.replace?.(/,/g, ".");
    }
  }

  static numberAbsolute(toNumber: string | number): number {
    let _toNumber = typeof toNumber == 'string' ? Number(toNumber) : toNumber
    return Math.abs(_toNumber || 0)
  }

  static number(toNumber: string | number): string {
    var toNumb = typeof toNumber === "number" ? toNumber.toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1,") : parseInt(toNumber).toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1,")
    return String(toNumb).replace(/,/g, ".");
  }

  static countDays(start: string | Date, end: string | Date): number {
    var _start = start instanceof Date ? start.getTime() : new Date(start).getTime()
    var _end = end instanceof Date ? end.getTime() : new Date(end).getTime()
    var diff = Math.abs(_end - _start)
    var oneDay = 1000 * 60 * 60 * 24
    var day = Math.floor(diff / oneDay)
    return day
  }

  static getDateTimeSeconds(start: string | Date, end: string | Date): number {
    var mStart = start instanceof Date ? start : moment(start).toDate()
    var mEnd = end instanceof Date ? end : moment(end).toDate()
    var stampStart = mStart.getTime()
    var stampEnd = mEnd.getTime()
    if (stampStart >= stampEnd) {
      return 0
    } else {
      return Math.round((stampEnd - stampStart) / 1000)
    }
  }

  static ucwords(str: string): string {
    return str?.replace?.(/\w\S*/g, function (txt) {
      return txt?.charAt?.(0)?.toUpperCase?.() + txt?.substr?.(1)?.toLowerCase?.();
    });
  }
  static getCurrentDateTime(format?: string): string {
    if (!format) {
      format = "YYYY-MM-DD kk:mm:ss";
    }
    moment().locale(esp.langId());
    return String(moment(new Date()).format(format))
  }

  static getDateRange(start_date: string, end_date: string, separator?: string, format?: LibUtilsDate): string {
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
  }


  static getDateAsFormat(input: string, format?: string): string {
    if (!format) {
      format = "dddd, DD MMMM YYYY";
    }
    moment().locale(esp.langId());
    return moment(input).format(format)
  }
  static telTo(number: string | number): void {
    if (typeof number == "string")
      number = number.match(/\d+/g).join('')
    Linking.openURL("tel:" + number)
  }
  static smsTo(number: string | number, message?: string): void {
    if (typeof number == 'string')
      number = number.match(/\d+/g).join('')
    if (!message) {
      message = "";
    }
    var sparator = Platform.OS == "ios" ? "&" : "?"
    Linking.openURL("sms:" + number + sparator + "body=" + message)
  }
  static mailTo(email: string, subject?: string, message?: string): void {
    if (!subject) {
      subject = "";
    }
    if (!message) {
      message = "";
    }
    Linking.openURL("mailto:" + email + "?subject=" + subject + "&body=" + message)
  }
  static waTo(number: string, message?: string): void {
    number = number.match(/\d+/g).join('')
    if (!message) {
      message = "";
    }
    Linking.openURL("https://api.whatsapp.com/send?phone=" + number + "&text=" + encodeURI(message))
  }
  static mapTo(title: string, latlong: string): void {
    Linking.openURL("http://maps.google.com/maps?q=loc:" + latlong + "(" + title + ")")
  }

  static isValidLatLong(latlong: string): boolean {
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
  }

  static mapDirectionTo(latlongFrom: string, latlongTo: string, travelmode: LibUtilsTravelMode): void {
    if (!eutils.isValidLatLong(latlongFrom)) {
      return LibToastProperty.show('LatLongFrom tidak valid')
    }
    if (!eutils.isValidLatLong(latlongTo)) {
      return LibToastProperty.show('LatlongTo tidak valid')
    }
    Linking.openURL("https://www.google.com/maps/dir/?api=1&travelmode="
      + travelmode
      + "&dir_action=navigate&destination="
      + encodeURI(latlongTo)
      + "&origin="
      + encodeURI(latlongFrom))
  }

  static copyToClipboard(string: string): Promise<any> {
    return new Promise((r) => {
      Clipboard.setString(string)
      r(true)
    })
  }
  static colorAdjust(hex: string, lum: number): string {
    hex = hex.replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    var rgb = "#",
      c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  }

  static escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  static hexToRgba(hex: string, alpha: number): string {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => { return r + r + g + g + b + b; });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + alpha + ")"
  }

  static shorten(string: string): string {
    return shorthash.unique(string)
  }

  static share(url: string, message?: string): void {
    Share.share({
      message: url + (message ? ('\n' + message) : "")
    });
  }

  static getInstallationID(): string {
    let out = installationId.get()
    if (!out) {
      out = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }))
      installationId.set(out)
    }
    return out
  }

  static sprintf(string: string, ...stringToBe: any[]): string {
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