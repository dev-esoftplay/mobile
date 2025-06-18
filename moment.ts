//@ts-nocheck

import dayjs from 'dayjs'
import esp from 'esoftplay/esp'
import useSafeState from 'esoftplay/state'
import { useEffect } from 'react'
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
const relativeTime = require('dayjs/plugin/relativeTime')
var duration = require('dayjs/plugin/duration')
const localeData = require('dayjs/plugin/localeData')
dayjs.extend(localeData)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
const momentType: any = ["days", "weeks", "months", "quarters", "years", "hours", "minutes", "seconds", "milliseconds"]
const dayjsType: any = ["day", "week", "month", "quarter", "year", "hour", "minute", "second", "millisecon",]


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function setTimeOffset(date?: string | Date | any): Date {
  const _date = (date instanceof Date ? date : (typeof date == 'string' ? new Date(date) : new Date()))
  let currentOffsetInMinutes = _date.getTimezoneOffset();
  let currentOffsetInHours = currentOffsetInMinutes / 60;
  let currentGMT = -currentOffsetInHours;
  let currentOffset = currentGMT * 60 * 60 * 1000;
  let targetOffset = 7/* Asia/Jakarta */ * 60 * 60 * 1000;
  let gmtDiff = targetOffset - currentOffset;
  let timeWithOffset = new Date(_date.getTime() + gmtDiff);
  return timeWithOffset
}
export function resetTimeOffset(date: Date): Date {
  if (!(date instanceof Date)) {
    date = dayjs(date).toDate()
  }
  let currentOffsetInMinutes = date.getTimezoneOffset();
  let currentOffsetInHours = currentOffsetInMinutes / 60;
  let currentGMT = -currentOffsetInHours;
  let currentOffset = currentGMT * 60 * 60 * 1000;
  let targetOffset = 7/* Asia/Jakarta */ * 60 * 60 * 1000;
  let gmtDiff = targetOffset - currentOffset;
  let originalTime = new Date(date.getTime() - gmtDiff);
  return originalTime;
}


export function useLocalFormatOnline(custom): [string, () => void] {
  const [date, setDate] = useSafeState()

  function get() {
    const fetchtime = performance.now();
    fetch('https://worldtimeapi.org/api/ip')
      .then((res) => res.json())
      .then((res) => {
        const onlineTime = new Date(new Date(res.utc_datetime).getTime() + performance.now() - (fetchtime) + 2000)
        const out = dayjs(onlineTime).format(custom)
        setDate(out)
      })
      .catch(() => {
        setDate(dayjs(new Date()).format(custom))
      })
  }

  useEffect(get, [])

  return [date, get]
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/moment.md) untuk melihat dokumentasi*/
export default function moment(date?: string | Date | any) {
  let _date = isNumeric(date) ? new Date(date * 1000) : date
  const langData = Object.values(esp.config('lang'))
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
    locale: (locale_id: string) => {
      require('dayjs/locale/en')
      require('dayjs/locale/id')
      require('dayjs/locale/zh-cn')
      // Remove global locale set, just return a new moment with locale set on instance
      const out = dayjs(_date).locale(locale_id)
      return moment(out)
    },
    /* last chain */
    fromNow: () => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code
      // Set locale on instance, not globally
      const out = dayjs(resetTimeOffset(_date)).locale(localeId).fromNow()
      return out
    },
    format: (custom: string, ignoreTimezone?: boolean) => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code || 'en'
      try {
        require(`dayjs/locale/${localeId}`)
      } catch (e) {
      }
      const _d = ignoreTimezone ? _date : resetTimeOffset(_date)
      // Set locale on instance, not globally
      const out = dayjs(_d).locale(localeId).format(custom)
      return out
    },
    serverFormat: (custom: string) => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code || 'en'
      try {
        require(`dayjs/locale/${localeId}`)
      } catch (e) {
      }
      const _d = resetTimeOffset(_date)
      const out = dayjs(_d).locale(localeId).format(custom)
      return out
    },
    localeFormat: (custom: string, ignoreTimezone?: boolean) => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code || 'en'
      try {
        require(`dayjs/locale/${localeId}`)
      } catch (e) {
      }
      const _d = _date
      const out = dayjs(_d).locale(localeId).format(custom)
      return out
    },
    toDate: () => {
      const out = dayjs(_date).toDate()
      return out
    },
    toMiliseconds: () => {
      const out = String(dayjs(resetTimeOffset(_date)).valueOf())
      return out
    },
    duration: (other_date: string | Date) => {
      const x = dayjs(_date)
      const y = dayjs(other_date)
      return dayjs.duration(x.diff(y))
    },
  }
}

