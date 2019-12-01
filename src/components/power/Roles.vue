<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-button
          type="primary"
          @click="addRolesDialogVisible=true"
        >添加角色</el-button>
      </el-row>
      <el-table
        :data="rolelist"
        border
        stripe
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['roles_bottom_border',index1===0?'roles_top_border':'','row_style_center'] "
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 ===0? '':'roles_top_border','row_style_center']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="角色名称"
          prop="roleName"
        ></el-table-column>
        <el-table-column
          label="角色描述"
          prop="roleDesc"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="300px"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="setRightDialogVisible"
      width="45%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightslist"
        :props="treeProps"
        node-key="id"
        default-expand-all
        show-checkbox
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="alloRights"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色 "
      :visible.sync="addRolesDialogVisible"
      width="45%"
    >
      <el-form
        :model="rulesForm"
        :rules="addrulesFrom"
        ref="addRulesFormRef"
        label-width="100px"
      >
        <el-form-item
          label="角色名称:"
          prop="roleName"
        >
          <el-input v-model="rulesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          label="角色描述:"
        >
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="rulesForm.roleDesc"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addRoles"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色编辑对话框 -->
    <el-dialog
  title="重新编辑角色"
  :visible.sync="EditRolesDialogVisible"
  width="45%">
  <el-form
        :model="editForm"
        :rules="editRulesFrom"
        ref="editRulesFormRef"
        label-width="100px"
      >
        <el-form-item
          label="角色名称:"
          prop="roleName"
        >
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          label="角色描述:"
        >
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="editForm.roleDesc"
          >
          </el-input>
        </el-form-item>
      </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="EditRolesDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCommit">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取所有的角色列表数据
      rolelist: [],
      // 所有权限数据
      rightslist: [],
      // 控制权限数据对话框
      setRightDialogVisible: false,
      // 树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的id
      roleId: '',
      // 控制添加角色对话框
      addRolesDialogVisible: false,
      // 添加角色
      rulesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addrulesFrom: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 控制编辑对话框
      EditRolesDialogVisible: false,
      // 查询的角色对象
      editForm: {},
      // 修改表单的规则对象
      editRulesFrom: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const {
        data: res
      } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表数据失败！')
      }
      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 根据id删除对应的权限
    removeRightById (role, rightId) {
      // 弹框提示用户是否删除权限
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async (success) => {
        const {
          data: res
        } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        // 成功之后不要用 重新发请求刷新 不嫩保持展开  只需要把 数据更新
        role.children = res.data
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        console.log(success + '删除成功')
      }).catch((err) => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        console.log(err + '取消删除')
      })
    },
    // 展示分配权限对话框
    async showSetRightDialog (role) {
      // 获取当前权限的id
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 把获取的数据保存到data中
      this.rightslist = res.data
      console.log(this.rightslist)
      console.log(role)

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id 并保存到defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当亲node节点不包含children树形 则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限的对话框关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击分配权限
    async alloRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加角色
    addRoles () {
      this.$refs.addRulesFormRef.validate(async valid => {
        if (!valid) return
        // 预校验成功开始发请求
        const { data: res } = await this.$http.post('roles', this.rulesForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        // 隐藏对话框
        this.addRolesDialogVisible = false
        // 发送请求刷新页面
        this.getRolesList()
      })
    },
    // 删除角色
    removeRolesById (id) {
      console.log(id)
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        }
        )
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败！')
        }
        this.getRolesList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 展示编辑角色对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询角色信息失败！')
      }
      this.editForm = res.data
      this.EditRolesDialogVisible = true
    },
    // 提交编辑角色
    editCommit () {
      this.$refs.editRulesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败！')
        }
        // 获取成功关闭对话框
        this.EditRolesDialogVisible = false
        // 刷新数据
        this.getRolesList()
        // 弹框成功
        this.$message.success('更新数据成功！')
      })
    }
  }
}

</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.roles_top_border {
  border-top: 1px solid #ccc;
}

.roles_bottom_border {
  border-bottom: 1px solid #ccc;
}
</style>
