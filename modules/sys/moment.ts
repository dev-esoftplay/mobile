//noPage
//@ts-nocheck

import dayjs from 'dayjs'
import esp from 'esoftplay/esp'
import useSafeState from 'esoftplay/state'
import { useEffect } from 'react'
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

function parseGMTOffset(gmtString) {
  const regex = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/;
  const match = gmtString.match(regex);

  if (!match) {
    return null
  }

  const sign = match[1] === '+' ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;

  return sign * (hours + minutes / 60);
}

export function resetTimeOffset(date: Date, timeZone?: string): Date {
  if (!(date instanceof Date)) {
    date = dayjs(date).toDate()
  }
  let numberTimeZone = 0
  if (timeZone) {
    numberTimeZone = parseGMTOffset(timeZone)
  } else {
    numberTimeZone = esp.config()?.['forcedGMT+']
  }
  let currentOffsetInMinutes = date.getTimezoneOffset();
  let currentOffsetInHours = currentOffsetInMinutes / 60;
  let currentGMT = (numberTimeZone || (-currentOffsetInHours));
  let currentOffset = currentGMT * 60 * 60 * 1000;
  let targetOffset = 7/* Asia/Jakarta */ * 60 * 60 * 1000;
  let gmtDiff = targetOffset - currentOffset;
  let originalTime = new Date(date.getTime() - gmtDiff);
  return originalTime;
}

export function useLocalTimeChecker(callback?: (valid: boolean) => void): boolean {
  const [isValid, setIsValid] = useSafeState()
  const [compare] = useLocalFormatOnline('YYYY-MM-DD HH:mm:ss')
  useEffect(() => {
    const valid = Math.abs(new Date(compare).getTime() - new Date().getTime()) < 5000
    if (typeof callback == "function")
      callback(valid)
    setIsValid(valid)
  }, [])
  return isValid
}


export function useLocalFormatOnline(custom): [string, () => void] {
  const [date, setDate] = useSafeState()

  function get() {
    const fetchtime = performance.now();
    const config = esp.config()
    fetch(`${config.protocol}://${config.domain}${config.uri}t.php`)
      .then((res) => res.json())
      .then((res) => {
        const onlineTime = new Date(Number(res) + performance.now() - (fetchtime) + 2000)
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
      const out = dayjs.locale(locale_id)
      return moment(out)
    },
    /* last chain */
    fromNow: () => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code
      moment().locale(localeId)
      const out = dayjs(resetTimeOffset(_date)).fromNow()
      return out
    },
    format: (custom: string, ignoreTimezone?: boolean) => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code
      moment().locale(localeId)
      const _d = ignoreTimezone ? _date : resetTimeOffset(_date)
      const out = dayjs(_d).format(custom)
      return out
    },
    serverFormat: (custom: string, timezone?: string) => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code
      moment().locale(localeId)
      const _d = resetTimeOffset(_date, timezone)
      const out = dayjs(_d).format(custom)
      return out
    },
    localeFormat: (custom: string, ignoreTimezone?: boolean) => {
      const currentLang = esp.modProp('lib/locale').default.state().get()
      const localeId = langData?.filter?.((x) => x.name == currentLang)?.[0]?.code
      moment().locale(localeId)
      const _d = _date
      const out = dayjs(_d).format(custom)
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



