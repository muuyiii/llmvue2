import Vue from 'vue'
import Router from 'vue-router'
import ChatInterface from '@/views/ChatInterface'
import AgentSelection from '@/views/AgentSelection'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ChatInterface',
      component: ChatInterface
    },
    {
      path: '/agent-selection',
      name: 'AgentSelection',
      component: AgentSelection
    }
  ]
}) 