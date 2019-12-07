<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="编辑商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab标签 -->
      <el-form ref="editFromRef" :model="editFrom" :rules="editFromRules" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeLeaveTab" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model="editFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input v-model="editFrom.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="editFrom.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input type="number" v-model="editFrom.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="editFrom.goods_cat" :options="catelist" :props="cataProps" @change="handleChange"
                disabled class="el-cascader-w"></el-cascader>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border disabled></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals" disabled></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload class="upload-demo" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
              list-type="picture" :file-list="fileList" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="editFrom.goods_introduce" ref="myQuillEditor">
            </quill-editor>
            <el-button type="primary" class="btnedit" @click="edit">提交按钮</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="45%">
      <img :src="previewPath" alt="" class="imgPreview">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '0',
      // 编辑的表单对象
      editFrom: {

      },
      // 商品分类列表
      catelist: [],
      // 级联选择器的配置项
      cataProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 编辑表单对象的验证规则
      editFromRules: {
        goods_name: [{
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        }],
        goods_price: [{
          required: true,
          message: '请输入商品价格',
          trigger: 'blur'
        }],
        goods_weight: [{
          required: true,
          message: '请输入商品重量',
          trigger: 'blur'
        }],
        goods_number: [{
          required: true,
          message: '请输入商品数量',
          trigger: 'blur'
        }],
        goods_cat: [{
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }]
      },
      // 动态参数列表
      manyTableData: [],
      // 静态参数列表
      onlyTableData: [],
      // 上传图片地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 拿到TOKEN
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 用于显示图片
      fileList: [],
      // 控制图片对话框
      previewDialogVisible: false,
      // 图片地址
      previewPath: ''
    }
  },
  created () {
    this.getEditlist()
    this.getCatelist()
  },
  methods: {
    // 根据商品id 获取编辑数据列表
    async getEditlist () {
      const {
        data: res
      } = await this.$http.get('goods/' + this.$route.params.goods_id)
      console.log(res)
      // 因为得到的值是 String 通过split变成 数组 但是值的类型是不Number 在同map遍历数组 通过Number转换成 number类型
      res.data.goods_cat = res.data.goods_cat.split(',').map(i => Number(i))
      res.data.pics.forEach(item => {
        const newPic = {
          name: item.pics_id,
          url: item.pics_big_url
        }
        this.fileList.push(newPic)
      })
      console.log(this.fileList)

      this.editFrom = res.data
      console.log(this.editFrom)
    },
    async getCatelist () {
      const {
        data: res
      } = await this.$http.get('categories')

      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中项  选中触发  这里控制 稚嫩选择第三级
    handleChange () {
      console.log(this.editFrom.goods_cat)
      if (this.editFrom.goods_cat.length !== 3) {
        this.editFrom.goods_cat = 0
      }
    },
    // 阻止tab默认切换
    beforeLeaveTab (activeName, oldActiveName) {
      // 这个没必要 需求不需要这一项提供显示就行
      if (oldActiveName === '0' && this.editFrom.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类！')
        return false
      }
    },
    // 切换触发对应的参数列表
    async tabClicked () {
      if (this.activeIndex === '1') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        // console.log(res)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        console.log(res.data)
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数列表失败！')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 图片的预览
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.url
      this.previewDialogVisible = true
    },
    // 图片的删除
    handleRemove (file) {
      console.log(file)
      const filePath = file.url
      const i = this.editFrom.pics.findIndex(x => x.pics_big_url === filePath)
      this.editFrom.pics.splice(i, 1)
      console.log(i)
      console.log(this.editFrom)
    },
    handleSuccess (response) {
      console.log(response)
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.editFrom.pics.push(picInfo)
      console.log(this.editFrom)

      this.$message.success('上传成功！')
    },
    edit () {
      console.log(this.editFrom)

      this.$refs.editFromRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        this.editFrom.attrs = []
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.editFrom.attrs.push(newInfo)
        })

        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          // this.editFrom.attrs = []
          this.editFrom.attrs.push(newInfo)
        })
        // this.editFrom.pics = []
        console.log(this.editFrom)
        const formStr = {}
        formStr.goods_name = this.editFrom.goods_name
        formStr.goods_price = this.editFrom.goods_price
        formStr.goods_cat = this.editFrom.goods_cat
        formStr.goods_number = this.editFrom.goods_number
        formStr.goods_weight = this.editFrom.goods_weight
        formStr.goods_introduce = this.editFrom.goods_introduce
        formStr.pics = this.editFrom.pics
        formStr.attrs = this.editFrom.attrs
        console.log(formStr)

        const { data: res } = await this.$http.put('goods/' + this.$route.params.goods_id, formStr)
        if (res.meta.status !== 201) {
          return this.$message.error('编辑失败！')
        }
        this.$message.success('编辑成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.editFrom.goods_cat.length === 3) {
        return this.editFrom.goods_cat[2]
      }
      return null
    }
  }
}

</script>

<style lang="less" scoped>
  .el-cascader-w {
    width: 200px;
  }
  .imgPreview{
    margin-left: 50%;
    transform: translateX(-50%)
  }

</style>
