// @flow

import * as React from 'react'
import { Alert, FlatList, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import { FIAT_COUNTRY } from '../../constants/CountryConstants'
import { getSpecialCurrencyInfo } from '../../constants/WalletAndCurrencyConstants.js'
import s from '../../locales/strings.js'
import { getDefaultFiat } from '../../selectors/SettingsSelectors.js'
import { connect } from '../../types/reactRedux.js'
import { type NavigationProp, type RouteProp } from '../../types/routerTypes.js'
import type { FlatListItem, GuiFiatType } from '../../types/types.js'
import { getSupportedFiats } from '../../util/utils'
import { SceneWrapper } from '../common/SceneWrapper.js'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'
import { OutlinedTextInput } from '../themed/OutlinedTextInput.js'
import { SceneHeader } from '../themed/SceneHeader'
import { SelectableRow } from '../themed/SelectableRow'

type OwnProps = {
  navigation: NavigationProp<'createWalletSelectFiat'>,
  route: RouteProp<'createWalletSelectFiat'>
}
type StateProps = {
  supportedFiats: GuiFiatType[]
}
type Props = OwnProps & StateProps & ThemeProps

type State = {
  selectedFiat: string,
  filteredSupportedFiats: GuiFiatType[]
}

class CreateWalletSelectFiatComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { selectedFiat: '', filteredSupportedFiats: props.supportedFiats }
  }

  onNext = (fiatText: string) => {
    const { navigation, route, supportedFiats } = this.props
    const { cleanedPrivateKey, selectedWalletType } = route.params
    const selectedFiat = supportedFiats.find(({ value }) => value === fiatText)
    // Error if the fiat is invalid
    if (selectedFiat == null) {
      return Alert.alert(s.strings.create_wallet_invalid_input, s.strings.create_wallet_select_valid_fiat)
    }
    const { needsAccountNameSetup } = getSpecialCurrencyInfo(selectedWalletType.currencyCode)
    // Check if eos-like or it's a private key import and continue to the create wallet name scene if it is
    if (needsAccountNameSetup == null || cleanedPrivateKey != null) {
      return navigation.navigate('createWalletName', { selectedWalletType, selectedFiat, cleanedPrivateKey })
    }
    // Continue to the Account Setup screen
    navigation.navigate('createWalletAccountSetup', { selectedWalletType, selectedFiat })
  }

  renderFiatTypeResult = ({ item: { value } }: FlatListItem<GuiFiatType>) => {
    const styles = getStyles(this.props.theme)
    const fiatCountry = FIAT_COUNTRY[value]
    if (!fiatCountry) return null
    return (
      <SelectableRow
        onPress={() => this.onNext(value)}
        icon={fiatCountry.logoUrl ? <FastImage source={{ uri: fiatCountry.logoUrl }} style={styles.cryptoTypeLogo} /> : <View style={styles.cryptoTypeLogo} />}
        title={value}
        subTitle={s.strings[`currency_label_${value}`]}
      />
    )
  }

  keyExtractor = ({ value }: GuiFiatType) => value

  handleChangeText = (searchTerm: string) => {
    const lowerCaseText = searchTerm.toLowerCase()
    const { supportedFiats } = this.props
    const filteredSupportedFiats = supportedFiats.filter(({ label }) => label.toLowerCase().indexOf(lowerCaseText) >= 0)
    this.setState({ filteredSupportedFiats })
  }

  render() {
    const styles = getStyles(this.props.theme)

    return (
      <SceneWrapper avoidKeyboard background="theme">
        {gap => (
          <View style={[styles.content, { marginBottom: -gap.bottom }]}>
            <SceneHeader withTopMargin title={s.strings.title_create_wallet_select_fiat} />
            <OutlinedTextInput
              autoCorrect={false}
              autoCapitalize="words"
              onChangeText={this.handleChangeText}
              label={s.strings.fragment_wallets_addwallet_fiat_hint}
              returnKeyType="search"
              marginRem={[0, 1.75]}
              searchIcon
            />
            <FlatList
              style={styles.resultList}
              automaticallyAdjustContentInsets={false}
              contentContainerStyle={{ paddingBottom: gap.bottom }}
              data={this.state.filteredSupportedFiats}
              initialNumToRender={30}
              keyboardShouldPersistTaps="handled"
              keyExtractor={this.keyExtractor}
              renderItem={this.renderFiatTypeResult}
            />
          </View>
        )}
      </SceneWrapper>
    )
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1
  },
  resultList: {
    flex: 1
  },
  cryptoTypeLogo: {
    width: theme.rem(2),
    height: theme.rem(2),
    borderRadius: theme.rem(1),
    marginLeft: theme.rem(0.25),
    backgroundColor: theme.backgroundGradientRight
  }
}))

export const CreateWalletSelectFiatScene = connect<StateProps, {}, OwnProps>(
  state => ({
    supportedFiats: getSupportedFiats(getDefaultFiat(state))
  }),
  dispatch => ({})
)(withTheme(CreateWalletSelectFiatComponent))
