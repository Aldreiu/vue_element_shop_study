<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="ParamsRowCascader">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类级联选择器 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            class="ParamsCascader"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页面区域 -->
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
      >
        <!-- 动态参数面板 -->
        <el-tab-pane
          label="动态参数"
          name="many"
        >
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table
            :data="manyTableData"
            border
            stripe
          >
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  class="Params_tag"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="DelEditDialog(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数面板 -->
        <el-tab-pane
          label="静态参数"
          name="only"
        >
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table
            :data="onlyTableData"
            border
            stripe
          >
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  class="Params_tag"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="DelEditDialog(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="45%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="titleText"
          prop="attr_name"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addParams"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'编辑'+titleText"
      :visible.sync="editDialogVisible"
      width="45%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="titleText"
          prop="attr_name"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editParams"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取的商品分类数据列表
      cateList: [],
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 控制tab被激活
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 控制add的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制好edit的显示与隐藏
      editDialogVisible: false,
      // 编辑参数的表单数据对象
      editForm: {},
      // 添加表单验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
      // // 控制tag输入框的显示隐藏
      // inputVisible: false,
      // // tag输入框的内容 双向绑定
      // inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择框中项的变化 而出发此函数
    async handleChange () {
      this.getParamsData()
    },
    // tab的点击事件
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 首先判断是不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.selectedCateKeys)
      // 根据分类的id 和当前面板的值  来获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败!')
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本宽的显示隐藏
        item.inputVisible = false
        // 文本输入双向绑定
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听关闭添加对话框
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功!')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 通过查询编辑对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败！')
      }
      // console.log(res)
      this.editForm = res.data

      this.editDialogVisible = true
      // console.log(id)
    },
    // 重置表单数据
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮编辑参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑参数失败！')
        }
        this.$message.success('编辑成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 点击按钮删除参数
    DelEditDialog (id) {
      console.log(id)
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        this.getParamsData()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 文本失去焦点 键盘抬起 enter都会触发
    async handleInputConfirm (row) {
      // console.log('ok')
      console.log(row)

      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }
      // 如果没有return 后续继续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 修改atr Valas 并保存数据库
    async saveAttrVals (row) {
      // 发请求保存数据
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    // 点击按钮展示输入文本
    showInput (row) {
      row.inputVisible = true
      // $nextTick方法作用 就是当页面上元素被重新渲染，才会指定回调函数的中的代码
      this.$nextTick(_ => {
        // 获取input输入框的焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数和选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用 则返回true 否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态参数'
    }
  }
}
</script>

<style lang="less" scoped>
</style>
