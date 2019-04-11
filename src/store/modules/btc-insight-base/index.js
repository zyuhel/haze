import createActions from './btc-insight-base-actions'
import mutations from './btc-insight-base-mutations'
import createGetters from './btc-insight-base-getters'
import createState from './btc-insight-base-state'

export default (crypto, apiCtor, fee) => ({
  namespaced: true,
  actions: createActions(apiCtor),
  mutations,
  getters: createGetters(fee),
  state: createState(crypto)
})
