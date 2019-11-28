<template>
  <div class="welcome_contain">
      <img src="../assets/image/u=369210855,806405341&fm=214&gp=0.jpg" alt="">
      <div class="welcome_text">Hello World!</div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.welcome_contain{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img{
    width: 180px;
    height: 180px;
    margin-bottom: 40px;
    margin-top: 50px;
  }
  .welcome_text{
    text-align: center;
    font-size: 35px;
    color: rgb(212, 101, 129);
  }
}
</style>
