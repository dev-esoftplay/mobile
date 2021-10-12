// withHooks
// noPage

import { LibLoading, LibStyle, LibToastProperty, useSafeState } from 'esoftplay';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ScrollPicker from 'react-native-picker-scrollview';
export interface LibDatepickerProps {
  minDate: string,
  maxDate: string,
  monthsDisplay?: string[],
  selectedDate: string,
  onDateChange: (date: string) => void,
  type?: "date" | "month" | "year"
}

export default function m(props: LibDatepickerProps): any {

  const refYear = useRef<any>(null)
  const refMonth = useRef<any>(null)
  const refDate = useRef<any>(null)
  const allYears = [1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066, 2067, 2068, 2069, 2070, 2071, 2072, 2073, 2074, 2075, 2076, 2077, 2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101]
  const allDates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  const allMonths = props.monthsDisplay || ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const minDate = props.minDate
  const maxDate = props.maxDate
  const selectedDate = props.selectedDate || minDate
  const sYear = Number(selectedDate.split('-')[0])
  const sMonth = Number(selectedDate.split('-')[1])
  const sDate = Number(selectedDate.split('-')[2])
  const minYear = Number(minDate.split('-')[0])
  const maxYear = Number(maxDate.split('-')[0])
  const minMonth = Number(minDate.split('-')[1]) - 1
  const maxMonth = Number(maxDate.split('-')[1]) - 1
  const minDay = Number(minDate.split('-')[2])
  const maxDay = Number(maxDate.split('-')[2])
  const [years, setYears] = useSafeState<number[]>(allYears.slice(allYears.indexOf(minYear), allYears.indexOf(maxYear + 1)))
  const [months, setMonths] = useSafeState<string[]>(getInitMonths())
  const [dates, setDates] = useSafeState<number[]>([])
  const [year, setYear] = useSafeState<number>(sYear)
  const [month, setMonth] = useSafeState<string>(allMonths[sMonth - 1])
  const [date, setDate] = useSafeState<number>(sDate || minDay)


  function getInitMonths(): string[] {
    let out: string[] = []
    if (sYear == minYear) {
      out = allMonths.slice(minMonth, allMonths.length)
    } else if (sYear == maxYear) {
      out = allMonths.slice(0, maxMonth + 1)
    }
    return out
  }


  function generateMonths(year: number) {
    let m = 0
    let n = allMonths.length

    if (years.indexOf(year) == 0) {
      m = minMonth

    }
    if (years.indexOf(year) == years.length - 1) {
      n = maxMonth + 1

    }
    let reset = false
    let _months = [...allMonths].slice(m, n)
    if ((_months.length - 1) < months.indexOf(month)) {
      reset = true
    }
    setMonths(_months)
    if (reset) {
      setTimeout(() => {
        refMonth.current!.scrollToIndex(0)
      }, 200);
      setMonth(allMonths[0])
    }
  }

  function generateDays(year: number, month: string) {
    function generateNumberBetween(start: number, end: number) {
      return allDates.slice(allDates.indexOf(start), allDates.indexOf(end) + 1)
    }
    const dateCount = new Date(year, allMonths.indexOf(month) + 1, 0).getDate()
    let m = 1
    let n = dateCount
    let reset = false
    if (minYear == year && minMonth == allMonths.indexOf(month)) {
      m = minDay
    }
    if (maxYear == year && maxMonth == allMonths.indexOf(month)) {
      n = maxDay > dateCount ? dateCount : maxDay
    }
    let _dates = generateNumberBetween(m, n)
    if (_dates.length - 1 < dates.indexOf(date)) {
      reset = true
    }
    setDates(_dates)
    if (reset) {
      setTimeout(() => {
        refDate.current!.scrollToIndex(0)
      }, 200);
      setDate(_dates[0])
    }
  }

  useEffect(() => {
    generateMonths(year)
  }, [year, years])

  useEffect(() => {
    generateDays(year, month)
  }, [month, year])

  function getDateChange() {
    const monthNumber = allMonths.indexOf(refMonth.current!.getSelected()) + 1
    const date = refDate.current!.getSelected()
    const dateSelected = refYear.current!.getSelected() + '-' + String(monthNumber < 10 ? ('0' + monthNumber) : monthNumber) + '-' + String(date < 10 ? ('0' + date) : date)
    if (props.onDateChange)
      props.onDateChange(dateSelected)
    else {
      LibToastProperty.show(dateSelected)
    }
  }


  function itemRenderer(data: any, index: number, isSelected: boolean) {
    return (
      <View>
        <Text style={{ fontWeight: isSelected ? 'bold' : 'normal' }} >{data}</Text>
      </View>
    )
  }

  function onYearChange(data: any, selectedIndex: number) {
    setYear(data)
  }
  function onMonthChange(data: any, selectedIndex: number) {
    setMonth(data)
  }
  function onDateChange(data: any, selectedIndex: number) {
    setDate(data)
  }

  if (dates.length == 0) {
    return <LibLoading />
  }


  let { type } = props
  if (!type) type = 'date'
  const showDateView = type == 'date'
  const showMonthView = type == 'date' || type == 'month'
  const showYearView = type == 'date' || type == 'month' || type == 'year'

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }} >
      <View style={{ height: 44, alignItems: 'flex-end', backgroundColor: '#fafafa' }} >
        <TouchableOpacity onPress={() => { getDateChange() }} >
          <Text style={{ fontSize: 15, fontWeight: "500", paddingHorizontal: 16, paddingVertical: 13, fontStyle: "normal", letterSpacing: 0, color: LibStyle.colorPrimary }} >Done</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 175, flexDirection: 'row' }} >
        <View style={{ width: showYearView ? undefined : 0, flex: showYearView ? 1 : 0, }} >
          <ScrollPicker
            ref={refYear}
            dataSource={years}
            selectedIndex={years.indexOf(year)}
            itemHeight={35}
            wrapperHeight={175}
            wrapperColor={'#ffffff'}
            highlightColor={'#c8c7cc'}
            renderItem={itemRenderer}
            onValueChange={onYearChange}
          />
        </View>
        <View style={{ width: showMonthView ? undefined : 0, flex: showMonthView ? 1 : 0, }} >
          <ScrollPicker
            ref={refMonth}
            dataSource={months}
            selectedIndex={months.indexOf(month)}
            itemHeight={35}
            wrapperHeight={175}
            wrapperColor={'#ffffff'}
            highlightColor={'#c8c7cc'}
            renderItem={itemRenderer}
            onValueChange={onMonthChange}
          />
        </View>
        <View style={{ width: showDateView ? undefined : 0, flex: showDateView ? 1 : 0, }} >
          <ScrollPicker
            ref={refDate}
            dataSource={dates}
            selectedIndex={dates.indexOf(date)}
            itemHeight={35}
            wrapperHeight={175}
            wrapperColor={'#ffffff'}
            highlightColor={'#c8c7cc'}
            renderItem={itemRenderer}
            onValueChange={onDateChange}
          />
        </View>
      </View>
      <LinearGradient
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={['rgba(255,255,255,1)','rgba(255,255,255,0.8)', 'rgba(255,255,255,0)','rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
        pointerEvents='none' style={{ height: 175, position: 'absolute', top: 44, bottom: 0, left: 0, right: 0 }} />
    </View>
  )
}