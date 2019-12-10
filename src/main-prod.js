import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './plugins/element.js'
// 引入全局的css
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'
// 导入 NProgresss toploading的js和css
import Nprogress from 'nprogress'
// import 'nprogress/nprogress.css'

// 配置請求的根路徑
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 拦截器
axios.interceptors.request.use(config => {
  // 在request 拦截器中 展示进度条  Nprogress.start()
  Nprogress.start()
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return config
  return config
})
// 在reponse 拦截器中 隐藏进度条  Nprogress.done()
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
