import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  // 弹框提示
  Message
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Form)
Vue.use(Input)
// 全局挂载
Vue.prototype.$message = Message
