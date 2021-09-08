//@ts-nocheck

import dayjs from 'dayjs'
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
const relativeTime = require('dayjs/plugin/relativeTime')
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
const momentType: any = ["days", "weeks", "months", "quarters", "years", "hours", "minutes", "seconds", "milliseconds"]
const dayjsType: any = ["day", "week", "month", "quarter", "year", "hour", "minute", "second", "millisecon",]


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default function moment(date?: string | Date | any) {
  let _date = isNumeric(date) ? new Date(date * 1000) : date
  return {
    add: (count: number, type: "days" | "weeks" | "months" | "quarters" | "years" | "hours" | "minutes" | "seconds" | "milliseconds") => {
      const out = dayjs(_date).add(count, (dayjsType[momentType.indexOf(type)]))
      return moment(out)
    },
    subtract: (count: number, type: "days" | "weeks" | "months" | "quarters" | "years" | "hours" | "minutes" | "seconds" | "milliseconds") => {
      const out = dayjs(_date).subtract(count, (dayjsType[momentType.indexOf(type)]))
      return moment(out)
    },
    tz: (timeZone: string): this => {
      const out = dayjs(_date).tz(timeZone)
      return moment(out)
    },
    locale: (locale_id: "af" | "am" | "ar-dz" | "ar-kw" | "ar-ly" | "ar-ma" | "ar-sa" | "ar-tn" | "ar" | "az" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "cs" | "cv" | "cy" | "da" | "de-at" | "de-ch" | "de" | "dv" | "el" | "en-au" | "en-ca" | "en-gb" | "en-ie" | "en-il" | "en-in" | "en-nz" | "en-sg" | "en-tt" | "en" | "eo" | "es-do" | "es-pr" | "es-us" | "es" | "fi" | "fo" | "fr-ca" | "fr-ch" | "fr" | "fy" | "ga" | "gd" | "gl" | "gom-latn" | "gu" | "he" | "hi" | "hr" | "ht" | "hu" | "hy-am" | "id" | "is" | "it-ch" | "it" | "ja" | "jv" | "ka" | "kk" | "km" | "kn" | "ko" | "ku" | "ky" | "lb" | "lo" | "lt" | "lv" | "me" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms-my" | "ms" | "mt" | "my" | "nb" | "ne" | "nl-be" | "nl" | "nn" | "oc-lnc" | "pa-in" | "pl" | "pt-br" | "pt" | "ro" | "ru" | "rw" | "sd" | "se" | "si" | "sk" | "sl" | "sq" | "sr-cyrl" | "sr" | "ss" | "sv-fi" | "sv" | "sw" | "ta" | "te" | "tet" | "tg" | "th" | "tk" | "tl-ph" | "tlh" | "tr" | "tzl" | "tzm-latn" | "tzm" | "ug-cn" | "uk" | "ur" | "uz-latn" | "uz" | "vi" | "x-pseudo" | "yo" | "zh-cn" | "zh-hk" | "zh-tw" | "zh" | "et" | "eu" | "fa") => {
      require('dayjs/locale/en')
      require('dayjs/locale/id')
      const out = dayjs.locale(locale_id)
      return moment(out)
    },
    /* last chain */
    fromNow: () => {
      const out = dayjs(_date).fromNow()
      return out
    },
    format: (custom: string) => {
      const out = dayjs(_date).format(custom)
      return out
    },
    toDate: () => {
      const out = dayjs(_date).toDate()
      return out
    },
    toMiliseconds: () => {
      const out = String(dayjs(_date).valueOf())
      return out
    },
    duration: (other_date: string | Date) => {
      const x = dayjs(_date)
      const y = dayjs(other_date)
      return dayjs.duration(x.diff(y))
    },
  }
}

