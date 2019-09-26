// pages/ss_wnsb/ss_wnsb.js

import {
  ChineseCharacterRegex,
} from '../../utils/regex.js';
import {
  pageFillter
} from '../../utils/pageFillter.js';

const app = getApp();
const recorderManager = wx.getRecorderManager();

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    searchConten: '', // 手续哦内容
    voiceInputShow: false, // 录音按钮状态
    recorderInputShow: false, // 长按语音识别控制
    recorderOptions: { // 微信录音配置
      // duration: 3000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50,
      height: 0,
    },
    searchHistory: [], // 历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },
  /**
   * 生命周期--页面显示
   */
  onShow() {
    let that = this
    wx.getStorage({
      key: 'searchHistory',
      success(res) {
        let searchHistory = Array.from(new Set(res.data))
        that.setData({
          searchHistory: searchHistory.slice(0, 10)
        })
      },
    })
  },
  /**
   * 正则验证用户输入
   */
  inputRegex(e) {

  },
  inputFocus(e) {
    this.setData({
      voiceInputShow: true,
      height: e.detail.height * 2 + 66,
    })
  },
  inputBlur(e) {
    this.setData({
      voiceInputShow: false
    })
  },
  /**
   * 用户软键盘完成事件
   */
  searchSubmit(e) {
    let searchStr = e.detail.value.replace(/\s/g, ''),
        that = this;
    if (ChineseCharacterRegex.test(searchStr)) {
      wx.setStorage({
        key: 'searchHistory',
        data: [
          searchStr,
          ...that.data.searchHistory
        ],
      })
      wx.navigateTo({
        url: `../sslx/sslx?address=${searchStr}&title=搜索结果`,
      })
    } else {
      wx.showToast({
        title: '请输入有效搜索内容',
        icon: 'none'
      })
    }
  },
  /**
   * 开始录音
   */
  recorderStart() {
    this.setData({
      recorderInputShow: true
    })
    wx.showLoading({
      title: '请说出想要查询的线路'
    })
    recorderManager.start(this.data.recorderOptions)
  },
  /**
   * 录音结束
   */
  recorderEnd() {
    let that = this;
    recorderManager.stop()
    this.setData({
      recorderInputShow: false
    })
    wx.hideLoading()
    recorderManager.onStop((res) => {
      // 语音识别
      app.ASRUpload(res.tempFilePath).then(result => {
        if (ChineseCharacterRegex.test(result)) {
          that.setData({
            searchConten: result
          })
          wx.setStorage({
            key: 'searchHistory',
            data: [
              result,
              ...that.data.searchHistory
            ],
          })
          wx.navigateTo({
            url: `../sslx/sslx?address=${result}`,
          })
        } else {
          wx.showToast({
            title: '请说出有效搜索内容',
            icon: 'none'
          })
        }
      })
    })
  },
  /**
   * 点击历史记录
   */
  clickHistory(e) {
    this.setData({
      searchConten: e.currentTarget.dataset.item
    })
    wx.navigateTo({
      url: `../sslx/sslx?address=${e.currentTarget.dataset.item}&title=搜索结果`,
    })
  },
  /**
   * 清空搜索历史
   */
  clearHistory() {
    let that = this;
    wx.removeStorage({
      key: 'searchHistory',
      success(res) {
        that.setData({
          searchHistory: []
        })
      },
      fail(err) {
        wx.showToast({
          title: '操作失败,请重试',
          icon: 'none'
        })
      }
    })
  }

})