<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img
          src="../assets/image/121953146867.gif"
          alt
        />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
        @submit.native.prevent
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user-solid"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"
            v-model="loginForm.password"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button
            @click="login"
            class="primary_bg_l"
            type="primary"
            native-type="submit"
            :loading="loading.lodingtf"
          >{{loading.loadingname}}</el-button>
          <el-button
            @click="resetLoginForm"
            class="primary_bg_r"
            type="info"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入合法用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入正确密码', trigger: 'blur' },
          { min: 3, max: 15, message: '密碼长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      },
      // loading 防止用户多次触发提交
      loading: {
        lodingtf: false,
        loadingname: '登录'
      }
    }
  },
  methods: {
    // 点击重置按钮 重置表单
    resetLoginForm () {
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 登录 提交表单的预验证
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        this.loading.lodingtf = true
        this.loading.loadingname = '登录中'
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          this.loading.lodingtf = false
          this.loading.loadingname = '登录'
          this.$message.error('登录失败,请输入正确账号和密码')
          return
        }
        this.$message({
          message: '登陆成功',
          type: 'success'
        })
        // 1. 将登录成功之后的token，保存到客户端的 sessionStorage会话机制中 local是持久机制
        //     1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
        //     1.2 token 只应在当前网站打开期间生效，所以讲token保存在 sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
        // 2.通过编程时导航跳转到后台主页
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: rgba(17, 16, 16, 0.2);
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: rgba(230, 238, 232, 0.5);
  box-shadow: black 0px 0px 8px;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  &:hover {
    box-shadow: black 0px 0px 50px;
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    align-items: center;
    justify-content: center;

    .primary_bg_l {
      opacity: 0.8;
      margin-right: 30px;
    }

    .primary_bg_r {
      margin-left: 30px;
    }
  }

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #ccc;
    border-radius: 50%;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -30%);

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;

      &:hover {
        box-shadow: black 0px 0px 50px;
      }
    }
  }
}
</style>
