// @flow

import { type EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Alert, FlatList, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import { getSpecialCurrencyInfo, SPECIAL_CURRENCY_INFO } from '../../constants/WalletAndCurrencyConstants.js'
import s from '../../locales/strings.js'
import { connect } from '../../types/reactRedux.js'
import { type NavigationProp } from '../../types/routerTypes.js'
import { type CreateWalletType, type FlatListItem } from '../../types/types.js'
import { getCreateWalletTypes } from '../../util/CurrencyInfoHelpers.js'
import { SceneWrapper } from '../common/SceneWrapper.js'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'
import { OutlinedTextInput } from '../themed/OutlinedTextInput.js'
import { SceneHeader } from '../themed/SceneHeader'
import { SelectableRow } from '../themed/SelectableRow'

type OwnProps = {
  navigation: NavigationProp<'createWalletReview'>
}
type StateProps = {
  account: EdgeAccount
}
type Props = StateProps & OwnProps & ThemeProps

type State = {
  createWalletArray: CreateWalletType[],
  filteredArray: CreateWalletType[]
}

class CreateWalletSelectCryptoComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { account } = this.props
    // Sort and filter the available types:
    const createWalletArray = getCreateWalletTypes(account)
    this.state = { createWalletArray, filteredArray: createWalletArray }
  }

  getWalletType(walletType: string): CreateWalletType | void {
    const { account } = this.props
    return getCreateWalletTypes(account).find(type => type.walletType === walletType)
  }

  onPress = walletType => {
    const { navigation } = this.props
    // Find the details about the wallet type:
    const selectedWalletType = this.getWalletType(walletType)
    if (selectedWalletType == null) {
      return Alert.alert(s.strings.create_wallet_invalid_input, s.strings.create_wallet_select_valid_crypto)
    }
    // Does this wallet type support private key import?
    const { currencyCode } = selectedWalletType
    const { isImportKeySupported } = getSpecialCurrencyInfo(currencyCode)
    // Go to the import key scene screen:
    if (isImportKeySupported) return navigation.navigate('createWalletChoice', { selectedWalletType })
    // Go to the fiat selection screen:
    navigation.navigate('createWalletSelectFiat', { selectedWalletType })
  }

  handleChangeText = searchTerm => {
    const lowerSearch = searchTerm.toLowerCase()
    const { createWalletArray } = this.state
    const filteredArray = createWalletArray.filter(
      entry =>
        !SPECIAL_CURRENCY_INFO[entry.currencyCode]?.keysOnlyMode &&
        (entry.currencyName.toLowerCase().indexOf(lowerSearch) >= 0 || entry.currencyCode.toLowerCase().indexOf(lowerSearch) >= 0)
    )
    this.setState({ filteredArray })
  }

  renderWalletTypeResult = ({ item }: FlatListItem<CreateWalletType>) => {
    const { theme } = this.props
    const { symbolImageDarkMono, currencyCode, walletType, currencyName } = item
    const { cryptoTypeLogo } = getStyles(theme)
    const icon = symbolImageDarkMono ? <FastImage source={{ uri: symbolImageDarkMono }} style={cryptoTypeLogo} /> : <View style={cryptoTypeLogo} />
    // Ripple hack:
    const subTitle = currencyCode.toLowerCase() === 'xrp' ? 'Ripple' : currencyName

    return <SelectableRow onPress={() => this.onPress(walletType)} icon={icon} title={currencyCode} subTitle={subTitle} />
  }

  keyExtractor = ({ walletType }: CreateWalletType): string => walletType

  render() {
    const styles = getStyles(this.props.theme)
    return (
      <SceneWrapper avoidKeyboard background="theme">
        {gap => (
          <View style={[styles.content, { marginBottom: -gap.bottom }]}>
            <SceneHeader withTopMargin title={s.strings.title_create_wallet_select_crypto} />
            <OutlinedTextInput
              autoCorrect={false}
              autoCapitalize="words"
              onChangeText={this.handleChangeText}
              label={s.strings.create_wallet_choose_crypto}
              returnKeyType="search"
              marginRem={[0, 1.75]}
              searchIcon
            />
            <FlatList
              style={styles.resultList}
              automaticallyAdjustContentInsets={false}
              contentContainerStyle={{ paddingBottom: gap.bottom }}
              data={this.state.filteredArray}
              initialNumToRender={12}
              keyboardShouldPersistTaps="handled"
              keyExtractor={this.keyExtractor}
              renderItem={this.renderWalletTypeResult}
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
    marginLeft: theme.rem(0.25)
  }
}))

export const CreateWalletSelectCryptoScene = connect<StateProps, {}, OwnProps>(
  state => ({
    account: state.core.account
  }),
  dispatch => ({})
)(withTheme(CreateWalletSelectCryptoComponent))
