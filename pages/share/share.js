// share.js活动分享页
import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp()

pageFillter({
  data: {
    urlList:[ // 保存优惠券请求接口
      {
        urlType: '领取折扣券',
        url: '/wxlogistics/smallpro/discountOrder/sendDiscount.html'
      },
    ],
    discountCouponRender: null, // 保存优惠券信息
    hiddenmodal: true, // 领取优惠券弹框
    date: (new Date).getDate()
  },
  /**
   * 页面展示
   */
  onShow() {

  },
  /**
   * 分享
   */
  onShareAppMessage(res) {
    let that = this;
    return {
      title: '惠物流小程序 发货5折起 优惠券限量送',
      path: '/pages/share/share',
      imageUrl: '../../image/share.jpg',
      success(res) {
        // 请求优惠券数据
        app.http.request({
          ...that.data.urlList[0]
        }).then(res => {
          if (res.flag) {
            that.setData({
              discountCouponRender: res.wlDiscountOrder,
              hiddenmodal: false
            })
          }
        })
      },
      fail(err) {
        wx.showToast({
          title: '转发失败,请重试',
          icon: 'none'
        })
      }
    }
  },
  /**
   * 跳转下单
   */
  shipments() {
    app.router({
      path: '../ksxd/ksxd',
      methods: 'title=快速下单'
    })
  },
  /**
   * 跳转首页
   */
  toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  /**
   * 隐藏优惠券弹框
   */
  modalCancel() {
    this.setData({
      hiddenmodal: true
    })
  }
})
