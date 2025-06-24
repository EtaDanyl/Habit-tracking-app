import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'

const routes = [
  {
    path: '/day/:date?',
    name: 'MainView',
    component: MainView,
  },
  {
    path: '/:catchAll(.*)',
    redirect: () => {
      const today = new Date().toISOString().slice(0, 10)
      return `/day/${today}`
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
