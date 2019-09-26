// pages/wl_index/sflx.js

import { pageFillter } from '../../utils/pageFillter.js';
const app = getApp();

pageFillter({
  /**
   * 页面的初始数据
   */
  data: {
    identityList: [],
    urlList: [{
      urlType: 'changeIdentity',
      url: '/wxlogistics/smallpro/user/modify.html'
    }],
    curindex: 0
  },
  /**
   * 生命周期函数--监听页面加载
   * @param options 路由传值{identity:'身份Id'}
   */
  onLoad(options) {
    let that = this;
    // 取缓存
    wx.getStorage({
      key: 'identityList',
      success(res) {
        that.setData({
          identityList: [...res.data],
          curindex: parseInt(options.identity) - 1
        })
      },
      fail(err) {
        // 没有则请求
        app.http.request({
          url: '/wxlogistics/smallpro/user/get/all/identity.html'
        }).then(res => {
          if (res) {
            that.setData({
              identityList: [...res],
              curindex: parseInt(options.identity) - 1
            })
            // 同步缓存
            wx.setStorage({
              key: 'identityList',
              data: res,
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  /**
   * 切换身份
   */
  onchange(e) {
    let { index, typecode } = e.currentTarget.dataset,
      that = this;
    if (index === this.data.curindex) return
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        app.http.request({
          ...that.data.urlList[0],
          data: {
            identity: typecode
          }
        }).then(opts => {
          wx.setStorage({
            key: 'userInfo',
            data: {
              ...opts,
              status: true
            },
            success() {
              that.setData({
                curindex: index
              })
              wx.navigateBack()
            }
          })
        }).catch(err => err)
      },
    })
  }
})