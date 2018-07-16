import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Chats from '@/components/Chats'
import Chat from '@/components/Chat'
import Transfer from '@/components/Transfer'
import Transaction from '@/components/transactions/Transaction'
import Transactions from '@/components/Transactions'
import Options from '@/components/Options'
import Home from '@/components/Home'
import QRScan from '@/components/QRScan'
import Votes from '@/components/Votes'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/votes', name: 'Votes', component: Votes },
    {
      path: '/transactions/:crypto/:tx_id',
      component: Transaction,
      name: 'Transaction',
      props: true
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions
    },
    {
      path: '/scan',
      name: 'QRScanner',
      component: QRScan
    },
    {
      path: '/options',
      name: 'Options',
      component: Options
    },
    {
      path: '/chats/:partner/',
      component: Chat,
      name: 'Chat'
    },
    {
      path: '/chats',
      name: 'Chats',
      component: Chats
    },
    {
      path: '/transfer/:fixedCrypto?/:fixedAddress?',
      name: 'Transfer',
      component: Transfer,
      props: true
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/',
      name: 'Login',
      component: Login
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
