import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp();

pageFillter({
  data: {
    userInfo: { // 用户信息
      niceName: '', // 昵称
      iconUrl: '', // 头像地址
      identityName: "", // 用户身份
      identity: '', // 用户身份Id
      status: false, // 用户是否授权登陆
    },
    tabList: [{
      title: '我的订单',
      path: '../my_dd_fhjl/my_dd_fhjl',
      icon: 'ico_01'
    }, {
      title: '货物记录',
      path: '../my_dd_fh/my_dd_fh',
      icon: 'ico_02'
    }, {
      title: '地址簿',
      path: '../dzb_shr/dzb_shr',
      icon: 'ico_04'
    }, ], // 按钮列表
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  /**
   * @function --用户点击授权登陆
   */
  bindGetUserInfo(e) {
    const that = this;
    if (e.detail.errMsg === "getUserInfo:ok") {
      app.http.request({ // 获取用户信息
        url: '/wxlogistics/smallpro/user/save.html',
        data: {
          niceName: e.detail.userInfo.nickName,
          iconUrl: e.detail.userInfo.avatarUrl,
        }
      }).then(res => {
        wx.setStorage({ // 本地缓存,提供下次免授权登陆
          key: 'userInfo',
          data: {
            ...res,
            status: true
          },
          success() {
            that.setData({ // 页面render
              userInfo: {
                ...res,
                status: true
              }
            })
          }
        })
      }).catch(err => {
        wx.showToast({
          title: '登陆失败请重试',
          icon: 'none',
          mask: true
        })
      })
    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none',
        mask: true
      })
    }
  },
  /**
   * @function --跳转身份设置页
   */
  navigateToIdentity() {
    wx.navigateTo({
      url: `/pages/sflx/sflx?identity=${this.data.userInfo.identity}&title=身份类型`,
    })
  },
  /**
   * 权限登陆
   */
  toNavigate(e) {
    app.router({
      path: e.currentTarget.dataset.item.path,
      methods: `title=${e.currentTarget.dataset.item.title}`
    })
  },
  onLoad() {},
  onShow() {
    let that = this
    wx.getStorage({ // 每次进入page获取一遍缓存用户信息
      key: 'userInfo',
      success(res) {
        that.setData({
          userInfo: {
            ...res.data
          }
        })
      }
    })
  }
})