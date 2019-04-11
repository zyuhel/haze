import baseActions from '../btc-base/btc-base-actions'

const getOldTransactions = (api, context) => {
  const from = Object.keys(context.state.transactions).length
  return api.getTransactions({ from }).then(result => {
    context.commit('transactions', result.items)
    if (!result.hasMore) {
      context.commit('bottom')
    }
  })
}

const getNewTransactions = (api, context) => {
  return api.getTransactions({ }).then(result => {
    context.commit('transactions', result.items)
  })
}

export default (ApiCtor) => baseActions({
  apiCtor: ApiCtor,
  getOldTransactions,
  getNewTransactions
})
