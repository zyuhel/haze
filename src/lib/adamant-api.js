import sa from 'superagent'

import getEndpointUrl from './getEndpointUrl'
import { Cryptos, Transactions } from './constants'
import utils from './adamant'

const endpoint = getEndpointUrl(Cryptos.ADM)

/** @type {{privateKey: Buffer, publicKey: Buffer}} */
let myKeypair = { }
let myAddress = null

const publicKeysCache = { }

function toAbsolute (url = '') {
  return endpoint + url
}

function get (url, query) {
  return sa.get(toAbsolute(url))
    .query(query)
    .then(response => response.body)
}

function post (url, payload) {
  return sa.post(toAbsolute(url))
    .send(payload)
    .then(response => response.body)
}

export function unlock (passphrase) {
  const hash = utils.createPassPhraseHash(passphrase)
  myKeypair = utils.makeKeypair(hash)
  myAddress = utils.getAddressFromPublicKey(myKeypair.publicKey)
}

/**
 * Retrieves user public key by his address
 * @param {string} address ADM address
 * @returns {Promise<string>}
 */
export function getPublicKey (address = '') {
  if (publicKeysCache[address]) {
    return Promise.resolve(publicKeysCache[address])
  }

  return get('/api/accounts/getPublicKey', { address })
    .then(response => {
      const key = response.publicKey
      publicKeysCache[address] = key
      return key
    })
}

/**
 * Sends message with the specified payload
 * @param {string} to recipient address
 * @param {string} text message text
 * @param {number=1} type 1 for a regular message, 2 for a special one
 */
export function sendMessage (to, text, type = 1) {
  return getPublicKey(to)
    .then(publicKey => {
      const message = utils.encodeMessage(text, publicKey, myKeypair.privateKey)

      const transaction = {
        type: Transactions.CHAT_MESSAGE,
        amount: 0,
        asset: {
          chat: { ...message, type }
        },
        recipientId: to,
        senderId: myAddress,
        senderPublicKey: myKeypair.publicKey.toString('hex'),
        timestamp: utils.epochTime()
      }
      transaction.signature = utils.transactionSign(transaction, myKeypair)

      return post('/api/chats/process', { transaction })
    })
}

/**
 * Sends special message with the specified payload
 * @param {string} to recipient address
 * @param {object} payload message payload
 */
export function sendSpecialMessage (to, payload) {
  return sendMessage(to, JSON.stringify(payload), 2)
}

/**
 * Stores the supplied value into the Adamant KVS under the specified key.
 * @param {string} key key for the stored value
 * @param {any} value value to store
 * @returns {Promise<{success: boolean}>}
 */
export function storeValue (key, value) {
  const transaction = {
    type: Transactions.STATE,
    amount: 0,
    senderId: myAddress,
    senderPublicKey: myKeypair.publicKey.toString('hex'),
    asset: {
      state: { key, value, type: 0 }
    },
    timestamp: utils.epochTime()
  }

  transaction.signature = utils.transactionSign(transaction, myKeypair)

  return post('/api/states/store', { transaction }).then(console.log, console.error)
}

/**
 * Retrieves the stored value from the Adamant KVS
 * @param {string} key key in the KVS
 * @param {string=} ownerAddress address of the value owner
 * @returns {Promise<any>}
 */
export function getStored (key, ownerAddress) {
  if (!ownerAddress) {
    ownerAddress = myAddress
  }

  return get('/api/states/get', { senderId: ownerAddress }).then(response => {
    if (response.success) {
      const trans = response.transactions.filter(x => key === (x.asset && x.asset.state && x.asset.state.key))[0]
      return trans ? trans.asset.state.value : undefined
    }
  })
}