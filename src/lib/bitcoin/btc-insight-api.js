import qs from 'qs'

import BtcBaseApi from './btc-base-api'
import BigNumber from '../bignumber'

const POST_CONFIG = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

export const CHUNK_SIZE = 20

export default class BtcInsightApi extends BtcBaseApi {
  /**
   * @override
   */
  getBalance () {
    return this._get(`/addr/${this.address}/balance`)
      .then(balance => Number(balance) / this.multiplier)
  }

  /** @override */
  sendTransaction (txHex) {
    return this._post('/tx/send', { rawtx: txHex }).then(res => res.txid)
  }

  /** @override */
  getTransaction (txid) {
    return this._get(`tx/${txid}`).then(tx => this._mapTransaction(tx))
  }

  /** @override */
  getTransactions ({ from = 0 }) {
    const to = from + CHUNK_SIZE
    return this._get(`/addrs/${this.address}/txs`, { from, to })
      .then(resp => ({
        ...resp,
        hasMore: to < resp.totalItems,
        items: resp.items.map(tx => this._mapTransaction(tx))
      }))
  }

  /** @override */
  _getUnspents () {
    return this._get(`/addr/${this.address}/utxo?noCache=1`)
      .then(unspents => unspents.map(tx => ({
        ...tx,
        amount: new BigNumber(tx.amount).times(this.multiplier).toNumber()
      })))
  }

  /** Executes a GET request to the API */
  _get (url, params) {
    return this._getClient().get(url, params).then(response => response.data)
  }

  /** Executes a POST request to the API */
  _post (url, data) {
    return this._getClient().post(url, qs.stringify(data), POST_CONFIG).then(response => response.data)
  }
}
