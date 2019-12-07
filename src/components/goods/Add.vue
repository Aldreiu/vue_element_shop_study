<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center>
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
      <el-form ref="addFromRef" :model="addFrom" :rules="addFromRules" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model="addFrom.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input v-model="addFrom.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="addFrom.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input v-model="addFrom.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addFrom.goods_cat" :options="catelist" :props="cateProps" @change="handleChange"
                class="addGoods"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload class="upload-demo" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
              :headers="headersObj" :on-error="headerError" :on-success="handleSuccess" list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addFrom.goods_introduce" ref="myQuillEditor">
            </quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">提交按钮</el-button>
          </el-tab-pane>
          <!-- <el-tab-pane label="完成" name="5">完成</el-tab-pane> -->
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="45%">
      <img :src="previewPath" class="previewImg" alt="">

    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addFrom: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        // 图片的数组
        pics: [

        ],
        // 介绍 富文本区域
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 添加表单的验证规则
      addFromRules: {
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
      // 商品分类列表
      catelist: [],
      // 级联选择器的配置项
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数
      manyTableData: [],
      // 静态参数
      onlyTableData: [],
      // 上传图片地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 拿到TOKEN
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片地址
      previewPath: '',
      // 控制图片对话框
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const {
        data: res
      } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data

      console.log(this.catelist)
    },
    // 级联选择器选中项变化 就触发此函数
    handleChange () {
      console.log(this.addFrom.goods_cat)
      if (this.addFrom.goods_cat.length !== 3) {
        this.addFrom.goods_cat = []
      }
    },
    // 切换tab的的钩子函数
    beforeTabLeave (activeName, oldActiveName) {
      // console.log(activeName)
      // console.log(oldActiveName)
      if (oldActiveName === '0' && this.addFrom.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // tab选中触发
    async tabClicked () {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cataId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        console.log(res.data)
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cataId}/attributes`, {
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
    // 处理图片预览的相关
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理图片操作
    handleRemove (file) {
      // 获取删除图片的临时路径
      // 从pics数组中找到对应的图片的索引值
      // 使用splice方法删除
      console.log(file)
      const filePath = file.response.data.tmp_path
      const i = this.addFrom.pics.findIndex(x => x.pic === filePath)
      console.log(i)
      this.addFrom.pics.splice(i, 1)
      console.log(this.addFrom)
    },
    handleSuccess (response) {
      console.log(response)
      // 先拼接衣蛾图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 将图片信息对象 push到 pics数组中
      this.addFrom.pics.push(picInfo)
      console.log(this.addFrom)

      this.$message.success('上传成功！')
    },
    headerError (err) {
      console.log(err)
      this.$message.error('上传失败！')
    },
    add () {
      console.log(this.addFrom)
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 深拷贝处理  双向绑定的 goods_cat
        // 序列化反序列化法 这种方式以智能用在 对象和数组 其他会失真
        // 还有一种方式  lodash
        // 这里是使用序列化反序列化法
        // const formStr = JSON.parse(JSON.stringify(this.addFrom))
        // formStr.goods_cat = formStr.goods_cat.join(',')

        // 使用 lodash 进行深拷贝  _.cloneDeep
        const formStr = _.cloneDeep(this.addFrom)
        formStr.goods_cat = formStr.goods_cat.join(',')
        console.log(formStr)

        // 处理动态和静态的参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addFrom.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addFrom.attrs.push(newInfo)
        })
        formStr.attrs = this.addFrom.attrs
        console.log(formStr)
        // 发起请求添加商品
        // 商品名称必须唯一
        const { data: res } = await this.$http.post('goods', formStr)
        if (res.meta.status !== 201) {
          this.$message.error('添加失败！')
        }
        this.$message.success('添加成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cataId () {
      if (this.addFrom.goods_cat.length === 3) {
        return this.addFrom.goods_cat[2]
      }
      return null
    }
  }
}

</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 5px 2px 0 !important;
  }

  .previewImg {
    width: 100%;
  }
  .btnAdd{
    margin-top: 15px;
  }

</style>
