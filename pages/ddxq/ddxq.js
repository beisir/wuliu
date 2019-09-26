// pages/ ddxq/ ddxq.js
// 订单详情

import {
  pageFillter
} from '../../utils/pageFillter.js';

const app = getApp()

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    url: ['/wxlogistics/smallpro/order/orderDetail.html', '/wxlogistics/smallpro/order/cancelOrder.html'], // 请求接口
    renderData: null, // 页面渲染数据
    orderId: null, // 订单id
    rebateTypeDic: {
      '0': '促销折扣',
      '1': '新用户尊享',
      '2': '限时折扣',
      '3': '促销活动',
    },
    cancelReason: [ // 撤销订单原因
      '物流公司长时间不受理',
      '实际价格高于网上报价',
      '提送货费太高',
      '物流公司取件不及时',
      '已找其他物流公司发货',
      '因自己原因放弃发货',
      '物流公司拒收',
      '其他'
    ],
    cancelIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(opts) {
    app.http.request({
      url: this.data.url[0],
      data: {
        ...opts
      }
    }).then(res => {
      if (res && res.flag) {
        this.setData({
          renderData: res.value,
          orderId: opts.orderId
        })
      }
    })
  },

  /**
   * 撤销订单
   */
  cancelOrder(e) {
    app.http.request({
      url: this.data.url[1],
      data: {
        orderId: this.data.orderId,
        cancelReason: this.data.cancelReason[e.detail.value]
      }
    }).then(res => {
      if(res.value) wx.redirectTo({
        url: '../my_dd_fhjl/my_dd_fhjl?title=我的订单',
      })
      else wx.showToast({
        title: '操作失败,请重试',
        icon: 'none'
      })
    })
  },
})