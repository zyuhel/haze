<template>
  <transaction-template
    :amount="transaction.amount | currency(crypto)"
    :timestamp="transaction.timestamp || NaN"
    :id="transaction.hash || '' "
    :fee="transaction.fee | currency(crypto)"
    :confirmations="confirmations || NaN"
    :sender="sender || '' "
    :recipient="recipient || '' "
    :explorerLink="explorerLink"
    :partner="partner || '' "
    :status="status() || '' "
    :status_inconsistent="inconsistent_reason"
    :admTx="admTx"
    :crypto="crypto"
  />
</template>

<script>
import TransactionTemplate from './TransactionTemplate.vue'
import getExplorerUrl from '../../lib/getExplorerUrl'
import { Cryptos, TransactionStatus as TS } from '../../lib/constants'
import partnerName from '@/mixins/partnerName'
import { verifyTransactionDetails } from '@/lib/txVerify'

export default {
  mixins: [partnerName],
  name: 'eth-transaction',
  props: {
    id: {
      required: true,
      type: String
    },
    crypto: {
      required: true,
      type: String
    }
  },
  components: {
    TransactionTemplate
  },
  data () {
    return {
      inconsistent_reason: ''
    }
  },
  computed: {
    transaction () {
      return this.$store.state.eth.transactions[this.id] || { }
    },
    sender () {
      return this.transaction.senderId ? this.formatAddress(this.transaction.senderId) : ''
    },
    recipient () {
      return this.transaction.recipientId ? this.formatAddress(this.transaction.recipientId) : ''
    },
    partner () {
      if (this.transaction.partner) return this.transaction.partner

      const id = this.transaction.senderId !== this.$store.state.eth.address
        ? this.transaction.senderId : this.transaction.recipientId
      return this.getAdmAddress(id)
    },
    explorerLink () {
      return getExplorerUrl(Cryptos.ETH, this.id)
    },
    confirmations () {
      if (!this.transaction.blockNumber || !this.$store.state.eth.blockNumber) return 0
      return Math.max(0, this.$store.state.eth.blockNumber - this.transaction.blockNumber)
    },
    admTx () {
      let admTx = {}
      // Bad news, everyone: we'll have to scan the messages
      Object.values(this.$store.state.chat.chats).some(chat => {
        Object.values(chat.messages).some(msg => {
          if (msg.hash && msg.hash === this.id) {
            Object.assign(admTx, msg)
          }
          return !!admTx.id
        })
        return !!admTx.id
      })
      return admTx
    }
  },
  methods: {
    status () {
      let status = this.transaction.status
      let messageTx = this.admTx
      if (status === 'SUCCESS' && messageTx && messageTx.id) {
        const txVerify = verifyTransactionDetails(this.transaction, messageTx, { recipientCryptoAddress: this.transaction.recipientId, senderCryptoAddress: this.transaction.senderId })
        if (txVerify.isTxConsistent) {
          status = TS.CONFIRMED
          this.inconsistent_reason = ''
        } else {
          this.inconsistent_reason = this.$t(`transaction.inconsistent_reasons.${txVerify.txInconsistentReason}`, { crypto: this.crypto })
          status = TS.INVALID
        }
      }
      return status
    },
    getAdmAddress (address) {
      let admAddress = ''

      // First, check the known partners
      const partners = this.$store.state.partners.list
      Object.keys(partners).some(uid => {
        const partner = partners[uid]
        if (partner[Cryptos.ETH] === address) {
          admAddress = uid
        }
        return !!admAddress
      })

      if (!admAddress) {
        // Bad news, everyone: we'll have to scan the messages
        Object.values(this.$store.state.chat.chats).some(chat => {
          Object.values(chat.messages).some(msg => {
            if (msg.hash && msg.hash === this.id) {
              admAddress = msg.senderId === this.$store.state.address ? msg.recipientId : msg.senderId
            }
            return !!admAddress
          })
          return !!admAddress
        })
      }

      return admAddress
    },

    formatAddress (address) {
      let admAddress = this.getAdmAddress(address)
      let name = ''

      if (address === this.$store.state.eth.address) {
        name = this.$t('transaction.me')
      } else {
        name = this.getPartnerName(admAddress)
      }

      let result = ''
      if (name !== '' && name !== undefined) {
        result = name + ' (' + (address) + ')'
      } else {
        result = address
        if (admAddress) {
          result += ' (' + (admAddress) + ')'
        }
      }

      return result
    }
  }
}
</script>
