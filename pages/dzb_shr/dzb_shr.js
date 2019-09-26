// pages/wl_index/dzb_shr.js
import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp();

pageFillter({

  /**
   * 页面的初始数据
   */
  data: {
    urlList: [{
      urlType: '发/收货人地址',
      url: '/wxlogistics/smallpro/addressBook/getAddressBookPageList.html'
    }, {
      urlType: '删除地址',
      url: '/wxlogistics/smallpro/addressBook/deleteAddressBook.html'
    }, {
      urlType: '设置默认地址',
      url: '/wxlogistics/smallpro/addressBook/updateAddressBookDefault.html'
    }],
    reselist: [{
        title: '发货人地址',
        renderData: []
      },
      {
        title: '收货人地址',
        renderData: []
      }
    ],
    currentIndex: 0, // 切换index
    // defaultAddress: null, // 默认地址Id
    showSwiperIndex: null, // 当需要锁定显示时改变该值(例如从下单页进入,选择地址时)
    lineAddress: 0, // 搜索线路的地址
    page: 0,
    pageSum: 1,
  },
  /**
   * 生命周期
   */
  onLoad(opts) {
    // type值为从下单页面进入,标志当前选择发货/收货人地址
    if (opts.type) {
      this.setData({
        currentIndex: parseInt(opts.type),
        showSwiperIndex: parseInt(opts.type),
        lineAddress: opts.lineAddress || '' // 线路搜索的地址,用于筛选页面渲染数据
      })
    }
    // console.log(opts.lineAddress)
    // if (opts.lineAddress) {
    //   wx.showToast({
    //     title: `以为您过滤出${opts.lineAddress}的地址`,
    //     icon: 'none'
    //   })
    // }
  },
  onShow() {
    this.getRenderData()
  },
  // tabItem 组件回调函数
  changeCurrentIndex(e) {
    this.setData({
      currentIndex: e.detail.currentIndex
    })
  },
  /**
   * 切换
   */
  crrentChange(event) {
    event.detail.source === 'touch' && this.setData({
      // 判断curindex变化是否是由用户滑动触发，属于优化项
      currentIndex: event.detail.current
    })
    if (this.data.reselist[this.data.currentIndex].renderData.length === 0) {
      this.getRenderData()
    }
  },
  /**
   * 点击删除
   */
  showmo(e) {
    let {
      item
    } = e.currentTarget.dataset,
      that = this;
      // 禁止删除默认地址
    // if (e.currentTarget.dataset.item.addressId === this.data.defaultAddress && this.data.currentIndex === 0) {
    //   return wx.showToast({
    //     title: '不能删除默认地址',
    //     icon: 'none'
    //   })
    // }

    wx.showModal({
      title: '提示',
      content: '删除将不可恢复,您确定要删除吗?',
      success: function(res) {
        if (res.confirm) {
          app.http.request({
            ...that.data.urlList[1],
            data: {
              addressId: item.addressId
            }
          }).then(res => {
            if (res.flag) {
              that.getRenderData()
              wx.showToast({
                title: '删除成功'
              })
            } else {
              wx.showToast({
                title: '删除失败,请重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  /**
   * 请求地址联系人数据
   */
  getRenderData(getType = 'refresh') {
    let page = this.data.page + 1
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
        [`reselist[${this.data.currentIndex}].renderData`]: [],
      })
      page = 1
    }
    app.http.request({
      ...this.data.urlList[0],
      data: {
        page,
        pageSize: 10,
        infoType: this.data.currentIndex,
        area: this.data.lineAddress || ' '
      }
    }).then(res => {
      // 过滤出默认地址
      // let defaultAddress = res.value.addressBookList.filter((item, index, arr) => {
      //   return item.isDefault === '1'
      // })[0] || {}
      res.flag && this.setData({
        [`reselist[${this.data.currentIndex}].renderData`]: [...this.data.reselist[this.data.currentIndex].renderData, ...res.value.addressBookList],
        // defaultAddress: defaultAddress.addressId || this.data.defaultAddress, // 保存默认地址
        page,
        pageSum: res.value.page.pages
      })
      wx.stopPullDownRefresh() // 关闭下拉刷新动画
      if (this.data.lineAddress) {
        wx.showToast({
          title: `以为您过滤出${this.data.lineAddress}的地址`,
          icon: 'none'
        })
      }
    })
  },
  /**
   * 弹框提示用户是否拨打电话
   */
  callPhone(e) {
    app.callPhone(e.currentTarget.dataset.phone)
  },
  /**
   * 跳转路由
   */
  navigateTo(e) {
    if (e.currentTarget.dataset.path === 'ksxd') { // 但点击的是发货时
      let addressList = {
        0: {},
        1: e.currentTarget.dataset.item
      }
      wx.setStorage({
        key: 'addressList',
        data: addressList,
      })
    }
    wx.navigateTo({
      url: `/pages/${e.currentTarget.dataset.path}/${e.currentTarget.dataset.path}?infoType=${this.data.currentIndex}&contactsInfo=${JSON.stringify(e.currentTarget.dataset.item || "{}")}&title=${e.currentTarget.dataset.title}&telphone=${e.currentTarget.dataset.item && e.currentTarget.dataset.item.mobile || ''}`
    })
  },
  /**
   * 切换默认地址
   */
  radioChange(e) {
    // if (e.detail.value === this.data.defaultAddress) return
    // app.http.request({
    //   ...this.data.urlList[2],
    //   data: {
    //     addressIdOld: this.data.defaultAddress,
    //     addressId: e.detail.value,
    //     infoType: this.data.currentIndex
    //   }
    // }).then(res => {
    //   res.value && this.setData({
    //     defaultAddress: e.detail.value
    //   })
    //   wx.showToast({
    //     title: '更改成功',
    //   })
    // })
  },
  /**
   * 从下单页面过来时选择地址
   */
  chooseAddress(e) {
    let that = this;
    if (this.data.showSwiperIndex !== null) {
      if (this.data.showSwiperIndex !== this.data.currentIndex) {
        return wx.showToast({
          title: `请选择${this.data.reselist[this.data.showSwiperIndex].title}`,
          icon: 'none'
        })
      }
      let addressList = [{}, {}];
      try {
        var arr = wx.getStorageSync('addressList');
        if (arr) addressList = arr
      } catch (e) {
        console.log(e)
      }
      addressList[this.data.showSwiperIndex] = e.currentTarget.dataset.chooseaddress
      wx.setStorage({
        key: 'addressList',
        data: {
          ...addressList
        },
        success(res) {
          if (!that.data.lineAddress) {
            wx.removeStorage({
              key: 'logistics',
              success(res) {
                wx.removeStorage({
                  key: 'chooseServer',
                  success(res) {
                    wx.navigateBack()
                  },
                })
              },
            })
          } else {
            wx.navigateBack()
          }
        },
        fail(err) {
          wx.showToast({
            title: '选择失败,请重试',
            icon: 'none'
          })
        }
      })
    }
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