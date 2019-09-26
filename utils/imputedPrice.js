/**
 * 计算价格
 * @return {}
 */
const imputedPrice = (logistics = {}) => {
  /**
   * 物流收费信息
   */
  // let logistics = logistics;
  /**
   * 货物信息
   */
  let goodsInfo = {};
  /**
   * 增值服务信息
   */
  let chooseServer = {};
  /**
   * 使用折扣券信息
   */
  let discountCouponInfo = [];
  // try {
  //   let v = wx.getStorageSync('logistics')
  //   if (v) {
  //     logistics = v
  //   }
  // } catch (e) {}
  try {
    let v = wx.getStorageSync('goodsInfo')
    if (v) {
      goodsInfo = v
    }
  } catch (e) {}
  try {
    let v = wx.getStorageSync('chooseServer')
    if (v) {
      chooseServer = v
      discountCouponInfo = v.wlDiscountList.filter(item => {
        return item.checked === true
      })
    }
  } catch (e) {}
  /**
   * 优惠券折扣
   */
  let discountCoupon = discountCouponInfo[0] ? discountCouponInfo[0].discount : '';
  /**
   * 优惠券id
   */
  let discountId = discountCouponInfo[0] ? discountCouponInfo[0].id : '';
  /**
   * 折扣前纯运费
   */
  let oldStartTotalPrices;
  /**
   * 折扣后纯运费
   */
  let startTotalPrices;
  /**
   * 基础运费
   */
  let basicTotalPrices;
  /**
   * 最低一票价格
   */
  let basePrice = parseFloat(logistics.et || 0);
  /**
   * 货物重量
   */
  let goodsWeight = parseFloat(goodsInfo.goodsWeight || 0)
  /**
   * 货物体积
   */
  let goodsVolume = parseFloat(goodsInfo.goodsVolume || 0)
  /**
   * 重货折扣前价格
   */
  let oldHeavyPrice = parseFloat(logistics.tm || 0);
  /**
   * 重货折扣价格
   */
  let heavyPrice;
  if (discountCoupon) { // 优惠券价格
    heavyPrice = parseFloat(discountCoupon * oldHeavyPrice * 0.1)
  } else { // 香炉折扣价格
    heavyPrice = parseFloat(logistics.heavyPrice || 0);
  }
  /**
   * 重货价格分界
   */
  let heavyDemarcation = parseFloat(logistics.su);
  /**
   * 重货分界折扣前价格
   */
  let oldStateHeavyPirce = parseFloat(logistics.me || 0);
  /**
   * 重货分界折扣价格
   */
  let stateHeavyPirce = parseFloat(logistics.stateHeavyPirce || 0);
  /**
   * 重货折扣前费用
   */
  let oldHeavyTotalPrice = oldHeavyPrice * goodsWeight;
  /**
   * 重货折扣后费用
   */
  let heavyTotalPrice = heavyPrice * goodsWeight;
  // 是否超过重货分界
  if (stateHeavyPirce && heavyDemarcation && (heavyDemarcation * 1000) < goodsWeight) {
    heavyTotalPrice = stateHeavyPirce * goodsWeight;
    oldHeavyTotalPrice = oldStateHeavyPirce * goodsWeight;
  }

  /**
   * 轻货折扣前价格
   */
  let oldLightPrice = parseFloat(logistics.up || 0);
  /**
   * 轻货折扣价格
   */
  let lightPrice = parseFloat(logistics.lightPrice || 0);
  /**
   * 轻货价格分界
   */
  let lightDemarcation = parseFloat(logistics.ag);
  /**
   * 轻货分界折扣前价格
   */
  let oldStateLightPrice = parseFloat(logistics.ty || 0);
  /**
   * 轻货分界折扣价格
   */
  let stateLightPrice = parseFloat(logistics.stateLightPrice || 0);
  /**
   * 轻货折扣前费用
   */
  let oldLightTotalPrice = oldLightPrice * goodsVolume;
  /**
   * 轻货折扣费用
   */
  let lightTotalPrice = lightPrice * goodsVolume;
  // 是否超过轻货边界
  if (lightDemarcation && stateLightPrice && (lightDemarcation * 1000) < goodsVolume) {
    lightTotalPrice = stateLightPrice * goodsVolume;
    oldLightTotalPrice = oldStateLightPrice * goodsVolume;
  }
  // 放入数组并排序
  let priceArray = [lightTotalPrice, heavyTotalPrice, basePrice]
  priceArray.sort((v1, v2) => {
    return v2 - v1
  })
  let oldPriceArray = [oldLightTotalPrice, oldHeavyTotalPrice, basePrice]
  oldPriceArray.sort((v1, v2) => {
    return v2 - v1
  })
  // 排序后第一个为最大值
  startTotalPrices = parseFloat(priceArray[0].toFixed(2))
  oldStartTotalPrices = parseFloat(oldPriceArray[0].toFixed(2))
  // 节省金额
  let discountPrice = parseFloat((oldStartTotalPrices - startTotalPrices).toFixed(2))

  /**
   * 计算后费用详细
   */
  let resultObject = {
    discount: { // 优惠券相关信息
      discountCoupon, // 优惠券折扣
      discountId, // 优惠券Id
      discountPrice, // 优惠价格
    },
    totalPrice: 0, // 总价
    startTotalPrices, // 折扣后纯运费
    oldStartTotalPrices, // 折扣前纯运费
    /**
     * 基本费用(纯运费+上门接货+送货上门+网点自提+燃油附加费+工本费)
     */
    basicTotalPrices: {
      price: 0, // 费用
      detail: { // 费用明细
        "1": {},
        "2": {},
        "3": {},
        "6": {},
        "17": {},
      }
    },
    /**
     * 附加费用(等通知发货+等待通知派送+开箱验货+送货上楼+货物保价+货物保险+包装服务+短信通知+签收回单+运费到付)
     */
    additionTotalPrices: {
      price: 0, // 费用
      detail: { // 费用明细
        "4": {},
        "5": {},
        "7": {},
        "8": {},
        "9": {},
        "10": {},
        "11": {},
        "12": {},
        "13": {},
        "14": {},
      }
    }
  }
  // 计算增值服务
  /**
   * 用户已经选择的增值服务
   */
  let chooseServerInfo;
  // 过滤出用户已经选择的服务
  if (chooseServer.serverInfo) {
    chooseServerInfo = Object.keys(chooseServer.serverInfo).reduce((pre, item) => {
      if (chooseServer.serverInfo[item].flag) pre[item] = chooseServer.serverInfo[item]
      return pre
    }, {})
  }
  // 如果存在用户选择的服务
  if (chooseServerInfo) {
    Object.keys(chooseServerInfo).reduce((pre, item) => {
      // 循环调用增值费用计算方法
      if (item === '9' && !chooseServerInfo[item].resultPrice) {
        // break
      }
      /**
       * 保存每项增值费用的obj
       */
      let priceObj = calculateServer[item](chooseServerInfo[item], goodsWeight, goodsVolume)
      // 到付费用单独处理
      if (item !== '12') {
        // 判断属于那种费用
        if (pre.basicTotalPrices.detail[item]) { // 基础费用
          pre.basicTotalPrices.detail[item] = priceObj
          pre.basicTotalPrices.price = pre.basicTotalPrices.price + priceObj.price
        }

        if (pre.additionTotalPrices.detail[item]) {
          pre.additionTotalPrices.detail[item] = priceObj
          pre.additionTotalPrices.price = pre.additionTotalPrices.price + priceObj.price
        }
      }
      return pre
    }, resultObject)

    // 单独计算运费到付
    if (!chooseServerInfo['12']) {
      resultObject.additionTotalPrices.detail['12'] = {}
    } else if (chooseServerInfo['12'] && (chooseServerInfo['12'].type === '0' || chooseServerInfo['12'].type === 'true')) { // 百分比计算
      /**
       * 百分比费用
       */
      let cPrice = resultObject.basicTotalPrices.price * parseFloat(chooseServerInfo['12'].valueMap['24_01']) * 0.01
      /**
       * 最低一票
       */
      let bPrice = parseFloat(chooseServerInfo['12'].valueMap['24_02'])
      /**
       * 费用
       */
      let p = cPrice > bPrice ? cPrice : bPrice
      resultObject.additionTotalPrices.detail['12'] = {
        price: p,
        text: p + '元',
        title: '运费到付'
      }
      // 同步更改附加费用
      resultObject.additionTotalPrices.price = resultObject.additionTotalPrices.price + p
    } else if (chooseServerInfo['12'] && (chooseServerInfo['12'].type === '1' || chooseServerInfo['12'].type === 'false')) { // 固定费哟过
      // 运费
      let p = parseFloat(chooseServerInfo['12'].valueMap['25_11'])

      resultObject.additionTotalPrices.detail['12'] = {
        price: p,
        text: p + '元',
        title: '运费到付'
      }
      // 同步更改附加费用
      resultObject.additionTotalPrices.price = resultObject.additionTotalPrices.price + p
    } else {
      resultObject.additionTotalPrices.detail['12'] = {
        price: 0,
        text: '免费',
        title: '运费到付'
      }
    }
  }
  // 计算最终折扣预估总价
  // 总价(折扣后总价) = 基础费用(此处不含纯运费) + 附加费用 + 纯运费
  resultObject.totalPrice = (resultObject.additionTotalPrices.price + resultObject.basicTotalPrices.price + resultObject.startTotalPrices).toFixed(2)

  return resultObject
}
/**
 * 保存计算增值服务的方法
 */
const calculateServer = {
  /**
   * 上门接货计算
   */
  "1" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '上门接货'
    }
    let hPrice = parseFloat(item.calculateValue) * goodsWeight
    let lPrice = parseFloat(item.calculateValue) * goodsVolume * 250
    if (hPrice > lPrice) return {
      price: hPrice,
      text: hPrice.toFixed(2) + '元',
      title: '上门接货'
    }
    else return {
      price: lPrice,
      text: lPrice.toFixed(2) + '元',
      title: '上门接货'
    }
  },
  /**
   * 送货上门计算
   */
  "2" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '送货上门'
    }
    let hPrice = parseFloat(item.calculateValue) * goodsWeight
    let lPrice = parseFloat(item.calculateValue) * goodsVolume * 250
    if (hPrice > lPrice) return {
      price: hPrice,
      text: hPrice.toFixed(2) + '元',
      title: '送货上门'
    }
    else return {
      price: lPrice,
      text: lPrice.toFixed(2) + '元',
      title: '送货上门'
    }
  },
  /**
   * 燃油附加费
   */
  "3" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '燃油附加费'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '燃油附加费'
    }
  },
  /**
   * 开箱验货
   */
  "4" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '开箱验货'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '开箱验货'
    }
  },
  /**
   * 送货上楼
   */
  "5" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '送货上楼'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '送货上楼'
    }
  },
  /**
   * 网点自提
   */
  "6" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '网点自提'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '网点自提'
    }
  },
  /**
   * 等通知发货
   */
  "7" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '等通知发货'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '等通知发货'
    }
  },
  /**
   * 等通知派送
   */
  "8" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '等通知派送'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '等通知派送'
    }
  },
  /**
   * 货物保价
   */
  "9" (item, goodsWeight, goodsVolume) {
    if (!item.resultPrice) return {
      price: 0,
      text: null,
      title: '货物保价'
    }
    return {
      price: parseFloat(item.resultPrice || 0),
      text: parseFloat(item.resultPrice || 0).toFixed(2) + '元',
      title: '货物保价'
    }
  },
  /**
   * 包装服务
   */
  "10" () {
    return {
      price: 0,
      text: '面议',
      title: '包装服务'
    }
  },
  /**
   * 货物保险
   */
  "11" (item, goodsWeight, goodsVolume) {
    if (!item.resultPrice) return {
      price: 0,
      text: null,
      title: '货物保险'
    }
    return {
      price: parseFloat(item.resultPrice),
      text: parseFloat(item.resultPrice).toFixed(2) + '元',
      title: '货物保险'
    }
  },
  /**
   * 到付
   */
  "12" () {
    // return {}
  },
  /**
   * 短信通知服务
   */
  "13" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '短信通知服务'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '短信通知服务'
    }
  },
  /**
   * 签收回单
   */
  "14" (item) {
    if (item.type === '0' || item.type === 'true') return {
      price: 0,
      text: item.calculateValue,
      title: '签收回单'
    }
    return {
      price: parseFloat(item.valueMap[item.chooseType]),
      text: parseFloat(item.valueMap[item.chooseType]).toFixed(2) + '元',
      title: '签收回单'
    }
  },
  /**
   * 工本费
   */
  "17" (item, goodsWeight, goodsVolume) {
    let price;
    if (!item.calculateValue) return 0
    if (item.calculateValue === '免费' || item.calculateValue === '面议') return {
      price: 0,
      text: item.calculateValue,
      title: '工本费'
    }
    return {
      price: parseFloat(item.calculateValue),
      text: parseFloat(item.calculateValue).toFixed(2) + '元',
      title: '工本费'
    }
  },
}

module.exports = {
  imputedPrice
}