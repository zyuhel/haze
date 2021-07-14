<template>
  <v-card class="chat">
    <free-tokens-dialog v-model="showFreeTokensDialog" />
    <a-chat
      :messages="messages"
      :partners="partners"
      :user-id="userId"
      :loading="loading"
      :locale="$i18n.locale"

      @scroll:top="onScrollTop"
      @scroll:bottom="onScrollBottom"
      @scroll="onScroll"

      ref="chat"
    >
      <chat-toolbar :partner-id="partnerId" slot="header">
        <ChatAvatar
          @click="onClickAvatar(partnerId)"
          :user-id="partnerId"
          use-public-key
          slot="avatar-toolbar"
        />
      </chat-toolbar>
      <template slot="message" slot-scope="{ message, userId, sender, locale }">

        <a-chat-message
          v-if="message.type === 'message'"
          v-bind="message"
          :key="message.id"
          :message="formatMessage(message)"
          :time="message.timestamp | date"
          :user-id="userId"
          :sender="sender"
          :show-avatar="!isChatReadOnly"
          :locale="locale"
          :html="true"
          :i18n="{ retry: $t('chats.retry_message') }"
          :hide-time="message.readonly"
          @resend="resendMessage(partnerId, message.id)"
        >
          <ChatAvatar
            @click="onClickAvatar(sender.id)"
            :user-id="sender.id"
            use-public-key
            slot="avatar"
          />
        </a-chat-message>

        <a-chat-transaction
          v-else-if="isTransaction(message.type)"
          v-bind="message"
          :key="message.id"
          :user-id="userId"
          :sender="sender"
          :amount="message.amount | currency(message.type)"
          :time="message.timestamp | date"
          :currency="message.type"
          :i18n="{
            sent: $t('chats.sent_label'),
            received: $t('chats.received_label'),
            statuses: $t('chats.transaction_statuses')
          }"
          :locale="locale"
          :status="getTransactionStatus(message, partnerId)"
          :is-clickable="isCryptoSupported(message.type)"
          @click:transaction="openTransaction(message)"
          @click:transactionStatus="updateTransactionStatus(message)"
          @mount="fetchTransactionStatus(message, partnerId)"
        >
          <crypto-icon
            slot="crypto"
            :crypto="message.type"
          />
        </a-chat-transaction>

      </template>

      <a-chat-form
        v-if="!isChatReadOnly"
        ref="chatForm"
        slot="form"
        @message="onMessage"
        :show-send-button="true"
        :send-on-enter="sendMessageOnEnter"
        :show-divider="true"
        :label="chatFormLabel"
        :messageText="messageText"
      >
        <chat-menu
          slot="prepend"
          :partner-id="partnerId"
        />
      </a-chat-form>

      <v-btn
        v-if="!isScrolledToBottom"
        @click="$refs.chat.scrollToBottom()"
        class="ma-0 grey--text"
        color="grey lighten-3"
        depressed
        fab
        slot="fab"
        small
      >
        <v-icon large>mdi-chevron-down</v-icon>
      </v-btn>
    </a-chat>
  </v-card>
</template>

<script>
import { detect } from 'detect-browser'
import Visibility from 'visibilityjs'

import { Cryptos } from '@/lib/constants'
import { renderMarkdown } from '@/lib/markdown'

import { AChat, AChatMessage, AChatTransaction, AChatForm } from '@/components/AChat'
import ChatToolbar from '@/components/Chat/ChatToolbar'
import ChatAvatar from '@/components/Chat/ChatAvatar'
import ChatMenu from '@/components/Chat/ChatMenu'
import transaction from '@/mixins/transaction'
import partnerName from '@/mixins/partnerName'
import dateFilter from '@/filters/date'
import CryptoIcon from '@/components/icons/CryptoIcon'
import FreeTokensDialog from '@/components/FreeTokensDialog'
import { websiteUriToOnion } from '@/lib/uri'

/**
 * Returns user meta by userId.
 * @param {string} userId
 * @returns {User} See `packages/chat/src/types.ts`
 */
function getUserMeta (userId) {
  let user = {
    id: userId,
    name: ''
  }

  if (userId === this.userId) {
    user.name = this.$t('chats.you')
  } else {
    user.name = this.getPartnerName(userId)
  }

  return user
}

/**
 * Validate message before sending.
 * @param {string} message
 * @returns {boolean}
 */
function validateMessage (message) {
  // Ensure that message contains at least one non-whitespace character
  if (!message.trim().length) {
    return false
  }

  if (this.$store.state.balance < 0.001) {
    if (this.$store.getters.isAccountNew()) {
      this.showFreeTokensDialog = true
    } else {
      this.$store.dispatch('snackbar/show', { message: this.$t('chats.no_money') })
    }
    return false
  }

  if ((message.length * 1.5) > 20000) {
    this.$store.dispatch('snackbar/show', {
      message: this.$t('chats.too_long')
    })
    return false
  }

  return true
}

export default {
  created () {
    window.addEventListener('keyup', this.onKeyPress)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.onKeyPress)
    Visibility.unbind(this.visibilityId)
  },
  mounted () {
    if (this.isFulfilled && this.chatPage <= 0) this.fetchChatMessages()

    this.scrollBehavior()
    this.$nextTick(() => {
      this.isScrolledToBottom = this.$refs.chat.isScrolledToBottom()
    })
    this.visibilityId = Visibility.change((event, state) => {
      if (state === 'visible' && this.isScrolledToBottom) this.markAsRead()
    })
    this.chatFormLabel = {
      'Mac OS': this.$t('chats.message_mac_os'),
      'Windows 10': this.$t('chats.message_windows_10')
    }[detect().os] || this.$t('chats.message')
  },
  watch: {
    // Scroll to the bottom every time window focused by desktop notification
    '$store.state.notification.desktopActivateClickCount' () {
      this.$nextTick(() => {
        this.$refs.chat.scrollToBottom()
      })
    },
    // scroll to bottom when received new message
    messages () {
      this.$nextTick(() => {
        if (this.isScrolledToBottom) {
          this.$refs.chat.scrollToBottom()
        }

        if (!Visibility.hidden()) this.markAsRead()
      })
    },
    // watch `isFulfilled` when opening chat directly from address bar
    isFulfilled (value) {
      if (value && this.chatPage <= 0) this.fetchChatMessages()
    }
  },
  computed: {
    /**
     * Returns array of transformed messages.
     * @returns {Message[]}
     */
    messages () {
      return this.$store.getters['chat/messages'](this.partnerId)
    },
    /**
     * Returns array of partners who participate in chat.
     * @returns {User[]}
     */
    partners () {
      return [
        getUserMeta.call(this, this.userId),
        getUserMeta.call(this, this.partnerId)
      ]
    },
    userId () {
      return this.$store.state.address
    },
    isChatReadOnly () {
      return this.$store.getters['chat/isChatReadOnly'](this.partnerId)
    },
    sendMessageOnEnter () {
      return this.$store.state.options.sendMessageOnEnter
    },
    isFulfilled () {
      return this.$store.state.chat.isFulfilled
    },
    lastMessage () {
      return this.$store.getters['chat/lastMessage'](this.partnerId)
    },
    chatPage () {
      return this.$store.getters['chat/chatPage'](this.partnerId)
    },
    scrollPosition () {
      return this.$store.getters['chat/scrollPosition'](this.partnerId)
    },
    numOfNewMessages () {
      return this.$store.getters['chat/numOfNewMessages'](this.partnerId)
    }
  },
  data: () => ({
    chatFormLabel: '',
    loading: false,
    noMoreMessages: false,
    isScrolledToBottom: true,
    visibilityId: null,
    showFreeTokensDialog: false
  }),
  methods: {
    onMessage (message) {
      if (validateMessage.call(this, message)) {
        this.sendMessage(message)
        this.$nextTick(() => this.$refs.chat.scrollToBottom())
      }
    },
    sendMessage (message) {
      return this.$store.dispatch('chat/sendMessage', {
        message,
        recipientId: this.partnerId
      })
        .catch(err => {
          console.error(err.message)
        })
    },
    resendMessage (recipientId, messageId) {
      return this.$store.dispatch('chat/resendMessage', { recipientId, messageId })
        .catch(err => {
          this.$store.dispatch('snackbar/show', {
            message: err.message
          })
          console.error(err.message)
        })
    },
    updateTransactionStatus (message) {
      this.$store.dispatch(message.type.toLowerCase() + '/updateTransaction', { hash: message.hash, force: true, updateOnly: false, dropStatus: true })
    },
    markAsRead () {
      this.$store.commit('chat/markAsRead', this.partnerId)
    },
    onScrollTop () {
      this.fetchChatMessages()
    },
    onScrollBottom () {
      this.markAsRead()
    },
    onScroll (scrollPosition, isBottom) {
      this.isScrolledToBottom = isBottom

      this.$store.commit('chat/updateScrollPosition', {
        contactId: this.partnerId,
        scrollPosition
      })
    },
    /**
     * @param {string} address ADAMANT address
     */
    onClickAvatar (address) {
      this.$emit('click:chat-avatar', address)
    },
    openTransaction (transaction) {
      if (transaction.type in Cryptos) {
        this.$router.push({
          name: 'Transaction',
          params: {
            crypto: transaction.type,
            txId: transaction.hash
          },
          query: {
            fromChat: true
          }
        })
      }
    },
    isTransaction (type) {
      return (
        type in Cryptos ||
        type === 'UNKNOWN_CRYPTO'
      )
    },
    isCryptoSupported (type) {
      return type in Cryptos
    },
    formatMessage (transaction) {
      if (this.isChatReadOnly || transaction.i18n) {
        return renderMarkdown(websiteUriToOnion(this.$t(transaction.message)))
      }

      if (this.$store.state.options.formatMessages) {
        return renderMarkdown(transaction.message)
      }

      return transaction.message
    },
    fetchChatMessages () {
      if (this.noMoreMessages) return
      if (this.loading) return

      this.loading = true

      return this.$store.dispatch('chat/getChatRoomMessages', { contactId: this.partnerId })
        .catch(() => {
          this.noMoreMessages = true
        })
        .finally(() => {
          this.loading = false
          this.$refs.chat.maintainScrollPosition()
        })
    },
    scrollBehavior () {
      this.$nextTick(() => {
        if (this.numOfNewMessages > 0) {
          this.$refs.chat.scrollToMessage(this.numOfNewMessages - 1)
        } else if (this.scrollPosition !== false) {
          this.$refs.chat.scrollTo(this.scrollPosition)
        } else {
          this.$refs.chat.scrollToBottom()
        }

        this.markAsRead()
      })
    },
    onKeyPress (e) {
      if (e.code === 'Enter' && !this.showFreeTokensDialog) this.$refs.chatForm.focus()
    }
  },
  filters: {
    date: dateFilter
  },
  mixins: [transaction, partnerName],
  components: {
    AChat,
    AChatMessage,
    AChatTransaction,
    AChatForm,
    ChatToolbar,
    ChatAvatar,
    ChatMenu,
    CryptoIcon,
    FreeTokensDialog
  },
  props: {
    messageText: {
      default: '',
      type: String
    },
    partnerId: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped lang="stylus">
.chat
  height: 100vh
  box-shadow: none
  background-color: transparent !important
</style>
