// pages/sqy/sqy.js
import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp();

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  
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
            wx.navigateBack(1)
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
   * 返回
   */
  goBack() {
    wx.navigateBack(1)
  },
})