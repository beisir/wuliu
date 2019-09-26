// pages/fahuo/fahuo.js
import {
  pageFillter
} from '../../utils/pageFillter.js';
import {
  getAddress,
  ObjectDistinct,
  shareAppMessage,
} from '../../utils/util.js';
import {
  decimalsRegex,
  towADecimal,
  telephoneReg
} from '../../utils/regex.js';

const app = getApp()


pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    url: '/wxlogistics/smallpro/line/send.html',
    markers: [], // 地图标记气泡配置
    modalputName: '', // 弹框标题
    hiddenmodalput: true, // 网点线路信息弹框显示控制标记
    mapShow: false, // 地图显示
    allLogistic: [], // 所有物流商
    localAddress: '', // 定位当前地址
    coordinate: {}, // 当前经纬度
    addressList: [{}, {}], // 用户选择地址
    region: [
      ['北京市', '北京市', '海淀区'],
      ['省', '市', '区']
    ], // 选择省市区
    checkedLineId: '', // 选择的线路ID
    logisticLineHide: true, // 物流商线路显示标记
    chooseLogistic: null, // 用户选择线路
    pullDownInputShowStatus: [false, false], // 下拉菜单显示状态
    addressThinkRenderData: [], // 详细地址联想数据
    addressThinkShowStatus: false, // 输入联系人联想地址状态
    addressThinkShowIndex: 0, // 激活输入联系人联想地址状态的下标
    addressThinkHistoryRenderData: [], // 详细地址联想数据
    addressThinkHistoryStatus: true, // 是否显示历史记录控制状态
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取定位地址
    getAddress.then(res => {
      this.setData({
        localAddress: res.address,
        coordinate: res.location,
        'region[0]': [res.address_component.province, res.address_component.city, res.address_component.district, ],
        [`addressList`]: { // 初始化定位信息
          0: {
            ...this.data.addressList['0'],
            area: `${res.address_component.province}-${res.address_component.city}-${res.address_component.district}`,
            provinceName: res.address_component.province,
            cityName: res.address_component.city,
            countyName: res.address_component.district,
            address: res.address,
          },
          1: {}
        }
      })
    })
  },
  /**
   * 生命周期--页面显示
   */
  onShow() {
    let that = this;
    wx.getStorage({
      key: 'addressList',
      success(res) {
        let data = res.data
        // 解决初次进入,选择收货人地址后,会丢失定位的发货人地址
        if (JSON.stringify(data[0]) === '{}') {
          data = {
            ...data,
            0: that.data.addressList[0]
          }
        }
        that.setData({
          addressList: data,
        })

        if (res.data[0].addressId) {
          that.setData({
            localAddress: `${data[0].provinceName}${data[0].cityName}${data[0].countyName}${data[0].address}`,
          })
        }
        // 当存在收/发货人地址时对应修改
        if (that.data.addressList[0].area) {
          that.setData({
            'region[0]': [that.data.addressList[0].provinceName, that.data.addressList[0].cityName, that.data.addressList[0].countyName,]
          })
        }
        if (that.data.addressList[1].area) {
          that.setData({
            'region[1]': [that.data.addressList[1].provinceName, that.data.addressList[1].cityName, that.data.addressList[1].countyName,]
          })
        }
        if (that.data.addressList[0].area && that.data.addressList[1].area && that.data.addressList[0].address) {
          that.locadMap()
        }
      },
      fail(err) {
        // that.setData({
        //   addressList: [{}, {}]
        // })
      }
    })
    wx.getStorage({
      key: 'addressThinkHistoryRenderData',
      success(res) {
        that.setData({
          addressThinkHistoryRenderData: res.data
        })
      },
    })
  },
  /**
   * 生命周期--离开组件
   */
  onHide() {
    let that = this;
    that.setData({
      hiddenmodalput: true, // 隐藏弹框
      mapShow: false, // 地图显示
      lineInfoList: [], // 清空弹框列表
      chooseLogistic: null, // 重制用户选择
      markers: []
    })
    app.http.requestAbort[this.data.url] && app.http.requestAbort[this.data.url].abort()
  },
  /**
   * 加载地图
   */
  locadMap() {
    this.setData({
      allLogistic: [], // 清空数据
      addressThinkShowStatus: false
    })
    let that = this
    app.http.request({
      url: this.data.url,
      data: {
        addr: `${this.data.addressList[0].area}到${this.data.addressList[1].area}`,
        sendAddr: this.data.localAddress
      },
    }).then(res => {
      // 配置地图气泡
      if (!res) {
        return wx.showToast({
          title: '请求中断',
          icon: 'none'
        })
      }
      if (res.lineOutlet.length === 0 && (res.logisticNum !== 0 || res.lineNum !== 0)) {
        wx.navigateTo({
          url: `../sslx/sslx?address=${this.data.addressList[0].area}/${this.data.addressList[1].area}`,
        })
      }
      if (!res.lineOutlet || res.lineOutlet.length === 0) {
        return wx.showToast({
          title: '当前线路未搜索到相关物流商',
          icon: 'none'
        })
      }
      let markers = res.lineOutlet.reduce((pre, item, index) => {
        let obj = {
          iconPath: '../../image/mark.png',
          id: index,
          latitude: item.latitude,
          longitude: item.longitude,
          width: 50,
          height: 60,
          callout: {
            content: item.logisticName + '/' + item.outletName,
            color: "black",
            fontSize: "12",
            borderRadius: "10",
            bgColor: "white",
            padding: "1",
            display: "ALWAYS"
          }
        }
        pre.push(obj)
        return pre
      }, [])
      res.sendLatAndLng
      that.setData({
        markers,
        allLogistic: res,
        coordinate: res.sendLatAndLng
      })

    })
    // this.mapCtx = wx.createMapContext('map', this)
    // this.mapCtx.moveToLocation()
  },
  /**
   * 点击选择地图标记的位置
   */
  markertap(e) {
    let outlet = this.data.allLogistic.lineOutlet[e.markerId]
    this.setData({
      hiddenmodalput: false,
      mapShow: true,
      modalputName: outlet.logisticName + '/' + outlet.outletName,
      lineInfoList: outlet.docs,
      phone: outlet.outletTelephone
    })
  },

  /**
   * 网点线路列表弹框-发货
   */
  modalConfirm(e) {
    let that = this;
    if (this.data.chooseLogistic) {
      wx.setStorage({
        key: 'logistics',
        data: this.data.chooseLogistic,
        success(res) {
          wx.setStorage({
            key: 'addressList',
            data: that.data.addressList,
          })
          app.router({
            path: '../ksxd/ksxd',
            methods: 'title=发货'
          })
          that.setData({
            hiddenmodalput: true, // 隐藏弹框
            mapShow: false, // 地图显示
            lineInfoList: [], // 清空弹框列表
            chooseLogistic: null, // 重制用户选择
            markers: []
          })
        },
        fail(err) {
          wx.showToast({
            title: '操作失败,请重试',
            icon: 'none',
            duration: 1000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请选择物流线路',
        icon: 'none',
        duration: 1000
      })
    }
  },

  /**
   * 网点线路列表弹框-取消
   */
  modalCancel() {
    // 重制状态
    this.setData({
      hiddenmodalput: true,
      mapShow: false,
      lineInfoList: [],
      chooseLogistic: null,
      phone: ''
    })
  },

  /**
   * 选择线路
   */
  checkedLine(e) {
    this.setData({
      chooseLogistic: this.data.lineInfoList[e.detail.value]
    })
  },
  /**
   * 选择地址
   */
  chooseAddress(e) {
    app.router({
      path: `../dzb_shr/dzb_shr`,
      methods: `type=${e.currentTarget.dataset.type}&title=选择地址`
    })
  },
  /**
   * 打电话
   */
  callPhone(e) {
    let that = this;
    wx.showActionSheet({
      itemList: [that.data.phone],
      success: function(res) {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ // 调用电话
            phoneNumber: that.data.phone,
            fail(err) {
              wx.showToast({
                title: '拨打失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  /**
   * 控制折叠框显示隐藏
   */
  pullDownInputShow(e) {
    this.setData({
      [`pullDownInputShowStatus[${e.currentTarget.dataset.index}]`]: !this.data.pullDownInputShowStatus[e.currentTarget.dataset.index], // 使两个输入框互斥
      [`pullDownInputShowStatus[${e.currentTarget.dataset.index == 0 ? 1 : 0}]`]: false,
      addressThinkShowStatus: false
    })
    // 判断信息是否完善,完善这请求
    let status = this.judgeInfoComplete()
    if (status[0] && status[1] && !this.data.pullDownInputShowStatus[0] && !this.data.pullDownInputShowStatus[1]) {
      this.locadMap()
    }
  },
  /**
   * 收/发货人信息输入激活
   */
  focusLinkman(e) {
    // 激活其他输入框则隐藏联想
    if (e.currentTarget.dataset.type !== 'address') {
      return this.setData({
        addressThinkShowStatus: false,
      })
    } else {
      this.setData({ // 设置区分是从哪里唤起的
        addressThinkShowIndex: e.currentTarget.dataset.index
      })
    }
    this.setData({ // 激活时打开联想弹框
      addressThinkShowStatus: true,
    })
    // 每次激活时请求数据
    if (e.detail.value) {
      this.getaddressThinkRenderData(e.detail.value, this.data.addressList[e.currentTarget.dataset.index].cityName || '', this.data.addressList[e.currentTarget.dataset.index].area || '')
      this.setData({
        addressThinkHistoryStatus: false // 激活时有详细地址则显示匹配
      })
    } else {
      this.setData({ // 激活时没有详细地址则显示历史记录
        addressThinkHistoryStatus: true
      })
    }
  },
  /**
   * 收/发货人信息输入
   */
  inputLinkman(e) {
    let that = this;
    this.setData({
      addressThinkShowStatus: true,
      addressThinkHistoryStatus: false, // 隐藏历史记录
    })
    // 清除已有延时器
    this.data.requestTimeout && clearTimeout(this.data.requestTimeout)
    // 延时.8s请求
    let requestTimeout = setTimeout(() => {
      // 获取联想地址数据
      that.getaddressThinkRenderData(e.detail.value, that.data.addressList[e.currentTarget.dataset.index].cityName || '', that.data.addressList[e.currentTarget.dataset.index].area || '')
    }, 500)
    this.setData({
      requestTimeout,
    })
  },
  /**
   * 收/发货人信息点击确定
   */
  blurLinkman(e) {
    this.setData({
      [`addressList.${parseInt(e.currentTarget.dataset.index)}.${e.currentTarget.dataset.type}`]: e.detail.value,
      // 清空联想地址
      // addressThinkRenderData: []
    })

    // 获取信息完善情况,决定是否打开信息输入下拉框
    this.setData({ // 打开信息输入下拉框
      pullDownInputShowStatus: this.judgeInfoComplete('获取下啦状态'),
    })
    // 判断信息是否完善,完善这请求
    let status = this.judgeInfoComplete()
    if (status[0]) {
      this.setData({ // 打开信息输入下拉框
        addressThinkShowStatus: false
      })
    }
    if (status[0] && status[1]) {
      this.locadMap()
    }
  },
  /**
   * 请求联想地址render数据
   */
  getaddressThinkRenderData(query = '', region = '', area = '') {
    app.http.request({
      url: '/wxlogistics/smallpro/addressBook/getAddress.html',
      data: {
        region,
        query,
        area,
      }
    }).then(res => {
      if (res.flag && res.value) {
        this.setData({
          addressThinkRenderData: res.value.address
        })
      }
    })
  },
  /**
   * 选择联想地址
   */
  chooseThinkAddress(e) {
    // 历史记录去重
    let addressDistinct = ObjectDistinct(this.data.addressThinkHistoryRenderData, 'name')

    this.setData({
      [`addressList.${this.data.addressThinkShowIndex}.address`]: e.currentTarget.dataset.item.address || e.currentTarget.dataset.item.name,
      addressThinkHistoryRenderData: [ // 历史记录
        e.currentTarget.dataset.item,
        ...addressDistinct
      ],
      addressThinkShowStatus: false,
    })
    // 获取信息完善情况,决定是否打开信息输入下拉框
    this.setData({ // 打开信息输入下拉框
      pullDownInputShowStatus: this.judgeInfoComplete('获取下啦状态'),
    })
    // 判断信息是否完善,完善这请求
    let status = this.judgeInfoComplete()
    if (status[0] && status[1]) {
      this.locadMap()
    }
    // 存入缓存
    wx.setStorage({
      // 保证每次页面onshow时将历史记录导入鞋标渲染数据中
      key: 'addressThinkHistoryRenderData',
      // 去重后存入缓存
      data: addressDistinct,
    })
  },
  /**
   * 判断信息是否完善
   * @retrun 返回的状态与实际是否完善相反,意为是否打开信息输入下拉框
   * @param{String}returnType 判断获取什么状态; completeStaus : 获取信息完善状态,else : 获取下拉框是否展开状态
   */
  judgeInfoComplete(returnType = 'completeStaus') {
    let statusList = [false, false]
    statusList[0] = Boolean(JSON.stringify(this.data.addressList[0]) !== "{}" && this.data.addressList[0].area && this.data.addressList[0].address)

    statusList[1] = Boolean(JSON.stringify(this.data.addressList[1]) !== "{}" && this.data.addressList[1].area && this.data.addressList[1].address)

    if (returnType === 'completeStaus') {
      return statusList
    } else {
      if (statusList[0]) return [!statusList[0], !statusList[1]]
      else return [!statusList[0], false]
    }
  },
  /**
   * 选择省市区
   */
  bindRegionChange(e) {
    this.setData({
      // region为二维数组
      [`region[${parseInt(e.currentTarget.dataset.index)}]`]: e.detail.value,
      // [`addressList.${parseInt(e.currentTarget.dataset.index)}.area`]: `${e.detail.value[0]}-${e.detail.value[1]}-${e.detail.value[2]}`,
      [`addressList.${parseInt(e.currentTarget.dataset.index)}`]: {
        ...this.data.addressList[e.currentTarget.dataset.index],
        area: `${e.detail.value[0]}-${e.detail.value[1]}-${e.detail.value[2]}`,
        provinceName: e.detail.value[0],
        cityName: e.detail.value[1],
        countyName: e.detail.value[2],
        address: '', // 更换省市区后清理详细地址
      },
    })
  },
  /**
   * 交换收发货人地址
   */
  reverseAddressList() {
    this.setData({
      addressList: {
        0: this.data.addressList[1],
        1: this.data.addressList[0],
      }
    })
    // 判断信息是否完善,完善这请求
    let status = this.judgeInfoComplete()
    this.setData({ // 打开信息输入下拉框
      pullDownInputShowStatus: this.judgeInfoComplete('获取输入框打开状态')
    })
    if (status[0] && status[1]) {
      this.locadMap()
    }
  },
  /**
   * 清空详细地址历史记录
   */
  clearAddressHistory() {
    let that = this;
    wx.removeStorage({
      key: 'addressThinkHistoryRenderData',
      success(res) {
        that.setData({
          addressThinkHistoryRenderData: []
        })
      },
    })
  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    return shareAppMessage
  },
})