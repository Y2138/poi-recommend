import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'Home',
    // component: () => import('@/views/home'),
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home'),
  },
  
]

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes
})