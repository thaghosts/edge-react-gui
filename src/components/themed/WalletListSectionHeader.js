// @flow

import { wrap } from 'cavy'
import * as React from 'react'

import { View } from '../../types/wrappedReactNative.js'
import { type Theme, cacheStyles, useTheme } from '../services/ThemeContext.js'
import { EdgeText } from '../themed/EdgeText.js'

const WalletListSectionHeaderComponent = (props: { title: string }) => {
  const styles = getStyles(useTheme())
  return (
    <View style={styles.container}>
      <EdgeText style={styles.text}>{props.title}</EdgeText>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.modal
  },
  text: {
    fontSize: theme.rem(0.75)
  }
}))

export const WalletListSectionHeader = wrap(WalletListSectionHeaderComponent)
