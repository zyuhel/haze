import merge from 'deepmerge'
import cloneDeep from 'lodash/cloneDeep'
import {
  decryptData,
  encryptData,
  getAdmDataBase, getChatItem, getCommonItem, getContactItem, getPassPhrase,
  updateChatItem,
  updateCommonItem, updateContactItem
} from './indexedDb'

function updateChat (lastChatUpdateTime, copyState, mutation, store, db) {
  lastChatUpdateTime = new Date().getTime()
  const chats = copyState.chats
  const chatMap = new Map(Object.entries(chats))
  let chatKey
  if (mutation.payload.direction === 'to') {
    chatKey = mutation.payload.senderId
  } else {
    chatKey = mutation.payload.recipientId
  }
  const targetChat = chatMap.get(chatKey)

  if (targetChat) {
    const encryptedChatName = encryptData(chatKey)
    updateChatItem(db, encryptedChatName.toString(), encryptData(JSON.stringify(targetChat)))
  }

  return lastChatUpdateTime
}

export default function storeData () {
  return store => {
    let mainStorage = window.sessionStorage
    if (mainStorage.getItem('language')) {
      store.commit('change_lang', mainStorage.getItem('language'))
    }
    if (mainStorage.getItem('notify_sound')) {
      store.commit('change_notify_sound', mainStorage.getItem('notify_sound'))
    }
    if (mainStorage.getItem('send_on_enter')) {
      store.commit('change_send_on_enter', mainStorage.getItem('send_on_enter'))
    }
    if (mainStorage.getItem('notify_bar')) {
      store.commit('change_notify_bar', mainStorage.getItem('notify_bar'))
    }
    if (mainStorage.getItem('notify_desktop')) {
      store.commit('change_notify_desktop', mainStorage.getItem('notify_desktop'))
    }

    if (mainStorage.getItem('nodes')) {
      try {
        const nodes = JSON.parse(mainStorage.getItem('nodes'))
        store.dispatch('nodes/restore', nodes)
      } catch (e) { }
    }

    let storeInLocalStorage = mainStorage.getItem('storeInLocalStorage')
    if (storeInLocalStorage === 'false') {
      storeInLocalStorage = false
    }
    if (storeInLocalStorage) {
      store.commit('change_storage_method', storeInLocalStorage)
    }
    let useStorage = window.sessionStorage
    let value = useStorage.getItem('adm-persist')
    if (value !== 'undefined') {
      if (value) {
        value = JSON.parse(value)
        delete value.areChatsLoading // for users who already have this property
      }
    }
    if (typeof value === 'object' && value !== null) {
      store.replaceState(merge(store.state, value, {
        arrayMerge: function (store, saved) { return saved },
        clone: false
      }))
      store.commit('mock_messages')
      store.dispatch('rehydrate')
      window.onbeforeunload = function () {
        store.commit('force_update')
      }
    } else {
      if (store.getters.isLoginViaPassword) {
        getAdmDataBase().then((db) => {
          let restoredStore = {}
          getCommonItem(db).then((encryptedCommonItem) => {
            restoredStore = JSON.parse(decryptData(encryptedCommonItem.value))
            getPassPhrase(db).then((encryptedPassPhrase) => {
              restoredStore = {
                ...restoredStore,
                passPhrase: decryptData(encryptedPassPhrase.value)
              }
              getContactItem(db).then((encryptedContacts) => {
                restoredStore = {
                  ...restoredStore,
                  partners: JSON.parse(decryptData(encryptedContacts.value))
                }
                let chats = {}
                getChatItem(db).then((encryptedChats) => {
                  encryptedChats.forEach((chat) => {
                    const decryptedChatName = decryptData(new Uint8Array(chat.name.split(',')))
                    chats[decryptedChatName] = JSON.parse(decryptData(chat.value))
                    restoredStore = {
                      ...restoredStore,
                      chats: chats
                    }
                  })
                  store.replaceState(merge(store.state, restoredStore, {
                    arrayMerge: function (store, saved) { return saved },
                    clone: false
                  }))
                  store.dispatch('rehydrate')
                  window.onbeforeunload = function () {
                    store.commit('force_update')
                  }
                })
              })
            })
          })
        })
      }
    }
    let lastChatUpdateTime = 0
    let lastChatHeight = store.getters.getLastChatHeight
    store.subscribe((mutation, state) => {
      if (sessionStorage.getItem('storeInLocalStorage') === 'true' && sessionStorage.getItem('userPassword')) {
        getAdmDataBase().then((db) => {
          let copyState = Object.assign({}, state)
          if (mutation.type === 'partners/contactList') {
            // Save contacts
            const contacts = copyState.partners
            updateContactItem(db, encryptData(JSON.stringify(contacts)))
          }
          if (mutation.type === 'add_chat_message') {
            // Save chats
            if (lastChatHeight === 0) {
              if (lastChatUpdateTime > 0 && new Date().getTime() - lastChatUpdateTime > 1000) {
                lastChatUpdateTime = updateChat(lastChatUpdateTime, copyState, mutation, store, db)
                lastChatHeight = store.getters.getLastChatHeight
              } else {
                lastChatUpdateTime = new Date().getTime()
              }
            } else {
              if (lastChatHeight !== store.getters.getLastChatHeight) {
                lastChatUpdateTime = updateChat(lastChatUpdateTime, copyState, mutation, store, db)
                lastChatHeight = store.getters.getLastChatHeight
              }
            }
          }
          let storeNow = false
          if (mutation.type === 'change_lang') {
            storeNow = true
          } else if (mutation.type === 'change_notify_sound') {
            storeNow = true
          } else if (mutation.type === 'change_notify_bar') {
            storeNow = true
          } else if (mutation.type === 'change_notify_desktop') {
            storeNow = true
          } else if (mutation.type === 'change_send_on_enter') {
            storeNow = true
          } else if (mutation.type === 'logout') {
            storeNow = true
          } else if (mutation.type === 'save_passphrase') {
            storeNow = true
          } else if (mutation.type === 'force_update') {
            storeNow = true
          } else if (mutation.type === 'change_partner_name') {
            storeNow = true
          } else if (mutation.type === 'leave_chat') {
            storeNow = true
          } else if (mutation.type === 'ajax_start' || mutation.type === 'ajax_end' || mutation.type === 'ajax_end_with_error' || mutation.type === 'start_tracking_new' || mutation.type === 'have_loaded_chats' || mutation.type === 'connect' || mutation.type === 'login') {
            return
          }
          if (storeNow && sessionStorage.getItem('userPassword') && copyState.passPhrase) {
            // Exclude contact list, chats, passphrase from common store
            delete copyState.partners
            delete copyState.chats
            delete copyState.passPhrase
            updateCommonItem(db, encryptData(JSON.stringify(copyState)))
          }
        })
      } else {
        let storeNow = false
        if (mutation.type === 'change_storage_method') {
          if (!mutation.payload) {
            const clonedState = cloneDeep(state)
            delete clonedState.areChatsLoading
            useStorage = sessionStorage.setItem('adm-persist', JSON.stringify(clonedState))
          }
          try {
            mainStorage.setItem('storeInLocalStorage', mutation.payload)
          } catch (e) {
          }
          storeNow = true
        } else if (mutation.type === 'change_lang') {
          mainStorage.setItem('language', mutation.payload)
          storeNow = true
        } else if (mutation.type === 'change_notify_sound') {
          mainStorage.setItem('notify_sound', mutation.payload)
          storeNow = true
        } else if (mutation.type === 'change_notify_bar') {
          mainStorage.setItem('notify_bar', mutation.payload)
          storeNow = true
        } else if (mutation.type === 'change_notify_desktop') {
          mainStorage.setItem('notify_desktop', mutation.payload)
          storeNow = true
        } else if (mutation.type === 'change_send_on_enter') {
          mainStorage.setItem('send_on_enter', mutation.payload)
          storeNow = true
        } else if (mutation.type === 'nodes/useFastest' || mutation.type === 'nodes/toggle') {
          mainStorage.setItem('nodes', JSON.stringify(state.nodes))
          storeNow = true
        }

        if (mutation.type === 'logout') {
          storeNow = true
        }
        if (mutation.type === 'save_passphrase') {
          storeNow = true
        }
        if (mutation.type === 'force_update') {
          storeNow = true
        }
        if (mutation.type === 'change_partner_name') {
          storeNow = true
        }
        if (mutation.type === 'leave_chat') {
          storeNow = true
        }
        if (mutation.type === 'ajax_start' || mutation.type === 'ajax_end' || mutation.type === 'ajax_end_with_error' || mutation.type === 'start_tracking_new' || mutation.type === 'have_loaded_chats' || mutation.type === 'connect' || mutation.type === 'login' || mutation.type === 'chatsLoading') {
          return
        }
        if (storeNow) {
          try {
            const clonedState = cloneDeep(state)
            delete clonedState.areChatsLoading
            useStorage.setItem('adm-persist', JSON.stringify(clonedState))
          } catch (e) {
          }
        } else {
          if (window.storeTimer) {
            window.clearTimeout(window.storeTimer)
          }
          var storeTimer = window.setTimeout(function () {
            store.commit('force_update')
            window.storeTimer = undefined
          }, 10000)
          window.storeTimer = storeTimer
        }
      }
    })
  }
}
