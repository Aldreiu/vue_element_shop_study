import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
// 引入全局的css
import './assets/css/global.css'
import axios from 'axios'

// 配置請求的根路徑
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 拦截器
axios.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
