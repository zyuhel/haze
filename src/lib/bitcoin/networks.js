import coininfo from 'coininfo'
import { Cryptos } from '../constants'

const getNetwork = fmt => ({
  messagePrefix: '\x19' + fmt.name + ' Signed Message:\n',
  bip32: {
    public: fmt.bip32.public,
    private: fmt.bip32.private
  },
  pubKeyHash: fmt.pubKeyHash,
  scriptHash: fmt.scriptHash,
  wif: fmt.wif
})

export default Object.freeze({
  [Cryptos.DOGE]: getNetwork(coininfo.dogecoin.main.toBitcoinJS()),
  [Cryptos.DASH]: getNetwork(coininfo.dash.main.toBitcoinJS()),
  [Cryptos.BTC]: getNetwork(coininfo.bitcoin.main.toBitcoinJS())
})
