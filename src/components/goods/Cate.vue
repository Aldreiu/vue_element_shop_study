<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCaeDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <!-- 使用 vue-table-with-tree-grid -->
    <!-- 表格 -->
    <tree-table :data="catelist" :columns="columns" show-index index-text="#" border :selection-type="false" :expand-type="false" class="tree_table">
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
        <i class="el-icon-error" style="color:red;" v-else></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
        <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
        <el-tag type="warning" size="mini" v-else>三级</el-tag>
      </template>
      <!-- 操作 -->
      <template slot="option" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiaolog(scope.row.cat_id)">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="delectEditDiaolog(scope.row.cat_id)">删除</el-button>
      </template>
    </tree-table>

    <!-- 分页区域 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryinfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryinfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>

    <!-- 添加分类对话框 -->
<el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="45%">
  <el-form :model="addCateForm" :rules="addCateRules" ref="cateRuleForm" label-width="100px">
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类：">
    <el-cascader
    v-model="selectedOptons"
    :options="parentCateList"
    :props="cascaderProps"
    @change="parentCateChanged"
    ></el-cascader>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>

<!-- 编辑对话框 -->
<el-dialog
  title="编辑分类"
  :visible.sync="editDialogVisible"
  width="45%">
  <el-form :model="editForm" :rules="editRules" ref="editFormRule" label-width="100px" class="demo-ruleForm">
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="editForm.cat_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数量
      total: 0,
      // table指定以类
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 控制添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 添加的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级 默认添加一级分类
        cat_level: 0
      },
      // 对话框分类预验证
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中父级分类的id数组
      selectedOptons: [],
      // 控制编辑对话框 显示隐藏
      editDialogVisible: false,
      // 查询到的分类id
      editForm: {},
      // 编辑对话框 预验证规则
      editRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryinfo })
      // console.log(res)

      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类列表失败！')
      }
      // console.log(res.data)
      // 数据列表
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize数据
    handleSizeChange (newSize) {
      this.queryinfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值的变化 pagenum
    handleCurrentChange (newPage) {
      this.queryinfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮 显示添加分类对话框
    showAddCaeDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      console.log(res)
      this.parentCateList = res.data
    },
    // 获取父级分类的数据节点
    parentCateChanged () {
      // console.log(this.selectedOptons)
      // 判断父级分类的数组是否为0 如果为0给默认值
      if (this.selectedOptons.length > 0) {
        // 分类的id
        this.addCateForm.cat_pid = this.selectedOptons[this.selectedOptons.length - 1]
        // 分类的等级
        this.addCateForm.cat_level = this.selectedOptons.length
      } else {
        // 如果要添加1级分类，则父分类Id应该设置为  `0` 0表示一级分类
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.cateRuleForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 清空分类对话框  级联选择框的数组
    addCateDialogClose () {
      // 这里只清除重置了 name  级联选择框并没有删除
      this.$refs.addFormRef.resetFields()
      // 清除级联了选择框  并把 addFrom的数据重置
      this.selectedOptons = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 控制编辑对话框 并获取数据
    async showEditDiaolog (id) {
      console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改对话框信息
    editCateInfo () {
      this.$refs.editFormRule.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, {
          cat_name: this.editForm.cat_name
        })
        console.log(res)

        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 更新数据列表
        this.getCateList()
        // 提示成功
        this.$message.success('更新分类成功！')
      })
    },
    // 删除分类
    delectEditDiaolog (id) {
      // console.log(id)
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }
        this.getCateList()
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
    }

  }
}
</script>

<style lang="less" scoped>

</style>
