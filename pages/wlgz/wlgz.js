// pages/wlgz/wlgz.js
import { letterNumRegex } from '../../utils/regex.js';
import { pageFillter } from '../../utils/pageFillter.js';
import { shareAppMessage } from '../../utils/util.js';

const app = getApp();
const recorderManager = wx.getRecorderManager();

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面render数据
    list: {
      state: false, // 是否已经签收
      content: [] // 列表数据
    },
    scanCode: '', // 物流查询编码
    urlList: [ // 请求url
      {
        name: '获取物流信息',
        url: '/wxlogistics/smallpro/order/get/tracks.html'
      },
      {
        name: '上传录音文件',
        url: '/wxlogistics/smallpro/baiduapi/speech.html'
      }
    ],
    recorderOptions: { // 微信录音配置
      // duration: 3000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onLoad(option) {
    wx.setNavigationBarTitle({
      title: '物流详情'
    })
    this.setData({
      scanCode: option.scanCode || ''
    })
    if (this.data.scanCode) this.getRenderData(this.data.scanCode)
  },
  onShow: function () {

  },
  onUnload() {

  },
  // 事件函数
  /**
   * 请求获取页面渲染数据
   */
  getRenderData(logisticOrderCode) {
    app.http.request({
      ...this.data.urlList[0],
      data: {
        logisticOrderCode
      }
    }).then((res) => {
      this.setData({
        'list.content': res.content || [],
        'list.state': res.state || false,
        scanCode: logisticOrderCode
      })
    }).catch(err => err)
  },
  /**
   * 用户点击软键盘完成时触发
   */
  searchSubmit(e) {
    if (letterNumRegex.test(e.detail.value)) {
      this.getRenderData(e.detail.value)
    } else {
      wx.showToast({
        title: '请输入字母或数字',
        icon: 'none'
      })
    }
  },
  /**
   * 扫码识别
   */
  scavenging() {
    wx.scanCode({
      success: (res) => {
        if ('scanCode:ok' === res.errMsg) {
          wx.redirectTo({
            url: `../wlgz/wlgz?scanCode=${res.result}`
          })
        }
      }
    })
  },
  /**
   * 开始录音
   */
  recorderStart() {
    wx.showLoading({
      title: '请说出想要查询的物流编码'
    })
    // recorderManager.onStart(() => {

    // })
    recorderManager.start(this.data.recorderOptions)
  },
  /**
   * 录音结束
   */
  recorderEnd() {
    
    recorderManager.stop()
    wx.hideLoading()
    recorderManager.onStop((res) => {
      // 语音识别
      let that = this;
      app.ASRUpload(res.tempFilePath).then(result => {
        if (result && letterNumRegex.test(result)) {
          that.setData({
            scanCode: result
          })
          // 请求物流数据
          that.getRenderData(that.data.scanCode)
        } else {
          wx.showToast({
            icon: 'none',
            title: '物流编码只能是数字字母组成'
          })
        }
      })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return shareAppMessage
  },
})