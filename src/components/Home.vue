<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message({
        message: '成功退出',
        type: 'success'
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
