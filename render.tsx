// useLibs  
// noPage

import { useEffect, useRef } from 'react';
import { Text } from 'react-native';

export default function useRenderCounter(module: string): any {
  const counter = useRef(1)

  useEffect(() => {
    counter.current += 1
  })

  return () => (
    <Text style={{ position: 'absolute', fontSize: 7, zIndex: 999, color: 'white', backgroundColor: 'black', bottom: 0, left: 0 }} >{module}: {counter.current}</Text>
  )
}