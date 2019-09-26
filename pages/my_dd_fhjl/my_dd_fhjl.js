import {
  ajax
} from '../../utils/util.js';
import {
  pageFillter
} from '../../utils/pageFillter.js';

const app = getApp();

pageFillter({
  /**
   * 页面的初始数据
   */
  data: {
    keywords: '',
    showFlag: true,
    modellist: [], // 列表数据
    // 筛选栏数组
    fillateList: [{ // 月份筛选
      index: 0,
      content: [{
        text: '时间',
        value: ''
      }, {
        text: '近一个月的',
        value: 30
      }, {
        text: '近三个月的',
        value: 90
      }, {
        text: '近六个月的',
        value: 180
      }],
      styleStatus: false
    }, {
      index: 1,
      content: [{
        text: '升序',
        value: 'asc'
      }, {
        text: '降序',
        value: 'desc'
      }],
      styleStatus: false
    }, {
      index: 9,
      content: [{
        text: '未受理',
        value: '0'
      }, {
        text: '已受理',
        value: '1'
      }, {
        text: '已撤销',
        value: '2'
      }, {
        text: '拒绝',
        value: '3'
      }, {
        text: '运输中',
        value: '4'
      }, {
        text: '揽件失败',
        value: '5'
      }, {
        text: '已签收',
        value: '6'
      }, {
        text: '异常签收',
        value: '7'
      }, {
        text: '已撤销已处理',
        value: '8'
      }, {
        text: '状态',
        value: ''
      }, ],
      styleStatus: false
    }, ],
    count: 0, // 订单总数
    requestUrl: [{
      urlType: '获取所有订单',
      url: '/wxlogistics/smallpro/order/get/orders.html',
    }, ],
    rebateTypeDic: {
      '0': '促销折扣',
      '1': '新用户尊享',
      '2': '限时折扣',
      '3': '促销活动',
    },
    page: 0,
    pageSum: 1,
  },
  /**
   * 生命周期--页面加载
   */
  onLoad(opts) {
    this.setData({
      keywords: opts.telphone || ''
    })
    this.getRenderData()
  },
  /**
   * 生命周期--页面显示
   */
  onShow() {

  },
  /**
   * 页面销毁
   */
  onUnload() {
    // 当当前页面卸载前中断所有未完成的请求任务
    this.data.requestUrl.forEach((item, index) => {
      app.http.requestAbort[item.url] && app.http.requestAbort[item.url].abort()
    })
  },
  /**
   * 获取render数据
   * @param getType 区别是刷新/初次加载,或者上拉加载
   */
  getRenderData(getType = 'refresh') {
    this.setData({
      showFlag: true
    })
    let page = this.data.page + 1;
    if (getType === 'onLoad') { // 是否是上拉加载
      if (page > this.data.pageSum) {
        // 没有下一页数据现实没有更多
        return wx.showToast({
          title: '没有了~~~',
          duration: 1000,
          icon: 'none'
        })
      }
    } else { // 下拉刷新前清空数据
      this.setData({
        modellist: []
      })
      page = 1
    }
    // 发请求
    app.http.request({
      ...this.data.requestUrl[0],
      data: {
        page,
        pageSize: 10,
        Keyword: this.data.keywords,
        latelyDays: this.data.fillateList[0].content[this.data.fillateList[0].index].value,
        sort: this.data.fillateList[1].content[this.data.fillateList[1].index].value,
        showGot: this.data.fillateList[2].content[this.data.fillateList[2].index].value,
      }
    }).then(res => {
      if (res && res.orders && res.orders.length !== 0) {
        this.setData({
          modellist: [...this.data.modellist, ...res.orders],
          count: res.page.count,
          page,
          pageSum: res.page.pages
        })
      } else {
        this.setData({
          showFlag: false,
          count: 0
        })
      }
      wx.stopPullDownRefresh() // 关闭下拉刷新动画
    })
  },
  /**
   * 订单详情
   */
  orderDetail(e) {
    wx.navigateTo({
      url: `../ddxq/ddxq?orderId=${e.currentTarget.dataset.orderid}&title=订单详情`,
    })
  },
  /**
   * 筛选选择
   */
  filtrateChange(e) {
    this.setData({
      [`fillateList[${e.currentTarget.dataset.index}].index`]: e.detail.value,
      [`fillateList[${e.currentTarget.dataset.index}].styleStatus`]: false
    })
    this.getRenderData()
  },
  /**
   * picker遮罩开启
   */
  pickerOpen(e) {
    this.setData({
      [`fillateList[${e.currentTarget.dataset.index}].styleStatus`]: true
    })
  },
  /**
   * picker遮罩关闭
   */
  pickenCancel(e) {
    this.setData({
      [`fillateList[${e.currentTarget.dataset.index}].styleStatus`]: false
    })
  },
  /**
   * 撤销订单
   */
  cancelOrder(e) {

  },
  /**
   * 关键字搜索
   */
  inputSearch(e) {
    this.setData({
      keywords: e.detail.value
    })
    this.getRenderData()
  },
  /**
   * 再来一单
   */
  orderAgain(e) {
    app.http.request({
      url: '/wxlogistics/smallpro/order/orderDetail.html',
      data: {
        orderId: e.currentTarget.dataset.orderid
      }
    }).then(res => {
      let goodsInfo = { // 货物信息
        goodsName: res.value.oderDetail.goodsName,
        goodsNumber: res.value.oderDetail.goodsNumber,
        goodsWeight: res.value.oderDetail.goodsWeight,
        goodsVolume: res.value.oderDetail.goodsVolume,
        goodsAmount: res.value.oderDetail.goodsAmount,
      }
      let SaddArray = res.value.oderDetail.consignerAdd.split('-')
      let RaddArray = res.value.oderDetail.receiveAdd.split('-')
      let addressList = { // 发/收货地址
        "0": {
          contacter: res.value.oderDetail.consignerName,
          area: res.value.oderDetail.consignerAdd,
          address: res.value.oderDetail.consignerAddDetail,
          mobile: res.value.oderDetail.consignerMobile,
          provinceName: SaddArray[0],
          cityName: SaddArray[1],
          countyName: SaddArray[2],
        },
        "1": {
          contacter: res.value.oderDetail.receiveName,
          area: res.value.oderDetail.receiveAdd,
          address: res.value.oderDetail.receiveAddDetail,
          mobile: res.value.oderDetail.receiveMobile,
          provinceName: RaddArray[0],
          cityName: RaddArray[1],
          countyName: RaddArray[2],
        }
      }
      let logistics = { // 物流商信息
        vn: res.value.oderDetail.logisticsId, // 物流商id
        id: res.value.oderDetail.lineId, // 线路id
        et: res.value.oderDetail.lowestVote, // 最低一票
        tm: res.value.oderDetail.heavyPrice, //重货折扣前价格
        heavyPrice: res.value.oderDetail.rebateHeavyPrice,
        su: res.value.oderDetail.heavyLimit,
        me: res.value.oderDetail.heavyPriceTow,
        stateHeavyPirce: res.value.oderDetail.rebateHeavyPrice2,
        lightPrice: res.value.oderDetail.rebateLightPrice,
        up: res.value.oderDetail.lightPrice,
        ag: res.value.oderDetail.lightLimit,
        ty: res.value.oderDetail.lightPriceTow,
        stateLightPrice: res.value.oderDetail.rebateLightPrice2,
        city: res.value.oderDetail.consignerAdd,
        eCity: res.value.oderDetail.receiveAdd,
        cb: res.value.oderDetail.logisticsName,
        heavySale: `(${res.value.oderDetail.rebate}折)`,
        lightSale: `(${res.value.oderDetail.rebate}折)`,
        jy: res.value.oderDetail.transportLimitations,
        vu: res.value.oderDetail.productName,
        la: this.data.rebateTypeDic[res.value.oderDetail.rebateType]
      }
      let storageList = {
        'goodsInfo': goodsInfo,
        'addressList': addressList,
        'logistics': logistics
      }
      Object.keys(storageList).forEach((item, index, arr) => {
        wx.setStorage({
          key: item,
          data: storageList[item],
          success(res) {
            wx.removeStorage({
              key: 'chooseServer',
              success: function(res) {
                if (index === arr.length-1) {
                  wx.navigateTo({
                    url: '../ksxd/ksxd?title=再来一单',
                  })
                }
              },
            })
          }
        })
      })
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getRenderData()
  },
  /**
   * 上拉加载
   */
  onReachBottom() {
    this.getRenderData('onLoad')
  }
})