<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- table区域 -->
      <el-table :data="ordersList" border stripe="">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showCity"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagennum" :page-sizes="[10, 15, 20, 30]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="this.total">
      </el-pagination>
    </el-card>

    <!-- city的对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="citys" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- ProgressBox 对话框 -->
    <el-dialog title="物流信息" :visible.sync="ProgressBoxDialogVisible" width="50%">
      <el-timeline reverse="true">
        <el-timeline-item v-for="(progressItem, i) in progressInfo" :key="i" :timestamp="progressItem.time">
          {{progressItem.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 由于不需要三级 选择器
// import citys from './citys'
// 这里需求使用二级城市联动
import citys from './citydata'
// 导入物流数据
import OrderData from './orderData'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      ordersList: [],
      // 总页数
      total: 0,
      // 控制city对话框
      addressVisible: false,
      // city表单的验证规则
      addressFormRules: {
        address1: [{
          required: true,
          message: '请选择省市区/县',
          trigger: 'blur'
        }],
        address2: [{
          required: true,
          message: '请填写详细地址',
          trigger: 'blur'
        }]
      },
      addressForm: {
        address1: [],
        address2: ''
      },
      // 省市区  二级联动 data
      citys,
      // ProgressBox控制对话框
      ProgressBoxDialogVisible: false,
      progressInfo: [],
      OrderData
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList () {
      const {
        data: res
      } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.total = res.data.total
      this.ordersList = res.data.goods
    },
    // 每页条数的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 当前页数
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 控制city对话框的显示与隐藏
    showCity () {
      this.addressVisible = true
    },
    // 取消city对话框 对内容进行重置
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 控制ProgressBox的显示与隐藏
    async showProgressBox () {
      // 接口有问题用模拟的数据进行
      // const { data: res } = await this.$http.get('/kuaidi/123456')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流进度失败！')
      // }
      this.progressInfo = OrderData.data
      console.log(this.progressInfo)

      this.ProgressBoxDialogVisible = true
    }
  }
}

</script>

<style lang="less" scoped>

</style>
