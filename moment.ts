//@ts-nocheck

import dayjs from 'dayjs'

const momentType: any = ["days", "weeks", "months", "quarters", "years", "hours", "minutes", "seconds", "milliseconds"]
const dayjsType: any = ["day", "week", "month", "quarter", "year", "hour", "minute", "second", "millisecon",]

export default function moment(date?: string | Date | any) {
  let _date: any
  if (!isNaN(date)) {
    _date = dayjs.unix(date)
  } else {
    _date = date
  }
  let result: any = undefined
  let self: any = this
  return {
    toDate: () => {
      result = dayjs((result || _date)).toDate()
      return result
    },
    format: (custom: string) => {
      result = dayjs((result || _date)).format(custom)
      return result
    },
    add: (count: number, type: "days" | "weeks" | "months" | "quarters" | "years" | "hours" | "minutes" | "seconds" | "milliseconds") => {
      result = dayjs((result || _date)).add(count, (dayjsType[momentType.indexOf(type)]))
      return self
    },
    subtract: (count: number, type: "days" | "weeks" | "months" | "quarters" | "years" | "hours" | "minutes" | "seconds" | "milliseconds") => {
      result = dayjs((result || _date)).subtract(count, (dayjsType[momentType.indexOf(type)]))
      return self
    },
    fromNow: () => {
      const relativeTime = require('dayjs/plugin/relativeTime')
      dayjs.extend(relativeTime)
      result = dayjs((result || _date)).fromNow()
      return result
    },
    tz: (timeZone: string) => {
      var utc = require('dayjs/plugin/utc')
      var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
      dayjs.extend(utc)
      dayjs.extend(timezone)
      result = dayjs.tz((result || _date), timeZone)
      return result
    },
    locale: (locale_id: "af" | "am" | "ar-dz" | "ar-kw" | "ar-ly" | "ar-ma" | "ar-sa" | "ar-tn" | "ar" | "az" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "cs" | "cv" | "cy" | "da" | "de-at" | "de-ch" | "de" | "dv" | "el" | "en-au" | "en-ca" | "en-gb" | "en-ie" | "en-il" | "en-in" | "en-nz" | "en-sg" | "en-tt" | "en" | "eo" | "es-do" | "es-pr" | "es-us" | "es" | "fi" | "fo" | "fr-ca" | "fr-ch" | "fr" | "fy" | "ga" | "gd" | "gl" | "gom-latn" | "gu" | "he" | "hi" | "hr" | "ht" | "hu" | "hy-am" | "id" | "is" | "it-ch" | "it" | "ja" | "jv" | "ka" | "kk" | "km" | "kn" | "ko" | "ku" | "ky" | "lb" | "lo" | "lt" | "lv" | "me" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms-my" | "ms" | "mt" | "my" | "nb" | "ne" | "nl-be" | "nl" | "nn" | "oc-lnc" | "pa-in" | "pl" | "pt-br" | "pt" | "ro" | "ru" | "rw" | "sd" | "se" | "si" | "sk" | "sl" | "sq" | "sr-cyrl" | "sr" | "ss" | "sv-fi" | "sv" | "sw" | "ta" | "te" | "tet" | "tg" | "th" | "tk" | "tl-ph" | "tlh" | "tr" | "tzl" | "tzm-latn" | "tzm" | "ug-cn" | "uk" | "ur" | "uz-latn" | "uz" | "vi" | "x-pseudo" | "yo" | "zh-cn" | "zh-hk" | "zh-tw" | "zh" | "et" | "eu" | "fa") => {
      require('dayjs/locale/en')
      require('dayjs/locale/id')
      result = dayjs.locale(locale_id)
      return self
    }
  }
}

