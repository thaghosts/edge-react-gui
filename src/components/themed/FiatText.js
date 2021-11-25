// @flow
import { bns } from 'biggystring'

import { getDisplayDenomination, getExchangeDenomination } from '../../selectors/DenominationSelectors'
import { convertCurrency } from '../../selectors/WalletSelectors.js'
import { useSelector } from '../../types/reactRedux.js'
<<<<<<< HEAD
import { DECIMAL_PRECISION, formatFiatString } from '../../util/utils'
=======
import { DECIMAL_PRECISION, displayFiatAmount, formatFiatString, getDenomFromIsoCode, getFiatSymbol } from '../../util/utils'
>>>>>>> 587d305b7106efb635a0b501154c93f2d6679079

type TempProps = {
  appendFiatCurrencyCode?: boolean,
  nativeCryptoAmount: string,
  cryptoCurrencyCode: string,
  fiatSymbolSpace?: boolean,
  isoFiatCurrencyCode: string,
  parenthesisEnclosed?: boolean,
  autoPrecision?: boolean
}

export const FiatText = (props: TempProps) => {
  const { appendFiatCurrencyCode, nativeCryptoAmount, fiatSymbolSpace, parenthesisEnclosed, cryptoCurrencyCode, isoFiatCurrencyCode, autoPrecision } = props

  // Convert native to fiat amount.
  // Does NOT take into account display denomination settings here,
  // i.e. sats, bits, etc.
  const fiatAmount = useSelector(state => {
    const exchangeDenomMult = getExchangeDenomination(state, cryptoCurrencyCode).multiplier
    const cryptoAmount = bns.div(nativeCryptoAmount, exchangeDenomMult, DECIMAL_PRECISION)
    return convertCurrency(state, cryptoCurrencyCode, isoFiatCurrencyCode, cryptoAmount)
  })

  return formatFiatString({
    isoFiatCurrencyCode,
    fiatAmount,
    appendFiatCurrencyCode,
    autoPrecision,
    fiatSymbolSpace,
    parenthesisEnclosed
  })
}

type TempProps = {
  appendFiatCurrencyCode?: boolean,
  nativeCryptoAmount: string,
  cryptoCurrencyCode: string,
  fiatSymbolSpace?: boolean,
  isoFiatCurrencyCode: string,
  parenthesisEnclosed?: boolean,
  autoPrecision?: boolean
}

export const FiatTextTemp = (props: TempProps) => {
  const { appendFiatCurrencyCode, nativeCryptoAmount, fiatSymbolSpace, parenthesisEnclosed, cryptoCurrencyCode, isoFiatCurrencyCode, autoPrecision } = props

  // Get conversion rate
  const nativeToFiatAmt = useSelector(state => {
    return convertCurrency(state, cryptoCurrencyCode, isoFiatCurrencyCode, nativeCryptoAmount)
  })

  // Apply multipliers for non-native denominations and fiat precision
  const nativeToDenomMult = useSelector(state => {
    const exchangeDenom = getExchangeDenomination(state, cryptoCurrencyCode).multiplier
    const displayDenom = getDisplayDenomination(state, cryptoCurrencyCode).multiplier
    return bns.div(displayDenom, exchangeDenom, DECIMAL_PRECISION)
  })
  const fiatDenomMult = useSelector(state => getDenomFromIsoCode(isoFiatCurrencyCode).multiplier)

  const fiatAmount = bns.mul(nativeToFiatAmt, nativeToDenomMult)

  return formatFiatString({
    isoFiatCurrencyCode,
    fiatAmount,
    fiatDenomMult,
    appendFiatCurrencyCode,
    autoPrecision,
    fiatSymbolSpace,
    parenthesisEnclosed
  })
}
