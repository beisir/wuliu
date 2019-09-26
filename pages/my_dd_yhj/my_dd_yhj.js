// pages/my_dd_yhj /my_dd_yhj .js

import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp();

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    reselist: [{
        title: '有效',
        btn: '立即使用',
        discountState: 1,
        page: 0,
        pageSum: 1,
        renderData: []
      },
      {
        title: '已用',
        btn: '已使用',
        discountState: 2,
        page: 0,
        pageSum: 1,
        renderData: []
      },
      {
        title: '已过期',
        btn: '已过期',
        discountState: 3,
        page: 0,
        pageSum: 1,
        renderData: []
      }
    ],
  },
  /**
   * 进入页面
   */
  onShow() {
    this.getRenderData()
  },
  /**
   * 请求数据
   */
  getRenderData(getType = 'refresh') {
    let page = this.data.reselist[this.data.currentIndex].page + 1
    if (getType === 'onLoad') { // 是否是上拉加载
      if (page > this.data.reselist[this.data.currentIndex].pageSum) {
        // 没有下一页数据现实没有更多
        return wx.showToast({
          title: '没有了~~~',
          duration: 1000,
          icon: 'none'
        })
      }
    } else { // 下拉刷新前清空数据
      this.setData({
        [`reselist[${this.data.currentIndex}].renderData`]: [],
      })
      page = 1
    }
    app.http.request({
      url: '/wxlogistics/smallpro/discountOrder/getDiscountOrderList.html',
      data: {
        discountState: this.data.reselist[this.data.currentIndex].discountState,
        page,
        pageSize: 10,
      }
    }).then(res => {
      if (res && res.flag) {
        this.setData({
          [`reselist[${this.data.currentIndex}].renderData`]: [...this.data.reselist[this.data.currentIndex].renderData, ...res.value.discountList.wlDiscountlsit],
          [`reselist[${this.data.currentIndex}].page`]: page,
          [`reselist[${this.data.currentIndex}].pageSum`]: res.value.page.pages
        })
      }
      wx.stopPullDownRefresh() // 关闭下拉刷新动画
    })
  },
  /**
   * tab组件回调,更改currentIndex
   */
  changeCurrentIndex(e) {
    this.setData({
      currentIndex: e.detail.currentIndex
    })
  },
  /**
   * swiper切换
   */
  crrentChange(e) {
    e.detail.source === 'touch' && this.setData({
      // 判断curindex变化是否是由用户滑动触发，属于优化项
      currentIndex: e.detail.current
    })
    if (this.data.reselist[this.data.currentIndex].renderData.length === 0) {
      this.getRenderData()
    }
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getRenderData()
  },
  /**
   * 上拉加载
   */
  onReachBottom() {
    this.getRenderData('onLoad')
  }
})