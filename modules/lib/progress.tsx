import React from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';
import { LibComponent, LibTheme, LibStyle, LibTextstyle, esp } from 'esoftplay';
import { connect } from 'react-redux';

export interface LibProgressProps {
  show?: boolean,
  message?: string
}

export interface LibProgressState {

}

class m extends LibComponent<LibProgressProps, LibProgressState>{

  static initState = {
    show: false,
    message: undefined
  }

  static reducer(state: any, action: any): any {
    if (state == undefined) state = m.initState
    switch (action.type) {
      case "lib_progress_show":
        return {
          ...state,
          show: true,
          message: action.payload
        }
        break
      case "lib_progress_hide":
        return {
          ...state,
          show: false,
          message: undefined
        }
        break
      default:
        return state
    }
  }

  static show(message?: string): void {
    esp.dispatch({
      type: 'lib_progress_show',
      payload: message
    })
  }

  static hide(): void {
    esp.dispatch({ type: 'lib_progress_hide' })
  }


  static mapStateToProps(state: any): any {
    return {
      show: state.lib_progress.show,
      message: state.lib_progress.message
    }
  }

  constructor(props: LibProgressProps) {
    super(props);
    this.handleBack = this.handleBack.bind(this);
  }


  handleBack(): boolean {
    return true
  }

  componentDidUpdate(prevProps: LibProgressProps, prevState: LibProgressState): void {
    if (prevProps.show == false && this.props.show == true) {
      BackHandler.addEventListener("hardwareBackPress", this.handleBack)
    } else if (prevProps.show == true && this.props.show == false) {
      BackHandler.removeEventListener("hardwareBackPress", this.handleBack)
    }
  }



  render(): any {
    const { message, show } = this.props
    if (!show) return null
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', flex: 1 }} >
        <View style={{ backgroundColor: LibTheme._colorBackgroundCardPrimary(), padding: 10, borderRadius: 4, width: LibStyle.width - 80 }} >
          <View style={{ marginTop: 16, marginHorizontal: 10 }} >
            <View style={{ alignItems: 'center', justifyContent: 'center' }} >
              <ActivityIndicator color={LibTheme._colorPrimary()} size='large' />
              {message && <LibTextstyle textStyle="subhead" text={message || ''} style={{ textAlign: 'center', lineHeight: 20, marginTop: 20 }} />}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
export default connect(m.mapStateToProps)(m)