import baseGetters from '../btc-base/btc-base-getters'

export default (txFee) => ({
  ...baseGetters,

  fee () {
    return txFee
  }
})
