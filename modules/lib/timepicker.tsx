// withHooks 
// noPage

import { LibScrollpicker, LibStyle, useSafeState } from 'esoftplay';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface LibTimepickerProps {
  /* hh:mm:ss */
  selectedTime: string,
  onTimeChange: (second: string) => void,
  /* hh:mm:ss */
  minTime?: string,
  /* hh:mm:ss */
  maxTime?: string,
  mode?: 24 | 12,
  /* hh:mm:ss */
  type?: "hour" | "hourMinute" | "hourMinuteSecond"
}

export default function libtimepicker(props: LibTimepickerProps): any {

  const _mode = props.mode || 24
  const refHour = useRef<any>(null)
  const refMinute = useRef<any>(null)
  const refSecond = useRef<any>(null)
  const t24 = _mode == 12 ? ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"] : ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
  const t60 = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"]
  const time = { hours: t24, minutes: t60, seconds: t60 }
  const minTime = props.minTime
  const maxTime = props.maxTime
  const type = props.type || "hourMinuteSecond"
  const [selectedTime, setSelectedTime] = useSafeState(props.selectedTime || minTime)
  let sHour = selectedTime.split(':')[0]
  let sMinute = selectedTime.split(':')[1]
  let sSecond = selectedTime.split(':')[2]
  let showHour = (type == 'hour') || (type == 'hourMinute') || (type == 'hourMinuteSecond');
  let showHourMinute = (type == 'hourMinuteSecond') || (type == 'hourMinute');
  let showHourMinuteSecond = type == 'hourMinuteSecond';

  function scrollTo(time: string) {
    refHour?.current?.scrollToIndex(t24.indexOf(time.split(':')[0]))
    refMinute?.current?.scrollToIndex(t60.indexOf(time.split(':')[1]))
    refSecond?.current?.scrollToIndex(t60.indexOf(time.split(':')[2]))
  }

  useEffect(() => {
    if (selectedTime) {
      let toTime = null
      if (maxTime && selectedTime > maxTime) {
        toTime = maxTime;
      } else if (minTime && selectedTime < minTime) {
        toTime = minTime;
      }
      if (toTime != null) {
        scrollTo(toTime);
        setSelectedTime(toTime);
      }
    }
  }, [selectedTime])

  function itemRenderer(data: any, index: number, isSelected: boolean) {
    return (
      <View>
        <Text style={{ fontSize: 20, fontWeight: isSelected ? 'bold' : 'normal' }} >{data}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }} >
      <View style={{ height: 44, alignItems: 'flex-end', backgroundColor: '#fafafa' }} >
        <TouchableOpacity onPress={() => { props.onTimeChange(selectedTime) }} >
          <Text style={{ fontSize: 15, fontWeight: "500", paddingHorizontal: 9, paddingVertical: 13, fontStyle: "normal", letterSpacing: 0, color: LibStyle.colorPrimary }} >Done</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: 180, flex: 1, height: 175, alignSelf: 'center' }} >
        <View style={{ height: 175, flexDirection: 'row', alignItems: 'center' }} >
          <View style={{ width: showHour ? undefined : 0, flex: showHour ? 1 : 0, }} >
            <LibScrollpicker
              ref={refHour}
              dataSource={time.hours}
              selectedIndex={time.hours.indexOf(sHour)}
              itemHeight={35}
              wrapperHeight={175}
              wrapperColor={'#ffffff'}
              highlightColor={'#c8c7cc'}
              renderItem={itemRenderer}
              onValueChange={(value: any) => setSelectedTime(value + ':' + sMinute + ":" + sSecond)}
            />
          </View>
          <Text style={{ width: showHourMinute ? undefined : 0, fontSize: 30, marginBottom: 5 }} >:</Text>
          <View style={{ width: showHourMinute ? undefined : 0, flex: showHourMinute ? 1 : 0 }} >
            <LibScrollpicker
              ref={refMinute}
              dataSource={time.minutes}
              selectedIndex={time.minutes.indexOf(sMinute)}
              itemHeight={35}
              wrapperHeight={175}
              wrapperColor={'#ffffff'}
              highlightColor={'#c8c7cc'}
              renderItem={itemRenderer}
              onValueChange={(value: any) => setSelectedTime(sHour + ':' + value + ":" + sSecond)}
            />
          </View>
          <Text style={{ width: showHourMinuteSecond ? undefined : 0, fontSize: 30, marginBottom: 5 }} >:</Text>
          <View style={{ width: showHourMinuteSecond ? undefined : 0, flex: showHourMinuteSecond ? 1 : 0, }} >
            <LibScrollpicker
              ref={refSecond}
              dataSource={time.seconds}
              selectedIndex={time.seconds.indexOf(sSecond)}
              itemHeight={35}
              wrapperHeight={175}
              wrapperColor={'#ffffff'}
              highlightColor={'#c8c7cc'}
              renderItem={itemRenderer}
              onValueChange={(value: any) => setSelectedTime(sHour + ':' + sMinute + ":" + value)}
            />
          </View>
        </View>
      </View>
      <LinearGradient
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
        pointerEvents='none' style={{ height: 175, position: 'absolute', top: 44, bottom: 0, left: 0, right: 0 }} />
    </View>
  )
}