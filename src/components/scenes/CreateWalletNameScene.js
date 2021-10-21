// @flow

import * as React from 'react'
import { Alert } from 'react-native'
import { sprintf } from 'sprintf-js'

import { getSpecialCurrencyInfo } from '../../constants/WalletAndCurrencyConstants.js'
import s from '../../locales/strings.js'
import { useMemo, useState } from '../../types/reactHooks.js'
import { type NavigationProp, type RouteProp } from '../../types/routerTypes.js'
import { SceneWrapper } from '../common/SceneWrapper'
import { MainButton } from '../themed/MainButton.js'
import { OutlinedTextInput } from '../themed/OutlinedTextInput.js'
import { SceneHeader } from '../themed/SceneHeader'

export type Props = {
  navigation: NavigationProp<'createWalletName'>,
  route: RouteProp<'createWalletName'>
}

export const CreateWalletName = ({ navigation, route: { params } }: Props) => {
  const { cleanedPrivateKey, selectedFiat, selectedWalletType } = params
  const { currencyCode, currencyName } = selectedWalletType

  const info = useMemo(() => getSpecialCurrencyInfo(currencyCode), [currencyCode])
  const defaultWalletName = useMemo(() => {
    const name = currencyCode.toLowerCase() === 'xrp' ? 'XRP' : currencyName
    return sprintf(s.strings.my_crypto_wallet_name, name)
  }, [currencyCode, currencyName])

  const [walletName, setWalletName] = useState(defaultWalletName)

  const handleSubmit = () => {
    if (walletName.length <= 0) {
      return Alert.alert(s.strings.create_wallet_invalid_name, s.strings.create_wallet_enter_valid_name)
    }
    if (info.skipAccountNameValidation && !cleanedPrivateKey) {
      return navigation.navigate('createWalletAccountSelect', {
        selectedFiat,
        selectedWalletType,
        accountName: walletName,
        existingWalletId: ''
      })
    }
    navigation.navigate('createWalletReview', { walletName, ...params })
  }

  return (
    <SceneWrapper avoidKeyboard background="theme">
      <SceneHeader withTopMargin title={s.strings.title_create_wallet} />
      <OutlinedTextInput
        value={defaultWalletName}
        onSubmitEditing={handleSubmit}
        onChangeText={setWalletName}
        autoCorrect={false}
        returnKeyType="next"
        label={s.strings.fragment_wallets_addwallet_name_hint}
        marginRem={[0, 1.75]}
      />
      <MainButton alignSelf="center" label={s.strings.string_next_capitalized} marginRem={[3, 1]} type="secondary" onPress={handleSubmit} />
    </SceneWrapper>
  )
}
