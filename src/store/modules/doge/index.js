// import actions from './doge-actions'
// import mutations from './doge-mutations'
// import getters from './doge-getters'
// import state from './doge-state'

// export default {
//   namespaced: true,
//   actions,
//   mutations,
//   getters,
//   state
// }

import createInsightModule from '../btc-insight-base'
import { Cryptos } from '../../../lib/constants'
import DogeApi, { TX_FEE } from '@/lib/bitcoin/doge-api'

export default createInsightModule(Cryptos.DOGE, DogeApi, TX_FEE)
