import baseState from '../btc-base/btc-base-state'

export default (crypto) => () => ({
  crypto,
  ...baseState()
})
