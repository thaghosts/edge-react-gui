// @flow

import * as React from 'react'
import { Image, View } from 'react-native'

import s from '../../../locales/strings'
import { getDisplayDenominationFull, getPrimaryExchangeDenomination } from '../../../selectors/DenominationSelectors.js'
import { getExchangeRate, getSelectedWallet } from '../../../selectors/WalletSelectors.js'
import { useSelector } from '../../../types/reactRedux.js'
import { emptyGuiDenomination } from '../../../types/types.js'
import { getCurrencyIcon } from '../../../util/CurrencyInfoHelpers.js'
import { getDenomFromIsoCode, zeroString } from '../../../util/utils.js'
import { ExchangeRate } from '../../common/ExchangeRate.js'
import { type Theme, cacheStyles, useTheme } from '../../services/ThemeContext'
import { EdgeText } from '../EdgeText'

export function ControlPanelRateComponent() {
  const theme = useTheme()
  const styles = getStyles(theme)
  const {
    exchangeRate,
    currencyLogo,
    primaryDisplayCurrencyCode,
    primaryDisplayDenomination,
    primaryExchangeDenomination,
    secondaryDisplayCurrencyCode,
    secondaryToPrimaryRatio
  } = useSelector(state => {
    const guiWallet = getSelectedWallet(state)
    const currencyCode = state.ui.wallets.selectedCurrencyCode

    if (guiWallet == null || currencyCode == null) {
      return {
        currencyLogo: '',
        exchangeRate: '0',
        primaryDisplayCurrencyCode: '',
        primaryDisplayDenomination: '',
        primaryExchangeDenomination: '',
        secondaryDisplayCurrencyCode: '',
        secondaryToPrimaryRatio: '0',
        username: state.core.account.username
      }
    }

    return {
      exchangeRate: getExchangeRate(state, currencyCode, guiWallet.isoFiatCurrencyCode),
      isoFiatCurrencyCode: guiWallet.isoFiatCurrencyCode,
      currencyLogo: getCurrencyIcon(guiWallet.currencyCode, currencyCode).symbolImage,
      secondaryDisplayCurrencyCode: guiWallet.fiatCurrencyCode,
      secondaryToPrimaryRatio: getExchangeRate(state, currencyCode, guiWallet.isoFiatCurrencyCode),
      primaryDisplayCurrencyCode: currencyCode,
      primaryDisplayDenomination: getDisplayDenominationFull(state, currencyCode),
      primaryExchangeDenomination: getPrimaryExchangeDenomination(state, currencyCode),
      username: state.core.account.username
    }
  })

  const secondaryExchangeDenomination = secondaryDisplayCurrencyCode ? getDenomFromIsoCode(secondaryDisplayCurrencyCode) : ''

  const primaryCurrencyInfo = {
    displayCurrencyCode: primaryDisplayCurrencyCode,
    displayDenomination: primaryDisplayDenomination || emptyGuiDenomination,
    exchangeDenomination: primaryExchangeDenomination || emptyGuiDenomination,
    exchangeCurrencyCode: primaryDisplayCurrencyCode
  }
  const secondaryCurrencyInfo = {
    displayCurrencyCode: secondaryDisplayCurrencyCode,
    displayDenomination: secondaryExchangeDenomination || emptyGuiDenomination,
    exchangeDenomination: secondaryExchangeDenomination || emptyGuiDenomination,
    exchangeCurrencyCode: secondaryDisplayCurrencyCode
  }

  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowIconContainer}>{!!currencyLogo && <Image style={styles.icon} source={{ uri: currencyLogo }} />}</View>
      <View style={styles.rowBodyContainer}>
        {!zeroString(exchangeRate) ? (
          <ExchangeRate
            primaryInfo={primaryCurrencyInfo}
            secondaryInfo={secondaryCurrencyInfo}
            secondaryDisplayAmount={secondaryToPrimaryRatio}
            style={styles.text}
          />
        ) : (
          <EdgeText style={styles.text}>{s.strings.exchange_rate_loading_singular}</EdgeText>
        )}
      </View>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  rowContainer: {
    display: 'flex',
    height: theme.rem(2.75),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  rowIconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.rem(3),
    width: theme.rem(3),
    marginLeft: theme.rem(0.25)
  },
  rowBodyContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexGrow: 1
  },
  text: {
    fontFamily: theme.fontFaceMedium,
    marginLeft: theme.rem(0.5)
  },
  icon: {
    height: theme.rem(1.5),
    width: theme.rem(1.5)
  }
}))
