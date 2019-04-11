import { Cryptos } from '../constants'
import BtcInsightApi from './btc-insight-api'

export const TX_FEE = 1 // 1 DOGE per transaction

export default class DogeApi extends BtcInsightApi {
  constructor (passphrase) {
    super(Cryptos.DOGE, passphrase)
  }

  /** @override */
  getFee () {
    return TX_FEE
  }
}
