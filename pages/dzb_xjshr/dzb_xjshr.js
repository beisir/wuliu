// pages/wl_index/dzb_xjshr.js
import { pageFillter } from '../../utils/pageFillter.js';
import { ChineseCharactersRegex, telephoneReg, numRegex } from '../../utils/regex.js';

const app = getApp();

pageFillter({
  /**
   * 页面的初始数据
   */
  data: {
    inputRegex: {}, // 保存正则
    inputBlurRegex: {}, // 保存正则
    urlList: [{
      urlType: '上传图片',
      url: '/wxlogistics/smallpro/addressBook/img/detect.html'
    }, {
      urlType: '保存信息',
      url: '/wxlogistics/smallpro/addressBook/saveAddressBook.html'
    }, {
      urlType: '修改信息',
      url: '/wxlogistics/smallpro/addressBook/updateAddressBook.html'
    }],
    infoType: 0,
    addressId: null,
    region: ['北京市', '北京市', '昌平区'],
    contactsInfo: {
      data: null, // 识别后所有数据
      contacter: null, // 姓名
      mobile: null, // 电话
      provinceName: '北京', // 省
      cityName: '北京市', // 市
      countyName: '昌平', // 区
      address: null, // 街道
      status: false, // 标志当前是否是修改
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      infoType: options.infoType || null,
      inputRegex: { // 输入时正则验证
        contacter: ChineseCharactersRegex,
        mobile: numRegex
      },
      inputBlurRegex: { // 失去焦点电话验证
        phone: telephoneReg
      },

      contactsInfo: {
        ...this.data.contactsInfo,
        ...JSON.parse(options.contactsInfo),
        status: JSON.parse(options.contactsInfo).contacter ? true : false,
      },
      region: [
        JSON.parse(options.contactsInfo).provinceName || '北京市',
        JSON.parse(options.contactsInfo).cityName || '北京市',
        JSON.parse(options.contactsInfo).countyName || '昌平区',
      ]
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 上传解析图片
   */
  upLoadImageFile(filePath) {
    wx.showLoading({
      title: '正在识别...',
      mask: true
    })
    let that = this
    wx.uploadFile({
      url: app.http.baseUrl + this.data.urlList[0].url,
      filePath,
      name: 'file',
      success(res) {
        wx.hideLoading()
        let data = JSON.parse(res.data);
        if(data.flag) {
          // 如果识别地址存在才赋值
          if (data.value.provinceName && data.value.cityName && data.value.countyName) {
            that.setData({
              region: [
                data.value.provinceName,
                data.value.cityName,
                data.value.countyName,
              ]
            })
          }
          that.setData({
            contactsInfo: data.value,
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '识别失败请重试'
          })
        }
      },
      fail(err) {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '识别失败请重试'
        })
      }
    })
  },
  /**
   * 选择图片
   */
  chooseImage(e) {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.upLoadImageFile(res.tempFilePaths[0])
      }
    })
  },
  /**
   * 选择省市区
   */
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value,
      'contactsInfo.provinceName': e.detail.value[0],
      'contactsInfo.cityName': e.detail.value[1],
      'contactsInfo.countyName': e.detail.value[2],
    })
  },
  /**
   * 保存提交
   */
  submitData(e) {
    // 正则验证联系人
    if (!ChineseCharactersRegex.test(this.data.contactsInfo.contacter))
      return wx.showToast({
        title: '请输入正确的姓名',
        icon: 'none'
      })
    // 正则验证手机号
    if (!telephoneReg.test(this.data.contactsInfo.mobile))
      return wx.showToast({
        title: '请输入正确手机号',
        icon: 'none'
      })
    if (!this.data.contactsInfo.address)
      return wx.showToast({
        title: '请输入街道',
        icon: 'none'
      })
    // 保存,发起请求
    app.http.request({
      url: this.data.contactsInfo.status ? this.data.urlList[2].url : this.data.urlList[1].url, // 判断当前是保存还是修改
      data: {
        contacter: this.data.contactsInfo.contacter,
        area: `${this.data.contactsInfo.provinceName}-${this.data.contactsInfo.cityName}-${this.data.contactsInfo.countyName}`,
        address: this.data.contactsInfo.address,
        mobile: this.data.contactsInfo.mobile,
        infoType: this.data.infoType,
        addressId: this.data.contactsInfo.addressId || ' '
      }
    }).then(res => {
      if (res.flag) {
        wx.showToast({
          title: '操作成功',
          icon: 'none',
          duration: 1000,
          success() {
            wx.navigateBack()
          }
        })
      } else {
        wx.showToast({
          title: '操作失败请重试',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  /**
   * 输入框改变
   */
  inputValue(e) {
    // if (this.data.inputRegex[e.currentTarget.dataset.type] && !this.data.inputRegex[e.currentTarget.dataset.type].test(e.detail.value))
    //   return this.data.contactsInfo[e.currentTarget.dataset.type] || ''
    this.setData({
      [`contactsInfo.${e.currentTarget.dataset.type}`]: e.detail.value
    })
  }
})