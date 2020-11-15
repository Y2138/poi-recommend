import Vue from 'vue'
import App from './App.vue'
import 'element-ui/lib/theme-chalk/index.css'
/**导入elementUI */
import Element from 'element-ui'
/**导入全局方法 */
import fetch from '@/api/axios.js'


Vue.use(fetch)
Vue.use(Element, {
  size: 'small',
})


/**导入router */
import router from '@/router/index'

/**导入Vuex */
import store from '@/store/index'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
