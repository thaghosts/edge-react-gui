// @flow
import { bns } from 'biggystring'
import { type JsonObject } from 'edge-core-js/types'
import { WcRpcPayload } from 'edge-currency-accountbased'
import * as React from 'react'
import { Image, ScrollView, View } from 'react-native'
import { type AirshipBridge } from 'react-native-airship'
import { sprintf } from 'sprintf-js'

import WalletConnectLogo from '../../assets/images/walletconnect-logo.png'
import { FlashNotification } from '../../components/navigation/FlashNotification.js'
import s from '../../locales/strings.js'
import { Slider } from '../../modules/UI/components/Slider/Slider.js'
import { getDisplayDenomination, getExchangeDenomination } from '../../selectors/DenominationSelectors.js'
import { useSelector } from '../../types/reactRedux.js'
import { DECIMAL_PRECISION, hexToDecimal, isHex, removeHexPrefix, zeroString } from '../../util/utils.js'
import { Airship, showError } from '../services/AirshipInstance.js'
import { type Theme, cacheStyles, useTheme } from '../services/ThemeContext.js'
import Alert from '../themed/Alert'
import { CryptoFiatAmountTile } from '../themed/CryptoFiatAmountTile.js'
import { EdgeText } from '../themed/EdgeText'
import { FiatAmountTile } from '../themed/FiatAmountTile.js'
import { IconTile } from '../themed/IconTile'
import { ModalCloseArrow, ModalTitle } from '../themed/ModalParts.js'
import { ThemedModal } from '../themed/ThemedModal.js'
import { getCurrencyIcon } from './../../util/CurrencyInfoHelpers'

type Props = {
  bridge: AirshipBridge<string | null>,
  // eslint-disable-next-line react/no-unused-prop-types
  walletId: string,
  // eslint-disable-next-line react/no-unused-prop-types
  dApp: JsonObject,
  uri: string,
  payload: WcRpcPayload
}

export const WcSmartContractModal = (props: Props) => {
  const { bridge, walletId, dApp, payload, uri } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const dAppName: string = dApp.peerMeta.name
  const icon: string = dApp.peerMeta.icons[0]
  const params = payload.params[0]
  const toAddress: string | null = params.to

  const {
    amountNativeToExchangeRatio,
    amountMultiplier,
    amountCurrencyCode,
    feeNativeToExchangeRatio,
    feeMultiplier,
    feeCurrencyCode,
    feeCurrencyStr,
    feeCurrencyBalance,
    isoFiatCurrencyCode,
    walletName,
    wallet
  } = useSelector(state => {
    const { currencyWallets } = state.core.account
    const wallet = currencyWallets[walletId]
    const walletName = wallet.name

    let amountCurrencyCode = wallet.currencyInfo.currencyCode
    if (toAddress != null) {
      const metaTokens = wallet.currencyInfo.metaTokens
      const token = metaTokens.find(token => token.contractAddress != null && token.contractAddress.toLowerCase() === toAddress.toLowerCase())
      if (token != null) amountCurrencyCode = token.currencyCode
    }
    const feeCurrencyCode = wallet.currencyInfo.currencyCode

    const guiWallet = state.ui.wallets.byId[walletId]
    const { isoFiatCurrencyCode } = guiWallet

    const amountNativeToExchangeRatio = getExchangeDenomination(state, amountCurrencyCode).multiplier
    const feeNativeToExchangeRatio = getExchangeDenomination(state, feeCurrencyCode).multiplier
    const amountMultiplier = getDisplayDenomination(state, amountCurrencyCode).multiplier
    const feeMultiplier = getDisplayDenomination(state, feeCurrencyCode).multiplier

    const feeCurrencyStr = `${guiWallet.currencyNames[feeCurrencyCode]} (${feeCurrencyCode})`
    const feeCurrencyBalance = guiWallet.primaryNativeBalance

    return {
      amountNativeToExchangeRatio,
      amountMultiplier,
      amountCurrencyCode,
      feeNativeToExchangeRatio,
      feeMultiplier,
      feeCurrencyCode,
      feeCurrencyStr,
      feeCurrencyBalance,
      isoFiatCurrencyCode,
      walletName,
      wallet
    }
  })

  let amountCrypto = '0'
  let networkFeeCrypto = '0'
  if (isHex(removeHexPrefix(params?.value ?? ''))) {
    amountCrypto = hexToDecimal(params.value)
  }
  if (isHex(removeHexPrefix(params?.gas ?? ''))) {
    networkFeeCrypto = bns.mul(hexToDecimal(params.gas), hexToDecimal(params.gasPrice ?? '0x3B9ACA00'))
  }

  const displayAmount = bns.div(amountCrypto, amountMultiplier, DECIMAL_PRECISION)
  const displayFee = bns.div(networkFeeCrypto, feeMultiplier, DECIMAL_PRECISION)

  // For total amount, convert 'amount' currency to 'fee' currency so it be totaled as a single crypto amount to pass to FiatAmountTile component
  const amountCurrencyToFeeCurrencyExchangeRate = bns.div(amountNativeToExchangeRatio, feeNativeToExchangeRatio)
  const amountCryptoAsFeeCrypto = bns.mul(amountCurrencyToFeeCurrencyExchangeRate, networkFeeCrypto)
  const totalNativeCrypto = bns.mul(bns.add(amountCrypto, amountCryptoAsFeeCrypto), '-1')
  const totalCrypto = bns.div(totalNativeCrypto, amountMultiplier, DECIMAL_PRECISION)

  const isInsufficientBal =
    amountCurrencyCode === feeCurrencyCode ? bns.gt(bns.abs(totalNativeCrypto), feeCurrencyBalance) : bns.gt(networkFeeCrypto, feeCurrencyBalance)

  const handleSubmit = async () => {
    props.bridge.resolve(null)
    await wallet.otherMethods.wcRequestResponse(uri, true, payload)
    Airship.show(bridge => <FlashNotification bridge={bridge} message={s.strings.wc_smartcontract_confirmed} onPress={() => {}} />)
  }

  const handleClose = async () => {
    props.bridge.resolve(null)
    await wallet.otherMethods.wcRequestResponse(uri, false, payload)
  }

  const renderWarning = () => {
    return isInsufficientBal ? (
      <Alert
        marginTop={0.5}
        title={s.strings.wc_smartcontract_warning_title}
        message={sprintf(s.strings.wc_smartcontract_insufficient_text, feeCurrencyStr)}
        type="warning"
      />
    ) : (
      <Alert marginTop={0.5} title={s.strings.wc_smartcontract_warning_title} message={s.strings.wc_smartcontract_warning_text} type="warning" />
    )
  }

  const walletImageUri = getCurrencyIcon(feeCurrencyCode, amountCurrencyCode).symbolImage
  const slider = isInsufficientBal ? null : (
    <Slider parentStyle={styles.slider} onSlidingComplete={handleSubmit} disabledText={s.strings.send_confirmation_slide_to_confirm} />
  )

  return (
    <ThemedModal
      bridge={bridge}
      onCancel={() => {
        handleClose().catch(showError)
      }}
      paddingRem={[1, 0]}
    >
      <View style={styles.title} paddingRem={[0, 0, 0, 1]}>
        <Image style={styles.logo} source={WalletConnectLogo} />
        <ModalTitle>{s.strings.wc_smartcontract_title}</ModalTitle>
      </View>
      <ScrollView>
        {renderWarning()}
        {!zeroString(displayAmount) && (
          <CryptoFiatAmountTile
            title={s.strings.string_amount}
            cryptoAmount={displayAmount}
            cryptoCurrencyCode={amountCurrencyCode}
            isoFiatCurrencyCode={isoFiatCurrencyCode}
          />
        )}
        {walletName != null && (
          <IconTile title={s.strings.wc_smartcontract_wallet} iconUri={walletImageUri}>
            <EdgeText>{walletName}</EdgeText>
          </IconTile>
        )}
        <IconTile title={s.strings.wc_smartcontract_dapp} iconUri={icon}>
          <EdgeText>{dAppName}</EdgeText>
        </IconTile>
        {!zeroString(displayFee) && (
          <CryptoFiatAmountTile
            title={s.strings.wc_smartcontract_network_fee}
            cryptoAmount={displayFee}
            cryptoCurrencyCode={feeCurrencyCode}
            isoFiatCurrencyCode={isoFiatCurrencyCode}
          />
        )}
        {!zeroString(totalCrypto) && (
          <FiatAmountTile
            title={s.strings.wc_smartcontract_max_total}
            cryptoAmount={totalCrypto}
            cryptoCurrencyCode={feeCurrencyCode}
            isoFiatCurrencyCode={isoFiatCurrencyCode}
          />
        )}
        {slider}
      </ScrollView>
      <ModalCloseArrow
        onPress={() => {
          handleClose().catch(showError)
        }}
      />
    </ThemedModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.rem(1)
  },
  logo: {
    height: theme.rem(2),
    width: theme.rem(2),
    resizeMode: 'contain',
    padding: theme.rem(0.5)
  },
  slider: {
    paddingVertical: theme.rem(1)
  }
}))
