// noPage
import { LibComponent } from 'esoftplay/cache/lib/component/import';
import { LibTheme } from 'esoftplay/cache/lib/theme/import';

import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export interface LibLoadingProps {

}
export interface LibLoadingState {

}
export default class m extends LibComponent<LibLoadingProps, LibLoadingState>{

  constructor(props: LibLoadingProps) {
    super(props);
  }

  render(): any {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
        <ActivityIndicator color={LibTheme._colorPrimary()} size={'large'} />
      </View>
    )
  }
}