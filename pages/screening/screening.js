// pages/screening/screening.js

import {
  pageFillter
} from '../../utils/pageFillter.js';
import {
  getAllLogistics
} from '../../utils/util.js';
import {
  numRegex
} from '../../utils/regex.js';

let app = getApp();

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    allLogistics: [],
    lIndex: 0,
    allServer: [{
      name: '上门接货',
      serverType: 'isTodoorReceive',
      status: false
    }, {
      name: '送货上门',
      serverType: 'isSend',
      status: false
    }, {
      name: '网店自提',
      serverType: 'isZt',
      status: false
    }, {
      name: '送货上楼',
      serverType: 'isUpstairs',
      status: false
    }, {
      name: '开箱验货',
      serverType: 'isUnpacking',
      status: false
    }],
    distanceStart: '',
    distanceEnd: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getAllLogistics.then(res => {
      let al = JSON.parse(JSON.stringify(res));
      al.unshift({
        id: '',
        name: '全部物流商'
      })
      this.setData({
        allLogistics: al
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  bindPickerChange(e) {
    this.setData({
      lIndex: e.detail.value
    })
  },
  switch1Change(e) {
    this.setData({
      [`allServer[${e.currentTarget.dataset.index}].status`]: e.detail.value
    })
  },
  submite(e) {
    let chooseServer = this.data.allServer.reduce((pre, item) => {
      if (item.status) pre[item.serverType] = 1
      return pre
    }, {})
    chooseServer = {
      ...chooseServer,
      logisticId: this.data.allLogistics[this.data.lIndex].id,
      distanceStart: this.data.distanceStart,
      distanceEnd: this.data.distanceEnd,
    }
    wx.setStorage({
      key: 'filtrate',
      data: {
        chooseServer,
        status: true
      },
      success(res) {
        wx.navigateBack()
      }
    })
  }, 
  bindInput(e) {
    if (numRegex.test(e.detail.value)) {
      this.setData({
        [`${e.currentTarget.dataset.type}`]: e.detail.value
      })
    } else {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        duration: 1000
      })
      return this.data[e.currentTarget.dataset.type]
    }
  },
})