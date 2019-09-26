// pages/gsyf/gsyf.js
import {
  getAddress,
  shareAppMessage,
} from '../../utils/util.js';

import {
  goodsInfoRules
} from '../../utils/rule.js';
import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp()

pageFillter({
  /**
   * 页面的初始数据
   */
  data: {
    sendArray: [],
    receiveArray: ['北京市', '北京市', '昌平区'],
    curindex: 0,
    goodsInfo: {
      // goodsWeight: 1,
      // goodsVolume: 0,
      // goodsNumber: 1,
    }, // 货物信息
  },
  onLoad() {
    getAddress.then(res => {
      this.setData({
        sendArray: [
          res.ad_info.province,
          res.ad_info.city,
          res.ad_info.district,
        ]
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {


  },
  /**
   * 货物信息输入
   */
  input(e) {
    this.setData({
      [`goodsInfo.${e.currentTarget.dataset.type}`]: e.detail.value
    })
  },
  /**
   * 货物信息保存
   */
  inputBlur(e) {
    let that = this;

    // // 货物信息输入验证
    // if (goodsInfoRules(this.data.goodsInfo)) return wx.showToast({
    //   title: goodsInfoRules(this.data.goodsInfo),
    //   icon: 'none'
    // })

    wx.setStorage({
      key: 'goodsInfo',
      data: that.data.goodsInfo,
    })
  },
  /**
   * 选择地方
   */
  bindPickerChange(e) {
    this.setData({
      [`${e.currentTarget.dataset.type}`]: e.detail.value
    })
  },
  submit(e) {
    if (this.data.sendArray.length === 0 || this.data.receiveArray.length === 0) return wx.showToast({
      title: '请填写收/发货人地址',
      icon: 'none'
    })

    // 货物信息输入验证
    if (goodsInfoRules(this.data.goodsInfo)) return wx.showToast({
      title: goodsInfoRules(this.data.goodsInfo),
      icon: 'none'
    })

    let address = `${this.data.sendArray.join('')}到${this.data.receiveArray.join('')}`
    wx.navigateTo({
      url: `../sslx/sslx?title=${this.data.sendArray[0]}-${this.data.receiveArray[0]}&address=${address}&gsyf=true&cargoWeight=${this.data.goodsInfo.goodsWeight}&cargoMeasurement=${this.data.goodsInfo.goodsVolume}`,
    })
  },
  /**
   * 针对组件传参回调修改依赖属性
   */
  comChangeData(e) {
    let that = this;
    this.setData({
      [e.detail.key]: e.detail.value
    })
    // 更改后同步修改缓存
    wx.setStorage({
      key: 'goodsInfo',
      data: that.data.goodsInfo,
      success() {
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return shareAppMessage
  },
})