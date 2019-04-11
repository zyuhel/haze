import BtcBaseApi from './btc-base-api'
import { Cryptos } from '../constants'

export default class BitcoinApi extends BtcBaseApi {
  constructor (passphrase) {
    super(Cryptos.BTC, passphrase)
  }

  /** @override */
  getFee () {
    return 0.0001
  }
}
