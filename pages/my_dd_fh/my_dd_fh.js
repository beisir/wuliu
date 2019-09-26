// pages/my_dd_fh/my_dd_fh.js
// 货物记录
import { pageFillter } from '../../utils/pageFillter.js';
const app = getApp()

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    urlList: [{
      urlType: '请求列表数据',
      url: '/wxlogistics/smallpro/orderGoods/queryOrderGoodsList.html'
    }, {
      urlType: '删除记录',
      url: '/wxlogistics/smallpro/orderGoods/deleteOrderGoods.html'
    }],
    modellist: [], // 页面render数据
    navigateFlag: false, // 标志当前是否是从
    page: 0,
    pageSum: 1,
    showFlag: false,
  },
  /**
   * 获取render数据
   * @param getType 区别是刷新/初次加载,或者上拉加载
   */
  getRenderData(getType = 'refresh') {
    this.setData({
      showFlag: false
    })
    let page = this.data.page + 1
    if (getType === 'onLoad') { // 是否是上拉加载
      if (page > this.data.pageSum) {
        // 没有下一页数据现实没有更多
        return wx.showToast({
          title: '没有了~~~',
          duration: 1000,
          icon: 'none'
        })
      }
    } else { // 下拉刷新前清空数据
      this.setData({
        modellist: []
      })
      page = 1
    }
    app.http.request({
      ...this.data.urlList[0],
      data: {
        page,
        pageSize: 10
      }
    }).then(res => {
      if (res && res.value.orderGoods.length !== 0) {
        this.setData({
          modellist: [...this.data.modellist, ...res.value.orderGoods],
          page,
          pageSum: res.value.page.pages
        })
      } else {
        this.setData({
          showFlag: true
        })
      }
      wx.stopPullDownRefresh() // 关闭下拉刷新动画
    })
  },
  /**
   * 点击删除货物记录
   */
  showmo(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确定删除该记录',
      success: function (res) {
        if (res.confirm) {
          app.http.request({
            ...that.data.urlList[1],
            data: {
              goodsId: e.currentTarget.dataset.goodsid // 订单id
            }
          }).then(res => {
            if(res.flag) {
              that.getRenderData()
              wx.showToast({
                title: '删除成功'
              })
            } else {
              wx.showToast({
                title: '删除失败,请重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  /**
   * 路由跳转
   */
  navigateTo(e) {
    // 根据标志判断是跳往订单详情页/返回快速下单
    if (this.data.navigateFlag) {
      wx.setStorage({
        key: 'goodsInfo',
        data: e.currentTarget.dataset.item,
        success(res) {
          wx.navigateBack()
        },
        fail(err) {
          wx.showToast({
            title: '选择失败,请重试',
            icon: 'none'
          })
        }
      })
    } else {
      wx.navigateTo({
        url: `../ddxq/ddxq?orderId=${e.currentTarget.dataset.item.orderId}&title=订单详情`,
      })
    }
  },
  /**
   * 生命周期--页面加载
   */
  onLoad(options) {
    this.setData({
      navigateFlag: options.navigateFlag || false
    })
    this.getRenderData()
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