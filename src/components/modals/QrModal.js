// @flow

import { BlurView } from '@react-native-community/blur'
import { wrap } from 'cavy'
import * as React from 'react'
import { type AirshipBridge, AirshipModal } from 'react-native-airship'

import { useWindowSize } from '../../hooks/useWindowSize.js'
import { StyleSheet } from '../../types/wrappedReactNative.js'
import { useTheme } from '../services/ThemeContext.js'
import { QrCode } from '../themed/QrCode.js'

type Props = {
  bridge: AirshipBridge<void>,
  data?: string
}

const Qr = (props: Props) => {
  const { bridge, data } = props
  const theme = useTheme()
  const windowSize = useWindowSize()
  const maxSize = Math.min(windowSize.width, windowSize.height)

  const handleCancel = () => bridge.resolve(undefined)

  return (
    <AirshipModal
      bridge={bridge}
      backgroundColor="transparent"
      center
      maxWidth={maxSize}
      maxHeight={maxSize}
      onCancel={handleCancel}
      underlay={<BlurView blurType={theme.isDark ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />}
    >
      <QrCode data={data} onPress={handleCancel} />
    </AirshipModal>
  )
}

export const QrModal = wrap(Qr)
