// pages/wdcx/wdcx.js
// 网点查询
import {
  getAddress,
  getAllLogistics,
  shareAppMessage,
} from '../../utils/util.js';
import {
  pageFillter
} from '../../utils/pageFillter.js';

let app = getApp();
let mapCtx;

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    chooseAddress: ['北京市', '北京市', '海淀区'], // 选择地址
    coordinate: {}, // 当前经纬度
    localAddress: '', // 当前地址
    allLogistics: [], // 所有物流公司名
    allLineLogistics: [], // 匹配的所有物流公司网点信息
    lIndex: 0,
    hiddenmodalput: true, // 弹框显示状态
    mapShow: false,
    modalputName: '', // 弹框标题
    modalputContent: '', // 弹框内容
    markerId: '', // 点击的网店下标

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getAddress.then(res => {
      this.setData({
        localAddress: res.address,
        coordinate: res.location,
        chooseAddress: [
          res.address_component.province,
          res.address_component.city,
          res.address_component.district,
        ]
      })

    })
    // 获取所有物流公司名
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
   * 选择地址
   */
  bindPickerChange(e) {
    this.setData({
      chooseAddress: e.detail.value,
      localAddress: e.detail.value.join('')
    })
    this.locadMap()
  },
  /**
   * 物流商
   */
  bindPickerChangeL(e) {
    this.setData({
      lIndex: e.detail.value
    })
    this.locadMap()
  },
  /**
   * 加载地图
   */
  locadMap() {
    let that = this
    app.http.request({
      url: '/wxlogistics/smallpro/outlet/nearby.html',
      data: {
        localAddr: this.data.localAddress,
        logisticId: this.data.allLogistics[this.data.lIndex] ? this.data.allLogistics[this.data.lIndex].id : ''
      },
    }).then(res => {
      if (res.smallproOutletList.length !== 0) {
        // 配置地图气泡
        let markers = res.smallproOutletList.reduce((pre, item, index) => {
          let obj = {
            iconPath: '../../image/mark.png',
            id: index,
            latitude: item.latitude,
            longitude: item.longitude,
            width: 50,
            height: 60,
            callout: {
              content: item.logisticName + '/' + item.name,
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

        that.setData({
          markers,
          allLineLogistics: res.smallproOutletList,
          coordinate: {
            lng: res.smallproOutletList[0].longitude,
            lat: res.smallproOutletList[0].latitude
          }
        })
      } else {
        wx.showToast({
          title: '未能匹配选择地址附近物流网店',
          icon: 'none'
        })
      }
    })
    // // 使用 wx.createMapContext 获取 map 上下文
    // this.mapCtx = wx.createMapContext('myMap')
    // this.mapCtx.moveToLocation()

  },
  /**
   * 点击气泡
   */
  markertap(e) {
    let that = this;
    this.setData({
      mapShow: true,
      hiddenmodalput: false,
      markerId: e.markerId,
      modalputName: `${this.data.allLineLogistics[e.markerId].logisticName}/${this.data.allLineLogistics[e.markerId].name}`,
      modalputContent: `${this.data.allLineLogistics[e.markerId].address}`,
      modalputPhone: `${this.data.allLineLogistics[e.markerId].telephone || ''}`
    })
  },
  /**
   * 下单
   */
  modalConfirm(e) {
    app.router({
      path: '../ksxd/ksxd',
      methods: `title=下单&wId=${this.data.allLineLogistics[this.data.markerId].id}&lId=${this.data.allLineLogistics[this.data.markerId].logisticId}&address=${JSON.stringify([this.data.chooseAddress[0]])}`
    })
    this.setData({
      mapShow: false,
      hiddenmodalput: true,
      modalputName: '',
      modalputContent: '',
      modalputPhone: '',
      markerId: '',
    })
  },
  /**
   * 取消
   */
  modalCancel(e) {
    this.setData({
      mapShow: false,
      hiddenmodalput: true,
      modalputName: '',
      modalputContent: '',
      modalputPhone: '',
      markerId: '',
    })
  },
  /**
   * 打电话
   */
  callPhone(e) {
    let that = this;
    wx.showActionSheet({
      itemList: [`拨打电话${that.data.modalputPhone}`],
      success: function(res) {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ // 调用电话
            phoneNumber: that.data.modalputPhone,
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 生命周期--页面渲染完毕
   */
  onReady(e) {
    this.locadMap()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return shareAppMessage
  },
})