import chatModule from '@/store/modules/chat'
import sinon from 'sinon'

import { TransactionStatus as TS } from '@/lib/constants'

const { getters, mutations, actions } = chatModule

jest.mock('@/store', () => {})

describe('Store: chat.js', () => {
  let state = null

  beforeEach(() => {
    state = chatModule.state()
  })

  /**
   * Test getters.
   */
  describe('getters', () => {
    /**
     * getters.partners
     */
    describe('getters.partners', () => {
      it('should return empty array when no chats', () => {
        state = {
          chats: {}
        }

        expect(getters.partners(state)).toEqual([])
      })

      it('should return array of partners', () => {
        state = {
          chats: {
            U123456: {},
            U654321: {}
          }
        }

        expect(getters.partners(state)).toEqual(['U123456', 'U654321'])
      })
    })

    /**
     * getters.messages
     */
    describe('getters.messages', () => {
      it('should return empty array', () => {
        state = {
          chats: {
            U123456: {
              messages: []
            }
          }
        }

        expect(getters.messages(state)('U123456')).toEqual([])
      })

      it('should return empty array when no user in chat list', () => {
        state = {
          chats: {
            U123456: {
              messages: []
            }
          }
        }

        expect(getters.messages(state)('U654321')).toEqual([])
      })

      it('should return array of messages', () => {
        state = {
          chats: {
            U123456: {
              messages: [{}, {}] // 2 messages
            }
          }
        }

        expect(getters.messages(state)('U123456')).toEqual([{}, {}])
      })
    })

    /**
     * getters.messageById
     */
    describe('getters.messageById', () => {
      const state = {
        chats: {
          U111111: {
            messages: [
              { id: 1 },
              { id: 2 },
              { id: 3 }
            ]
          }
        }
      }
      const messageById = getters.messageById(state, {
        partners: getters.partners(state),
        messages: getters.messages(state)
      })

      it('should return message by id', () => {
        expect(messageById(1)).toEqual({ id: 1 })
        expect(messageById(2)).toEqual({ id: 2 })
        expect(messageById(3)).toEqual({ id: 3 })
      })

      it('should return undefined when message is not found', () => {
        expect(messageById(4)).toEqual(undefined)
      })

      it('should return undefined if typeof id = string', () => {
        expect(messageById('1')).toEqual(undefined)
      })
    })

    /**
     * getters.partnerMessageById
     */
    describe('getters.partnerMessageById', () => {
      const state = {
        chats: {
          U111111: {
            messages: [
              { id: 1 },
              { id: 2 },
              { id: 3 }
            ]
          }
        }
      }
      const partnerMessageById = getters.partnerMessageById(state, {
        messages: getters.messages(state)
      })

      it('should return message by id', () => {
        expect(partnerMessageById('U111111', 1)).toEqual({ id: 1 })
        expect(partnerMessageById('U111111', 2)).toEqual({ id: 2 })
        expect(partnerMessageById('U111111', 3)).toEqual({ id: 3 })
      })

      it('should return undefined when message is not found', () => {
        expect(partnerMessageById('U111111', 4)).toEqual(undefined)
      })

      it('should return undefined if typeof id = string', () => {
        expect(partnerMessageById('U111111', '1')).toEqual(undefined)
      })

      it('should return undefined if user is not in chat list', () => {
        expect(partnerMessageById('U222222', 1)).toEqual(undefined)
      })
    })

    /**
     * getters.lastMessage
     */
    describe('getters.lastMessage', () => {
      it('should return last message', () => {
        // two messages
        expect(getters.lastMessage({
          chats: {
            U123456: {
              messages: ['msg1', 'msg2']
            }
          }
        }, {
          partners: ['U123456']
        })('U123456')).toBe('msg2')

        // one message
        expect(getters.lastMessage({
          chats: {
            U123456: {
              messages: ['msg1']
            }
          }
        }, {
          partners: ['U123456']
        })('U123456')).toBe('msg1')
      })

      it('should return `null` when no messages', () => {
        const lastMessage = getters.lastMessage({
          chats: {
            U123456: {
              messages: []
            }
          }
        }, {
          partners: ['U123456']
        })('U123456')

        expect(lastMessage).toBe(null)
      })

      it('should return `null` when no partner in chat list', () => {
        const lastMessage = getters.lastMessage({
          chats: {
            U123456: {
              messages: []
            }
          }
        }, {
          partners: ['U654321']
        })('U123456')

        expect(lastMessage).toBe(null)
      })
    })

    /**
     * getters.lastMessageText
     */
    describe('getters.lastMessageText', () => {
      it('should return last message text', () => {
        let lastMessageText = null

        // type `message` or `adm transaction`
        lastMessageText = getters.lastMessageText({}, {
          lastMessage: () => ({
            message: 'hello world'
          })
        })()
        expect(lastMessageText).toBe('hello world')
      })

      it('should return empty string', () => {
        let lastMessageText = null

        // when `lastMessage = null`
        lastMessageText = getters.lastMessageText({}, {
          lastMessage: () => null
        })()
        expect(lastMessageText).toBe('')
      })
    })

    /**
     * getters.lastMessageTimestamp
     */
    describe('getters.lastMessageTimestamp', () => {
      it('should return timestamp', () => {
        let timestamp = null

        timestamp = getters.lastMessageTimestamp({}, {
          lastMessage: () => ({
            timestamp: 3600
          })
        })()

        expect(timestamp).toBe(3600)
      })

      it('should return empty string when `lastMessage = null`', () => {
        let timestamp = null

        timestamp = getters.lastMessageTimestamp({}, {
          lastMessage: () => null
        })()

        expect(timestamp).toBe('')
      })

      it('should return timestamp when `message.timestamp = 0`', () => {
        let timestamp = null

        timestamp = getters.lastMessageTimestamp({}, {
          lastMessage: () => ({
            timestamp: 0
          })
        })()

        expect(timestamp).toBe(0)
      })
    })

    /**
     * getters.isPartnerInChatList
     */
    describe('getters.isPartnerInChatList', () => {
      it('should return true or false', () => {
        let isPartnerInChatList = null

        isPartnerInChatList = getters.isPartnerInChatList({}, {
          partners: ['U123456', 'U654321']
        })

        expect(isPartnerInChatList('U123456')).toBe(true)
        expect(isPartnerInChatList('notInList')).toBe(false) // user not listed
      })
    })

    /**
     * getters.numOfNewMessages
     */
    describe('getters.numOfNewMessages', () => {
      it('should return number of new messages by senderId', () => {
        let numOfNewMessages = null

        numOfNewMessages = getters.numOfNewMessages({
          chats: {
            U123456: {
              numOfNewMessages: 10
            }
          }
        })

        expect(numOfNewMessages('U123456')).toBe(10)
        expect(numOfNewMessages('U654321')).toBe(0) // user not listed
      })
    })

    /**
     * getters.totalNumOfNewMessages
     */
    describe('getters.totalNumOfNewMessages', () => {
      it('should return total number of new messages', () => {
        let total = null

        total = getters.totalNumOfNewMessages({
          chats: {
            U123456: {
              numOfNewMessages: 10
            },
            U654321: {
              numOfNewMessages: 20
            }
          }
        })

        expect(total).toBe(30)
      })

      it('should return 0 when `chats` is empty', () => {
        let total = null

        total = getters.totalNumOfNewMessages({
          chats: {}
        })

        expect(total).toBe(0)
      })
    })

    /**
     * getters.isAdamantChat
     */
    describe('getters.isAdamantChat', () => {
      it('should return boolean', () => {
        const state = {
          chats: {
            adamantBounty: {
              isAdamantChat: true
            },
            adamantTokens: {
              isAdamantChat: false
            },
            U111111: {}
          }
        }

        const isAdamantChat = getters.isAdamantChat(state)

        expect(isAdamantChat('adamantBounty')).toBe(true)
        expect(isAdamantChat('adamantTokens')).toBe(false)
        expect(isAdamantChat('U111111')).toBe(false)
      })
    })

    /**
     * getters.isChatReadOnly
     */
    describe('getters.isChatReadOnly', () => {
      it('should return boolean', () => {
        const state = {
          chats: {
            adamantBounty: {
              readOnly: true
            },
            adamantTokens: {
              readOnly: false
            },
            U111111: {}
          }
        }

        const isChatReadOnly = getters.isChatReadOnly(state)

        expect(isChatReadOnly('adamantBounty')).toBe(true)
        expect(isChatReadOnly('adamantTokens')).toBe(false)
        expect(isChatReadOnly('U111111')).toBe(false)
      })
    })

    /**
     * getters.unreadMessages
     */
    describe('getters.unreadMessages', () => {
      it('should return empty array when no chats', () => {
        const partners = []
        const state = {
          chats: {}
        }

        expect(getters.unreadMessages(state, { partners })).toEqual([])
      })

      it('should return empty array when no unread messages', () => {
        const state = {
          chats: {
            U111111: {
              messages: [],
              numOfNewMessages: 0
            },
            U222222: {
              messages: [],
              numOfNewMessages: 0
            }
          }
        }

        const listGetters = {
          partners: getters.partners(state),
          numOfNewMessages: getters.numOfNewMessages(state),
          messages: getters.messages(state)
        }

        expect(getters.unreadMessages(state, listGetters)).toEqual([])
      })

      it('should return empty array when `numOfNewMessages = 0`', () => {
        const state = {
          chats: {
            U111111: {
              messages: [
                { id: 1 },
                { id: 2 },
                { id: 3 }
              ],
              numOfNewMessages: 0
            }
          }
        }

        const listGetters = {
          partners: getters.partners(state),
          numOfNewMessages: getters.numOfNewMessages(state),
          messages: getters.messages(state)
        }

        expect(getters.unreadMessages(state, listGetters)).toEqual([])
      })

      it('should return array of messages', () => {
        const messages = [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 },
          { id: 6 }
        ]

        const state = {
          chats: {
            U111111: {
              messages: [],
              numOfNewMessages: 0
            },
            U222222: {
              messages: [
                messages[0],
                messages[1],
                messages[2]
              ],
              numOfNewMessages: 1
            },
            U333333: {
              messages: [
                messages[3],
                messages[4],
                messages[5]
              ],
              numOfNewMessages: 2
            }
          }
        }

        const listGetters = {
          partners: getters.partners(state),
          numOfNewMessages: getters.numOfNewMessages(state),
          messages: getters.messages(state)
        }

        expect(getters.unreadMessages(state, listGetters)).toEqual(
          [
            messages[2],
            messages[4],
            messages[5]
          ]
        )
      })
    })

    /**
     * getters.lastUnreadMessage
     */
    describe('getters.lastUnreadMessage', () => {
      it('should return null when no messages', () => {
        const unreadMessages = []

        expect(getters.lastUnreadMessage({}, { unreadMessages })).toBe(null)
      })

      it('should return message', () => {
        const unreadMessages = [
          { id: 1 },
          { id: 2 },
          { id: 3 }
        ]

        const lastUnreadMessage = getters.lastUnreadMessage({}, { unreadMessages })

        expect(lastUnreadMessage).toEqual({ id: 3 })
      })
    })

    /**
     * getters.chatOffset
     */
    describe('getters.chatOffset', () => {
      let state = {
        chats: {
          U111111: {
            offset: 0
          }
        }
      }
      const chatOffset = getters.chatOffset(state)

      it('should return chat offset', () => {
        expect(chatOffset('U111111')).toBe(0)
      })

      it('should return `undefined` for non-existing chat', () => {
        expect(chatOffset('U222222')).toBe(undefined)
      })
    })

    /**
     * getters.chatPage
     */
    describe('getters.chatPage', () => {
      let state = {
        chats: {
          U111111: {
            page: 0
          }
        }
      }
      const chatPage = getters.chatPage(state)

      it('should return chat page', () => {
        expect(chatPage('U111111')).toBe(0)
      })

      it('should return `undefined` for non-existing chat', () => {
        expect(chatPage('U222222')).toBe(undefined)
      })
    })

    /**
     * getters.scrollPosition
     */
    describe('getters.scrollPosition', () => {
      it('should return scrollPosition', () => {
        const state = {
          chats: {
            U111111: {
              scrollPosition: 100
            }
          }
        }

        const scrollPosition = getters.scrollPosition(state)

        expect(scrollPosition('U111111')).toBe(100)
        expect(scrollPosition('U222222')).toBe(false) // non-existing chat
      })
    })
  })

  /**
   * Test mutations.
   */
  describe('mutations', () => {
    /**
     * mutations.setHeight
     */
    describe('mutations.setHeight', () => {
      it('should mutate `lastMessageHeight`', () => {
        const state = {
          lastMessageHeight: 0
        }

        mutations.setHeight(state, 100)

        expect(state.lastMessageHeight).toBe(100)
      })
    })

    /**
     * mutations.setChatOffset
     */
    describe('mutations.setChatOffset', () => {
      let state

      beforeEach(() => {
        state = {
          chats: {
            U111111: {
              offset: 0
            }
          }
        }
      })

      it('should update chat offset', () => {
        mutations.setChatOffset(state, { contactId: 'U111111', offset: 100 })

        expect(state.chats.U111111.offset).toBe(100)
      })
    })

    /**
     * mutations.setChatPage
     */
    describe('mutations.setChatPage', () => {
      let state

      beforeEach(() => {
        state = {
          chats: {
            U111111: {
              page: 0
            }
          }
        }
      })

      it('should update chat page', () => {
        mutations.setChatPage(state, { contactId: 'U111111', page: 100 })

        expect(state.chats.U111111.page).toBe(100)
      })
    })

    /**
     * mutations.setOffset
     */
    describe('mutations.setOffset', () => {
      it('should update `offset`', () => {
        const state = {
          offset: 0
        }

        mutations.setOffset(state, 100)

        expect(state.offset).toBe(100)
      })
    })

    /**
     * mutations.setFulfilled
     */
    describe('mutations.setFulfilled', () => {
      it('should mutate `isFulfilled`', () => {
        const state = {
          isFulfilled: false
        }

        mutations.setFulfilled(state, true)

        expect(state.isFulfilled).toBe(true)
      })
    })

    /**
     * mutations.createEmptyChat
     */
    describe('mutations.createEmptyChat', () => {
      it('should create empty chat', () => {
        const state = {
          chats: {}
        }

        mutations.createEmptyChat(state, 'U123456')

        expect(state.chats).toEqual({
          U123456: {
            messages: [],
            numOfNewMessages: 0,
            offset: 0,
            page: 0
          }
        })
      })
    })

    /**
     * mutations.pushMessage
     */
    describe('mutations.pushMessage', () => {
      it('should push message to specific chat by senderId', () => {
        const state = {
          chats: {
            U111111: {
              messages: []
            },
            U222222: {
              messages: []
            }
          }
        }

        const userId = 'U123456' // my address
        const partnerId = 'U111111'

        // U111111 => me
        mutations.pushMessage(state, {
          message: {
            id: '1',
            senderId: partnerId,
            recipientId: userId,
            message: 'hello'
          },
          userId
        })

        // me => U111111
        mutations.pushMessage(state, {
          message: {
            id: '2',
            senderId: userId,
            recipientId: partnerId,
            message: 'hi'
          },
          userId
        })

        expect(state.chats.U111111.messages).toEqual([
          {
            id: '1',
            senderId: partnerId,
            recipientId: userId,
            message: 'hello'
          },
          {
            id: '2',
            senderId: userId,
            recipientId: partnerId,
            message: 'hi'
          }
        ])
      })

      it('should create empty chat if the partner is not in chat list', () => {
        const state = {
          chats: {
            U111111: {
              messages: []
            },
            U222222: {
              messages: []
            }
          }
        }

        const userId = 'U123456' // my address
        const partnerId = 'U333333' // partner is not in chat list

        // me => U333333
        mutations.pushMessage(state, {
          message: {
            senderId: userId,
            recipientId: partnerId,
            message: 'hello'
          },
          userId
        })

        expect(state.chats.U333333.messages).toEqual([
          {
            senderId: userId,
            recipientId: partnerId,
            message: 'hello'
          }
        ])
      })

      it('should increment `numOfNewMessages` when `message.height > state.lastMessageHeight`', () => {
        const state = {
          chats: {
            U111111: {
              messages: [],
              numOfNewMessages: 0
            }
          },
          lastMessageHeight: 1
        }

        const userId = 'U123456' // my address
        const partnerId = 'U111111' // partner address

        // message 1
        mutations.pushMessage(state, {
          message: {
            id: '1',
            senderId: partnerId,
            recipientId: userId,
            message: 'message 1',
            height: 2
          },
          userId
        })

        expect(state.chats.U111111.numOfNewMessages).toBe(1)

        // message 2
        mutations.pushMessage(state, {
          message: {
            id: '2',
            senderId: partnerId,
            recipientId: userId,
            message: 'message 2',
            height: 2
          },
          userId
        })

        expect(state.chats.U111111.numOfNewMessages).toBe(2)
      })

      it('should not increment `numOfNewMessages` when `state.lastMessageHeight === 0`', () => {
        const state = {
          chats: {
            U111111: {
              messages: [],
              numOfNewMessages: 0
            }
          },
          lastMessageHeight: 0
        }

        const userId = 'U123456' // my address
        const partnerId = 'U111111' // partner address

        mutations.pushMessage(state, {
          message: {
            id: '1',
            senderId: partnerId,
            recipientId: userId,
            message: 'message 1',
            height: 2
          },
          userId
        })

        expect(state.chats.U111111.numOfNewMessages).toBe(0)
      })

      it('should not duplicate local messages added directly when `getNewMessages`', () => {
        const state = {
          chats: {
            U111111: {
              messages: [],
              numOfNewMessages: 0
            }
          }
        }

        const userId = 'U123456'
        const partnerId = 'U111111'
        const messageObject = {
          message: {
            id: '1',
            senderId: partnerId,
            recipientId: userId,
            message: 'message 1'
          },
          userId
        }

        mutations.pushMessage(state, messageObject)
        mutations.pushMessage(state, messageObject) // duplicate

        expect(state.chats.U111111.messages.length).toBe(1)
      })
    })

    /**
     * mutations.markAsRead
     */
    describe('mutations.markAsRead', () => {
      it('should reset `chat.numOfNewMessages`', () => {
        const state = {
          chats: {
            U123456: {
              numOfNewMessages: 100
            }
          }
        }

        mutations.markAsRead(state, 'U123456')

        expect(state.chats.U123456.numOfNewMessages).toBe(0)
      })
    })

    /**
     * mutations.markAllAsRead
     */
    describe('mutations.markAllAsRead', () => {
      it('should reset `chat.numOfNewMessages` for all chats', () => {
        const state = {
          chats: {
            U111111: {
              numOfNewMessages: 100
            },
            U222222: {
              numOfNewMessages: 200
            }
          }
        }

        mutations.markAllAsRead(state)

        expect(state.chats.U111111.numOfNewMessages).toBe(0)
        expect(state.chats.U222222.numOfNewMessages).toBe(0)
      })
    })

    /**
     * mutations.updateMessage
     */
    describe('mutations.updateMessage', () => {
      it('should update `message.id` & `message.status`', () => {
        const partnerId = 'U123456'
        const messages = [
          {
            id: 'localId1',
            status: TS.PENDING
          },
          {
            id: 'localId2',
            status: TS.PENDING
          }
        ]
        const state = {
          chats: {
            [partnerId]: {
              messages
            }
          }
        }

        // update message 1
        mutations.updateMessage(state, {
          partnerId,
          id: 'localId1',
          realId: 'realId1',
          status: TS.DELIVERED
        })

        // update message 2
        mutations.updateMessage(state, {
          partnerId,
          id: 'localId2',
          realId: 'realId2',
          status: TS.DELIVERED
        })

        expect(messages).toEqual([
          {
            id: 'realId1',
            status: TS.DELIVERED
          },
          {
            id: 'realId2',
            status: TS.DELIVERED
          }
        ])
      })
    })

    /**
     * mutations.createAdamantChats
     */
    describe('mutations.createAdamantChats', () => {
      it('should push ADAMANT chats to state.chats', () => {
        const state = {
          chats: {}
        }

        mutations.createAdamantChats(state)

        expect(state.chats['chats.virtual.welcome_message_title']).toBeTruthy() // Welcome ADAMANT
        expect(state.chats['U5149447931090026688']).toBeTruthy() // ADAMANT Exchange Bot
        expect(state.chats['U17840858470710371662']).toBeTruthy() // Bet on Bitcoin price
      })
    })

    /**
     * mutations.updateScrollPosition
     */
    describe('mutations.updateScrollPosition', () => {
      it('should update scroll position', () => {
        const state = {
          chats: {
            U111111: {
              scrollPosition: undefined
            }
          }
        }

        const contactId = 'U111111'
        const scrollPosition = 1000

        mutations.updateScrollPosition(state, { contactId, scrollPosition })

        expect(state.chats.U111111.scrollPosition).toBe(scrollPosition)
      })
    })

    /**
     * mutations.reset
     */
    describe('mutations.reset', () => {
      it('should reset state', () => {
        const state = {
          chats: { U123456: {} },
          lastMessageHeight: 1000,
          isFulfilled: true
        }

        mutations.reset(state)

        expect(state).toEqual({
          chats: {},
          lastMessageHeight: 0,
          isFulfilled: false
        })
      })
    })
  })

  /**
   * Test actions.
   */
  describe('actions', () => {
    /**
     * actions.loadChats
     */
    describe('actions.loadChats', () => {
      it('should commit and dispatch after success response', async () => {
        // mock `admApi.getChatRooms` method
        chatModule.__Rewire__('admApi', {
          getChatRooms: () => Promise.resolve({
            messages: [],
            lastMessageHeight: 100
          })
        })

        const state = {
          lastMessageHeight: 0
        }
        const rootState = {
          address: 'U123456'
        }

        const commit = sinon.spy()
        const dispatch = sinon.spy()

        await actions.loadChats({ state, commit, dispatch, rootState }, { perPage: 50 })

        expect(commit.args).toEqual([
          ['setFulfilled', false],
          ['setHeight', 100],
          ['setOffset', 50],
          ['setFulfilled', true]
        ])

        expect(dispatch.args).toEqual([
          ['pushMessages', []]
        ])
      })
    })

    /**
     * actions.loadChatsPaged
     */
    describe('actions.loadChatsPaged', () => {
      it('should resolve', async () => {
        // mock `admApi.getChatRooms` method
        chatModule.__Rewire__('admApi', {
          getChatRooms: () => Promise.resolve({
            messages: [1, 2, 3]
          })
        })

        const state = {
          offset: 10
        }
        const rootState = {
          address: 'U123456'
        }

        const commit = sinon.spy()
        const dispatch = sinon.spy()

        await actions.loadChatsPaged({ commit, dispatch, rootState, state }, { perPage: 50 })

        expect(dispatch.args).toEqual([
          ['pushMessages', [1, 2, 3]]
        ])

        expect(commit.args).toEqual([
          ['setOffset', 60] // offset: 10 + perPage: 50
        ])
      })

      it('should reject when no more chats', async () => {
        const state = {
          offset: -1
        }

        await expect(actions.loadChatsPaged({ state })).rejects.toEqual(new Error('No more chats'))
      })
    })

    /**
     * actions.getChatRoomMessages
     */
    describe('actions.getChatRoomMessages', () => {
      const rootState = {
        address: 'U111111'
      }
      const contactId = 'U222222'

      it('should unshift messages and set chat `height`', async () => {
        // mock `admApi.getChatRoomMessages` method
        chatModule.__Rewire__('admApi', {
          getChatRoomMessages: () => Promise.resolve({
            messages: [1, 2, 3]
          })
        })

        const commit = sinon.spy()
        const dispatch = sinon.spy()
        const perPage = 25
        const getters = {
          chatOffset: () => 0,
          chatPage: () => 0
        }

        await actions.getChatRoomMessages({ rootState, dispatch, commit, getters }, { contactId, perPage })

        expect(dispatch.args).toEqual([
          ['unshiftMessages', [1, 2, 3]]
        ])

        expect(commit.args).toEqual([
          ['setChatOffset', { contactId, offset: perPage  }],
          ['setChatPage', { contactId, page: 1  }]
        ])
      })

      it('should reject when no more messages', async () => {
        // mock `admApi.getChatRoomMessages` method
        chatModule.__Rewire__('admApi', {
          getChatRoomMessages: () => Promise.resolve({
            messages: [1, 2, 3]
          })
        })

        const getters = {
          chatOffset: () => -1,
          chatPage: () => 0
        }

        await expect(actions.getChatRoomMessages({ rootState, getters }, { contactId }))
          .rejects.toEqual(new Error('No more messages'))
      })
    })

    /**
     * actions.pushMessages
     */
    describe('actions.pushMessages', () => {
      it('should commit(pushMessage) n times', () => {
        const commit = sinon.spy()
        const rootState = {
          address: 'U123456'
        }
        const messages = [{}, {}, {}] // 3 times

        actions.pushMessages({ commit, rootState }, messages)

        expect(commit.callCount).toBe(3)
      })

      it('should commit(pushMessage) 0 times', () => {
        const commit = sinon.spy()
        const rootState = {
          address: 'U123456'
        }
        const messages = []

        actions.pushMessages({ commit, rootState }, messages)

        expect(commit.callCount).toBe(0)
      })
    })

    /**
     * actions.getNewMessages
     */
    describe('actions.getNewMessages', () => {
      it('should reject promise when `state.isFulfilled = false`', async () => {
        const state = {
          isFulfilled: false
        }

        await expect(actions.getNewMessages({ state })).rejects.toEqual(new Error('Chat is not fulfilled'))
      })

      it('should only dispatch `pushMessages` when `lastMessageHeight = 0`', async () => {
        chatModule.__Rewire__('getChats', () => Promise.resolve({
          messages: [],
          lastMessageHeight: 0
        }))

        const state = {
          isFulfilled: true
        }
        const commit = sinon.spy()
        const dispatch = sinon.spy()

        await expect(actions.getNewMessages({ state, commit, dispatch })).resolves.toEqual(undefined)
        expect(commit.args).toEqual([])
        expect(dispatch.args).toEqual([
          ['pushMessages', []]
        ])
      })

      it('should dispatch `pushMessages` & commit `setHeight`', async () => {
        chatModule.__Rewire__('getChats', () => Promise.resolve({
          messages: [],
          lastMessageHeight: 100
        }))

        const state = {
          isFulfilled: true
        }
        const commit = sinon.spy()
        const dispatch = sinon.spy()

        await expect(actions.getNewMessages({ state, commit, dispatch })).resolves.toEqual(undefined)
        expect(commit.args).toEqual([
          ['setHeight', 100]
        ])
        expect(dispatch.args).toEqual([
          ['pushMessages', []]
        ])
      })
    })

    /**
     * actions.createChat
     */
    describe('actions.createChat', () => {
      it('should throw error when invalid user address', async () => {
        const promise = actions.createChat({ commit: null }, {
          partnerId: 'invalid user id'
        })

        await expect(promise).rejects.toEqual(new Error('Invalid user address'))
      })

      it('should resolve and create chat without `partnerName`', async () => {
        // mock & replace `admApi.getPublicKey` dependency
        chatModule.__Rewire__('admApi', {
          getPublicKey: () => Promise.resolve('public key')
        })

        const partnerId = 'U111111'

        const commit = sinon.spy()

        await expect(actions.createChat({ commit }, { partnerId })).resolves.toEqual('public key')

        expect(commit.args).toEqual([
          ['createEmptyChat', partnerId]
        ])
      })

      it('should resolve and create chat with `partnerName`', async () => {
        // mock & replace `admApi.getPublicKey` dependency
        chatModule.__Rewire__('admApi', {
          getPublicKey: () => Promise.resolve('public key')
        })

        const partnerId = 'U111111'
        const partnerName = 'Rick Sanchez'

        const commit = sinon.spy()

        await expect(actions.createChat({ commit }, { partnerId, partnerName })).resolves.toEqual('public key')

        expect(commit.args).toEqual([
          ['partners/displayName', { partner: partnerId, displayName: partnerName }, { root: true }],
          ['createEmptyChat', partnerId]
        ])
      })
    })

    /**
     * actions.sendMessage
     */
    describe('actions.sendMessage', () => {
      const userId = 'U111111'
      const recipientId = 'U222222'
      const message = 'hello world'

      it('should update message status when rejected', async () => {
        const messageObject = {
          id: '1',
          message: 'hello world',
          status: TS.PENDING
        }

        // mock & replace `createMessage` & `queueMessage` dependency
        chatModule.__Rewire__('createMessage', () => messageObject)
        chatModule.__Rewire__('queueMessage', () => Promise.reject(new Error('Message rejected')))

        const commit = sinon.spy()
        const rootState = {
          address: userId
        }

        const promise = actions.sendMessage({ commit, rootState }, { message, recipientId })
        await expect(promise).rejects.toEqual(new Error('Message rejected'))

        expect(commit.args).toEqual([
          ['pushMessage', { message: messageObject, userId }],
          ['updateMessage', {
            id: messageObject.id,
            status: TS.REJECTED,
            partnerId: recipientId
          }]
        ])
      })

      it('should update message status to `delivered`', async () => {
        const messageObject = {
          id: '1',
          message: 'hello world',
          status: TS.PENDING
        }
        const transactionId = 't1'

        // mock & replace `createMessage` & `queueMessage` dependency
        chatModule.__Rewire__('createMessage', () => messageObject)
        chatModule.__Rewire__('queueMessage', () => Promise.resolve({ success: true, transactionId }))

        const commit = sinon.spy()
        const rootState = {
          address: userId
        }

        const promise = actions.sendMessage({ commit, rootState }, { message, recipientId })
        await expect(promise).resolves.toEqual({ success: true, transactionId })

        expect(commit.args).toEqual([
          ['pushMessage', { message: messageObject, userId }],
          ['updateMessage', {
            id: messageObject.id,
            realId: transactionId,
            status: TS.DELIVERED,
            partnerId: recipientId
          }]
        ])
      })
    })

    /**
     * actions.resendMessage
     */
    describe('actions.resendMessage', () => {
      const userId = 'U111111'
      const recipientId = 'U222222'
      const messageId = 1
      const message = 'hello world'

      const messageObject = {
        id: messageId,
        message,
        status: TS.PENDING
      }
      const transactionId = 't1'

      it('should resend message successfully', async () => {
        // mock & replace `createMessage` & `queueMessage` dependency
        chatModule.__Rewire__('createMessage', () => messageObject)
        chatModule.__Rewire__('queueMessage', () => {
          return Promise.resolve({ success: true, transactionId })
        })

        const commit = sinon.spy()
        const mockGetters = {
          partnerMessageById: () => ({
            id: 1,
            recipientId,
            message: 'hello world'
          })
        }

        const promise = actions.resendMessage({ commit, getters: mockGetters }, { recipientId, messageId })
        await expect(promise).resolves.toEqual({ success: true, transactionId })

        expect(commit.args).toEqual([
          ['updateMessage', {
            id: messageId,
            status: TS.PENDING,
            partnerId: recipientId
          }],
          ['updateMessage', {
            id: messageId,
            realId: transactionId,
            status: TS.DELIVERED,
            partnerId: recipientId
          }]
        ])
      })

      it('resend should fail', async () => {
        // mock & replace `createMessage` & `queueMessage` dependency
        chatModule.__Rewire__('createMessage', () => messageObject)
        chatModule.__Rewire__('queueMessage', () => {
          return Promise.reject(new Error('No connection'))
        })

        const commit = sinon.spy()
        const mockGetters = {
          partnerMessageById: () => ({
            id: 1,
            recipientId,
            message: 'hello world'
          })
        }

        const promise = actions.resendMessage({ commit, getters: mockGetters }, { recipientId, messageId })
        await expect(promise).rejects.toEqual(new Error('No connection'))

        expect(commit.args).toEqual([
          ['updateMessage', {
            id: messageId,
            status: TS.PENDING,
            partnerId: recipientId
          }],
          ['updateMessage', {
            id: messageId,
            status: TS.REJECTED,
            partnerId: recipientId
          }]
        ])
      })
    })

    /**
     * actions.pushTransaction
     */
    describe('actions.pushTransaction', () => {
      it('should commit `pushMessage`', () => {
        const rootState = {
          address: 'U123456'
        }

        const payload = {
          transactionId: '1234567',
          recipientId: 'U654321',
          type: 'ETH',
          status: TS.PENDING,
          amount: 1,
          hash: '0x01234567890ABCDEF',
          comment: 'comment'
        }

        const commit = sinon.spy()

        actions.pushTransaction({ commit, rootState }, payload)

        const transactionObject = Object.assign({}, payload)
        transactionObject.id = payload.transactionId
        transactionObject.message = payload.comment
        transactionObject.senderId = 'U123456'
        delete transactionObject.comment
        delete transactionObject.transactionId

        delete commit.args[0][1].message.timestamp // impossible to check since it generated
        expect(commit.args).toEqual([
          ['pushMessage', {
            message: transactionObject,
            userId: 'U123456'
          }],
          ['updateScrollPosition', {
            contactId: 'U654321',
            scrollPosition: undefined
          }]
        ])
      })
    })

    /**
     * actions.reset
     */
    describe('actions.reset', () => {
      it('should commit `reset`', () => {
        const commit = sinon.spy()

        actions.reset.handler({ commit })

        expect(commit.args).toEqual([
          ['reset']
        ])
      })
    })
  })
})
