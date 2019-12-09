<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img
          src="../assets/image/Snipaste_2019-11-25_21-53-05.png"
          alt=""
        >
        <span>Aldreiu(亚尔德勒尤)后台管理系统</span>
      </div>
      <el-button
        type="info"
        @click="logout"
      >退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'':'200px'">
        <!-- 折叠键 -->
        <div
          class="toggle-button"
          @click="toggleCollapse"
        >
          <i
            :class="[this.isCollapse?'el-icon-s-unfold':'el-icon-s-fold']"
            class="toggle-icon"
          ></i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          :collapse="isCollapse"
          :collapse-transition="false"
          class="el-aside-menu"
          unique-opened
          router
          :default-active="activePath"
          text-color="#fff"
          active-text-color="rgb(0, 161, 214)"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id+''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template
              slot="title"
              class="el-submenu-hover"
            >
              <!-- 图标 -->
              <i :class="item.icon"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template
                slot="title"
                class="el-submenu-hover"
              >
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主题体-->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      // 左侧一级菜单图标 存放
      menuOneIcon: [
        // 还有一种方法通过   里面的id  组成数组  例如 '12':'el-icon-s-custom'  class里面传id就可以获得图标样式了
        'el-icon-s-custom',
        'el-icon-suitcase',
        'el-icon-s-goods',
        'el-icon-s-order',
        'el-icon-s-marketing'
      ],
      // 折叠的判断属性
      isCollapse: false,
      // 激活连接地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
    this.deleteNabState()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message({
        message: '成功退出',
        type: 'success'
      })
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
      // 添加icon
      this.setIcon()
    },
    // 通过icon的数组 给每一个菜单里面添加 icon图标
    setIcon () {
      this.menulist.forEach((item, index) => {
        item.icon = this.menuOneIcon[index]
      })
    },
    // 侧边栏折叠效果
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    },
    // 当是首页时删除激活状态
    deleteNabState () {
      if (this.$route.path === '/welcome' || this.$route.path === '/') {
        window.sessionStorage.removeItem('activePath')
      }
      console.log(this.$route.path)
    }
  },
  watch: {
    $route (to, from) {
      console.log(to.path)
      if (to.path === '/welcome' || to.path === '/') {
        window.sessionStorage.removeItem('activePath')
      }
    }
  }
}
</script>

<style lang="less">
.home-container {
  height: 100%;
}
.el-header {
  border-color: #2b2929;
  box-shadow: 0px 0px 8px black;
  -webkit-box-shadow: 0px 0px 8px black;
  background-color: rgba(10, 10, 0, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    img {
      height: 100%;
      margin-right: 30px;
    }
    color: #eaecf0;
  }
}
.el-aside {
  .page_color1();
}
.el-main {
  background-color: rgba(248, 244, 244, 0.699);
  box-shadow: black 0px 0px 8px;
  border-radius: 10px;
}
.el-aside-menu {
  .page_color1();
  .el-menu-item {
    &:hover {
      background-color: rgba(250, 250, 244, 0.5);
    }
  }
}
.el-menu {
  background-color: rgba(255, 255, 255, 0) !important;
  border-right: none !important;
}
.el-menu-item {
  background-color: rgba(48, 48, 45, 0.5) !important;
}
.el-menu-item:focus,
.el-menu-item:hover {
  outline: 0;
  background-color: rgba(250, 250, 244, 0.5) !important;
}
.el-submenu__title:hover {
  background-color: rgba(250, 250, 244, 0.5) !important;
}

.el-submenu__title:focus,
.el-submenu__title:hover {
  outline: 0 !important;
  color: #fff !important;
  background-color: rgba(250, 250, 244, 0.2) !important;
}

.toggle-button {
  display: flex;
  justify-content: center;
  align-items: center;
  border-color: #2b2929;
  box-shadow: 0px 0px 8px black;
  -webkit-box-shadow: 0px 0px 8px black;
  background-color: rgba(10, 10, 0, 0.7);
  &:hover {
    background-color: rgba(15, 15, 15, 0.966);
    box-shadow: 0px 0px 50px black;
  }
  cursor: pointer;
  .toggle-icon {
    padding: 10px;
    color: #f7faff;
  }
}

// less 复用类集合
.page_color1() {
  border-color: #2b2929;
  box-shadow: 0px 0px 8px black;
  -webkit-box-shadow: 0px 0px 8px black;
  background-color: rgba(10, 10, 0, 0.7);
}
</style>
