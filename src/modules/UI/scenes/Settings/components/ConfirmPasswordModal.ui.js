// @flow

import React, {Component} from 'react'
import {View, ActivityIndicator} from 'react-native'
import s from '../../../../../locales/strings.js'

import StylizedModal from '../../../components/Modal/Modal.ui'
import {Icon} from '../../../components/Icon/Icon.ui'
import * as Constants from '../../../../../constants/indexConstants'
import THEME from '../../../../../theme/variables/airbitz'
import ModalButtons from './ModalButtons.ui'
import {FormField} from '../../../../../components/indexComponents'
import {MaterialInputOnWhite} from '../../../../../styles/indexStyles'

type ConfirmPasswordModalProps = {
  style: Object,
  headerText: string,
  error: string,
  showModal: boolean,
  onCancel(): void,
  onDone(string): void
}

type State = {
  confimPassword: string,
  isThinking: boolean
}
export default class ConfirmPasswordModal extends Component<ConfirmPasswordModalProps, State> {
  componentWillMount () {
    this.setState({
      confimPassword: '',
      isThinking: false
    })
  }
  componentWillReceiveProps (nextProps: ConfirmPasswordModalProps) {
    if (!nextProps.showModal) {
      this.setState({
        confimPassword: '',
        isThinking: false
      })
    }
    if (nextProps.error !== '') {
      this.setState({
        isThinking: false
      })
    }
  }
  textChange = (value: string) => {
    this.setState({
      confimPassword: value
    })
  }
  onDone = () => {
    this.setState({
      isThinking: true
    })
    this.props.onDone(this.state.confimPassword)
  }
  renderMiddle = (style: Object) => {
    const formStyle = {...MaterialInputOnWhite,
      container: {...MaterialInputOnWhite.container, width: 244}
    }
    return <View style={style.middle.container} >
      <FormField onChangeText={this.textChange}
        style={formStyle}
        label={s.strings.confirm_password_text}
        value={this.state.confimPassword}
        error={this.props.error}
        secureTextEntry
        returnKeyType={'done'}
        onSubmitEditing={this.onDone}
        autoFocus/>
        <View style={style.middle.clearShim} />
    </View>
  }
  renderBottom (style: Object) {
    if (this.state.isThinking) {
      return <View style={style.bottomActivity} ><ActivityIndicator /></View>
    }
    return <ModalButtons
      onDone={this.onDone}
      onCancel={this.props.onCancel} />
  }
  render () {
    const style = this.props.style
    const icon = <Icon
      style={style.icon}
      name={Constants.LOCKED_ICON}
      size={40}
      type={Constants.ION_ICONS}/>

    return <StylizedModal
      visibilityBoolean={this.props.showModal}
      featuredIcon={icon}
      headerText={this.props.headerText}
      headerTextStyle={{color: THEME.COLORS.PRIMARY, marginTop: -10, marginBottom: 10}}
      modalMiddle={this.renderMiddle(style)}
      modalBottom={this.renderBottom(style)}
      onExitButtonFxn={this.props.onCancel} />
  }
}
