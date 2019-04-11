export const EPOCH = Date.UTC(2017, 8, 2, 17, 0, 0, 0)

export const Transactions = {
  SEND: 0,
  SIGNATURE: 1,
  DELEGATE: 2,
  VOTE: 3,
  MULTI: 4,
  DAPP: 5,
  IN_TRANSFER: 6,
  OUT_TRANSFER: 7,
  CHAT_MESSAGE: 8,
  STATE: 9
}

export const Cryptos = {
  ADM: 'ADM',
  ETH: 'ETH',
  BNB: 'BNB',
  DOGE: 'DOGE',
  BZ: 'BZ',
  DASH: 'DASH',
  BTC: 'BTC'
}

export const ERC20 = Object.freeze([
  Cryptos.BNB,
  Cryptos.BZ
])

export const BTC_BASED = Object.freeze([
  Cryptos.DOGE,
  Cryptos.DASH,
  Cryptos.BTC
])

export const isErc20 = crypto => ERC20.includes(crypto)

export const isBtcBased = crypto => BTC_BASED.includes(crypto)

/** Number of decimal places for the different crypto amounts */
export const CryptoAmountPrecision = {
  ADM: 2,
  ETH: 6,
  BNB: 6,
  DOGE: 8,
  BZ: 6,
  DASH: 8,
  BTC: 8
}

export const CryptoNaturalUnits = {
  ADM: 8,
  ETH: 18,
  BNB: 18,
  DOGE: 8,
  BZ: 18,
  DASH: 8,
  BTC: 8
}

/** Fees for the misc ADM operations */
export const Fees = {
  /** Storing a value into the KVS */
  KVS: 0.001,
  /** Transfering tokens */
  ADM_TRANSFER: 0.5,
  NOT_ADM_TRANSFER: 0.001
}

/** Regex for detecting of base64 encoded string */
export const base64regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

export const Symbols = {
  CLOCK: String.fromCharCode(0x23f0), // ⏰
  HOURGLASS: String.fromCharCode(0x23f3), // ⏳
  CROSS: String.fromCharCode(0x274c) // ❌
}

export const Delegates = {
  ACTIVE_DELEGATES: 101
}

export const WelcomeMessage = {
  ADAMANT_BOUNTY: 'ADAMANT Bounty',
  ADAMANT_ICO: 'ADAMANT Tokens'
}

/** Gas value for the ETH transfers */
export const ETH_TRANSFER_GAS = 21000

/** Gas value for the ERC-20 transfers */
export const ERC20_TRANSFER_GAS = ETH_TRANSFER_GAS * 10

export default {
  EPOCH,
  Transactions
}

export const UserPasswordArticleLink = 'https://medium.com/adamant-im/more-convenience-login-to-the-web-messenger-with-user-password-9d48a736dfd8'

export const UserPasswordHashSettings = {
  SALT: 'salt',
  ITERATIONS: 100000,
  KEYLEN: 64,
  DIGEST: 'sha512'
}

export const TransactionStatus = {
  DELIVERED: 'delivered',
  PENDING: 'pending',
  REJECTED: 'rejected',
  INVALID: 'invalid'
}
