// withHooks
// noPage
import { esp, useSafeState } from 'esoftplay';
import { LibDialog } from 'esoftplay/cache/lib/dialog/import';
import { LibImage } from 'esoftplay/cache/lib/image/import';
import { LibLocale } from 'esoftplay/cache/lib/locale/import';
import { LibNet_status } from 'esoftplay/cache/lib/net_status/import';
import { LibProgress } from 'esoftplay/cache/lib/progress/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibToast } from 'esoftplay/cache/lib/toast/import';
import { LibUpdaterProperty } from 'esoftplay/cache/lib/updater/import';
import { LibVersion } from 'esoftplay/cache/lib/version/import';
import { LibWorkloop } from 'esoftplay/cache/lib/workloop/import';
import Navs from 'esoftplay/cache/navs';
import { UseDeeplink } from 'esoftplay/cache/use/deeplink/import';
import { UserClass } from 'esoftplay/cache/user/class/import';
import { UserHook } from 'esoftplay/cache/user/hook/import';
import { UserLoading } from 'esoftplay/cache/user/loading/import';
import * as ErrorReport from 'esoftplay/error';
import moment from 'esoftplay/moment';
import { useFonts } from 'expo-font';
import React, { useLayoutEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export interface UserIndexProps {

}

export interface UserIndexState {
  loading: boolean
}
function getFontConfig() {
  let fonts: any = {}
  let fontsConfig = esp.config("fonts")
  if (fontsConfig) {
    Object.keys(esp.config("fonts")).forEach((key) => {
      fonts[key] = esp.assets('fonts/' + fontsConfig[key])
    })
  }
  return fonts
}


export default function m(props: UserIndexProps): any {
  moment().locale(LibLocale.state().get())
  const [loading, setLoading] = useSafeState(true)
  const [fontLoaded] = useFonts(getFontConfig())
  //esoftplay-user-class-hook
  UseDeeplink()

  useLayoutEffect(() => {
    ErrorReport.getError()
    LibUpdaterProperty.check()
    LibVersion.check()
  }, [])

  useLayoutEffect(() => {
    if (fontLoaded) {
      UserClass.isLogin(() => {
        setLoading(false)
      })
    }
  }, [fontLoaded])

  
  //esoftplay-chatting

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {
          loading ?
            <UserLoading />
            :
            <>
              <LibWorkloop />
              <Navs />
              <LibNet_status />
              <LibDialog style={'default'} />
              <LibImage />
              <LibProgress />
              <LibToast />
              <UserHook />
              {/* {__DEV__ && <Draggable />} */}
            </>
        }
      </View>
      <View style={{ backgroundColor: LibStyle?.colorNavigationBar || 'white', height: LibStyle.isIphoneX ? 35 : 0 }} />
    </GestureHandlerRootView>
  )
}




// const Draggable = () => {
//   const translateX = useSharedValue(0);
//   const translateY = useSharedValue(0);
//   const lastOffset = { x: 0, y: 0 };
//   const handleGestureEvent = useAnimatedGestureHandler({
//     onStart: (_, ctx: any) => {
//       ctx.offsetX = translateX.value;
//       ctx.offsetY = translateY.value;
//     },
//     onActive: (event, ctx) => {
//       translateX.value = ctx.offsetX + event.translationX;
//       translateY.value = ctx.offsetY + event.translationY;
//     },
//     onEnd: (event) => {
//       lastOffset.x += event.translationX;
//       lastOffset.y += event.translationY;
//     },
//   });
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
//     };
//   });
//   return (
//     <View style={{ position: 'absolute', right: 10 }}>
//       <PanGestureHandler onGestureEvent={handleGestureEvent}>
//         <Animated.View style={[animatedStyle]} >
//           <Pressable onPress={() => { route.reset(); LibNavigation.backToRoot() }} style={{ right: 10, top: LibStyle.height * 0.5, padding: 10, backgroundColor: 'indigo', alignItems: 'center', justifyContent: 'center', borderRadius: 50 }} >
//             <LibIcon name='delete-variant' color='white' />
//           </Pressable>
//         </Animated.View>
//       </PanGestureHandler>
//     </View>
//   );
// };