// pages/fwyq/fwyq.js
// 增值服务
import {
  pageFillter
} from '../../utils/pageFillter.js';
import {
  decimalsRegex
} from '../../utils/regex.js';

const app = getApp()

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    url: '/wxlogistics/smallpro/productAppreciation/getProductAppreciation.html', // 请求
    id: null, // 物流商ID
    serverInfo: {}, // 增值服务
    chooseServer: null, // 
    // paymentArray: ['发货人支付(现付)'], // 支付方式数组
    receiptsArray: ['发货单签收联原件返回', '运单签收联原件返回'], // 签收回单
    receiptstType: 0, // 签收回单选择
    // paymentType: 0, // 保存支付方式
    serverDictionary: { // 增值服务key翻译字典
      "1": "上门接货",
      "2": "送货上门",
      "3": "燃油附加费",
      "4": "开箱验货",
      "5": "送货上楼",
      "6": "网点自提",
      "7": "等通知发货",
      "8": "等通知派送",
      "9": "货物保价",
      "10": "包装服务",
      "11": "货物保险",
      "12": "运费到付",
      "13": "短信通知服务",
      "14": "签收回单",
      "15": "时效承诺",
      "16": "一票多件",
      "17": "工本费",
    }
  },
  /**
   * 生命周期--页面加载
   */
  onLoad(opts) {
    let that = this;
    // 先判断缓存中是否存在增值服务信息,有着取缓存,没有重新请求
    wx.getStorage({
      key: 'chooseServer',
      success(res) {
          that.setData({
            // serverInfo: res.data.serverInfo,
            chooseServer: res.data
          })
          // // 是否支持到付
          // if (res.data.serverInfo['12']) that.setData({
          //   paymentArray: ['发货人支付(现付)', '收货人支付(到付)']
          // })
          // // 单独判断是否选择到付
          // if (res.data.serverInfo['12'] && res.data.serverInfo['12'].flag) that.setData({
          //   paymentType: 1
          // })
          // 单独判断签收回单
          if (res.data.serverInfo['14'] && res.data.serverInfo['14'].type !== 0) {
            that.setData({
              receiptsArray: ['发货单签收联原件返回', '运单签收联原件返回']
            })
          } else {
            that.setData({
              receiptsArray: ['面议']
            })
          }
          if (res.data.serverInfo['14'] && res.data.serverInfo['14'].chooseType === '30_1') {           
            that.setData({
              receiptstType: 1
            })
          }
      },
      fail(err) {
        wx.showToast({
          title: '~获取增值服务信息失败,请重试~',
          icon: 'none'
        })
      }
    })
  },
  /**
   * 生命周期--页面显示
   */
  onUnload() {
    if (app.http.requestAbort[this.data.url]) app.http.requestAbort[this.data.url].abort()
  },
  /**
   * 滑块切换
   */
  switchChange(e) {
    let index = e.currentTarget.dataset.index
    // 当选项不是必选项时才可选择
    if (this.data.chooseServer.serverInfo[index].isRequired !== '1') {
      // 修改布尔值
      this.setData({
        [`chooseServer.serverInfo.${index}.flag`]: e.detail.value
      })
      // 让货物保价与货物保险互斥单选
      if (index === '9' || index === '11') {
        if (index === '9') {
          if (e.detail.value && this.data.chooseServer.serverInfo['11']) {
            this.setData({
              [`chooseServer.serverInfo.11.flag`]: false
            })
          }
        } else if (index === '11') {
          if (e.detail.value && this.data.chooseServer.serverInfo['9']) {
            this.setData({
              [`chooseServer.serverInfo.9.flag`]: false
            })
          }
        }
        if (this.data.chooseServer.serverInfo['9'] && this.data.chooseServer.serverInfo['11']) {
          wx.showToast({
            title: '货物保价与货物保险只能单选',
            icon: 'none',
            duration: 1000
          })
        }
      }

      // 送货上门与网点自提
      if (index === '2' || index === '6') {
        if (index === '2') {
          if (e.detail.value && this.data.chooseServer.serverInfo['6']) {
            this.setData({
              [`chooseServer.serverInfo.6.flag`]: false
            })
          }
        } else if (index === '6') {
          if (e.detail.value && this.data.chooseServer.serverInfo['2']) {
            this.setData({
              [`chooseServer.serverInfo.2.flag`]: false
            })
          }
        }
      }
      if ((index === '2' || index === '6') && this.data.chooseServer.serverInfo['2'] && this.data.chooseServer.serverInfo['6']) {
        wx.showToast({
          title: '送货上门与网点自提只能单选',
          icon: 'none',
          duration: 1000
        })
      }
    } else {
      // 判断如果是必选项则禁止用户取消
      wx.showToast({
        title: '当前选项为必选项',
        icon: 'none'
      })
      this.setData({
        [`chooseServer.serverInfo.${index}.flag`]: true
      })
    }

  },
  /**
   * 用户输入后计算
   */
  inputBlur(e) {
    if (decimalsRegex.test(e.detail.value)) {
      let resultPrice,
        serverInfoItem = this.data.chooseServer.serverInfo[e.currentTarget.dataset.key];
      // 当选择货物保价时
      if (e.currentTarget.dataset.key === '9') {
        if (serverInfoItem.type === '0' || serverInfoItem.type === 'true') {
          resultPrice = parseFloat(serverInfoItem.valueMap['19_00'])
        } else {
          // 计算费用与最低一票对比,取最大
          let price = (parseFloat(e.detail.value) * parseFloat(serverInfoItem.valueMap['20_10']) * 0.001)
          resultPrice = price > parseFloat(serverInfoItem.valueMap['20_11']) ? price : parseFloat(serverInfoItem.valueMap['20_11'])
          console.log('resultPrice e', resultPrice)
        }
      } else if (e.currentTarget.dataset.key === '11') {
        // 当选择货物保险时
        // 计算费用与最低一票对比,取最大
        let price = (parseFloat(e.detail.value) * parseFloat(serverInfoItem.valueMap['22_0']) * 0.001)
        resultPrice = price > parseFloat(serverInfoItem.valueMap['22_1']) ? price : parseFloat(serverInfoItem.valueMap['22_1'])
      }

      this.setData({
        [`chooseServer.serverInfo.${e.currentTarget.dataset.key}.inputPrice`]: e.detail.value,
        [`chooseServer.serverInfo.${e.currentTarget.dataset.key}.resultPrice`]: resultPrice.toFixed(2)
      })
    } else {
      wx.showToast({
        title: '请输入数字金额',
        icon: 'none'
      })
      this.setData({
        [`chooseServer.serverInfo.${e.currentTarget.dataset.key}.inputPrice`]: 0
      })
    }
  },
  /**
   * 确认
   */
  saveInfo() {
    setTimeout(()=> {
      let that = this;
      if (this.data.chooseServer.serverInfo['9'] && this.data.chooseServer.serverInfo['9'].flag) {
        if (!this.data.chooseServer.serverInfo['9'].inputPrice) {
          return wx.showToast({
            title: '请输入保价金额',
            icon: 'none'
          })
        }
      }
      if (this.data.chooseServer.serverInfo['11'] && this.data.chooseServer.serverInfo['11'].flag) {
        if (!this.data.chooseServer.serverInfo['11'].inputPrice) {
          return wx.showToast({
            title: '请输入保险金额',
            icon: 'none'
          })
        }
      }
      wx.setStorage({
        key: 'chooseServer',
        data: that.data.chooseServer,
        // {
        //   id: that.data.id,
        //   serverInfo: that.data.chooseServer.serverInfo
        // },
        success(res) {
          wx.navigateBack()
        },
        fail(err) {
          wx.showToast({
            title: '保存失败,请重试',
            icon: 'none'
          })
        }
      })
    })
  },
  /**
   * 选择支付方式
   */
  // bindPickerChange(e) {
  //   this.setData({
  //     paymentType: e.detail.value
  //   })
  //   if (e.detail.value === '1') {
  //     this.setData({
  //       [`serverInfo.12.flag`]: true
  //     })
  //   } else {
  //     this.setData({
  //       [`serverInfo.12.flag`]: false
  //     })
  //   }
  // },
  /**
   * 选择签单方式
   */
  chooseReceipts(e) {
    this.setData({
      receiptsType: e.detail.value
    })
    if (e.detail.value === '0') {
      this.setData({
        [`chooseServer.serverInfo.14.flag`]: true,
        [`chooseServer.serverInfo.14.chooseType`]: '30_0',
      })
    } else if (e.detail.value === '1') {
      this.setData({
        [`chooseServer.serverInfo.14.flag`]: true,
        [`chooseServer.serverInfo.14.chooseType`]: '30_1',
      })
    }
  },
  // /**
  //  * 请求增值服务
  //  */
  // getServerInfo(id) {
  //   app.http.request({
  //     url: this.data.url,
  //     data: {
  //       lineId: id
  //     }
  //   }).then(res => {
  //     if (res && res.flag) {
  //       // 将必选项默认选中
  //       let serverInfo = res.value.serviceInfo
  //       Object.keys(serverInfo).forEach(item => {
  //         if (serverInfo[item].isRequired === '1') {
  //           serverInfo[item].flag = true
  //         }
  //       })
  //       this.setData({
  //         id: id, // 保存
  //         serverInfo,
  //       })
  //       wx.setStorage({
  //         key: 'chooseServer',
  //         data: {
  //           id: id,
  //           serverInfo,
  //         },
  //       })
  //       // 是否支持到付
  //       if (res.value.serviceInfo['12']) {
  //         this.setData({
  //           paymentArray: ['发货人支付(现付)', '收货人支付(到付)']
  //         })
  //       }
  //       // 单独判断签收回单
  //       if (res.value.serviceInfo['14'] && res.value.serviceInfo['14'].type !== 0) {
  //         this.setData({
  //           receiptsArray: ['发货单签收联原件返回', '运单签收联原件返回']
  //         })
  //       } else {
  //         this.setData({
  //           receiptsArray: ['面议']
  //         })
  //       }
  //     }
  //   })
  // },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

})