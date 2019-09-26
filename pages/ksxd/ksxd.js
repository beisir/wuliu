// pages/ksxd/ksxd.js
// 快速下单

import {
    pageFillter
} from '../../utils/pageFillter.js';
import {
    telephoneReg,
    phoneReg,
    phoneReg400,
    phoneReg800,
} from '../../utils/regex.js';
import {
    imputedPrice
} from '../../utils/imputedPrice.js';
import {
    goodsInfoRules
} from '../../utils/rule.js';
import {
    getAddress,
    serverDictionary,
    ObjectDistinct,
    shareAppMessage,
} from '../../utils/util.js';

const app = getApp();

pageFillter({
    /**
     * 页面的初始数据
     */
    data: {
        urlList: [{
            url: '/wxlogistics/smallpro/orderCommit/saveOrder.html',
            urlType: '提交订单'
        }, {
            url: '/wxlogistics/smallpro/line/prior.html',
            urlType: '获取推荐物流'
        }, {
            url: '/wxlogistics/smallpro/order/getOutlets.html',
            urlType: '请求网点'
        }, {
            url: '/wxlogistics/smallpro/productAppreciation/getProductAppreciation.html',
            urlType: '请求增值服务'
        }, {
            url: '/wxlogistics/smallpro/addressBook/getAddress.html',
            urlType: '详细地址联想'
        }], // 请求路径
        storageList: ['addressList', 'logistics', 'goodsInfo', 'chooseServer', 'addressThinkHistoryRenderData'], // 获取缓存数据
        logistics: null, // 物流商信息
        addressList: { // 保存收发货人信息,注意是对象类型,如果改为数组会出异常
            0: {},
            1: {}
        }, // 地址 0: 发货地址, 1: 收货地址
        addressListOpts: null, // 保存从搜索结果页带过来的地址
        // lineAddress: [], // 搜索线路地址 0: 发货地址, 1: 收货地址
        addressThinkShowStatus: false, // 输入联系人联想地址状态
        addressThinkShowIndex: '', // 激活输入联系人联想地址状态的下标
        addressThinkRenderData: [], // 详细地址联想数据
        addressThinkHistoryRenderData: [], // 详细地址联想数据历史记录
        addressThinkHistoryStatus: true, // 是否显示历史记录控制状态
        goodsInfo: {
            goodsWeight: '1',
            // goodsVolume: 0,
            // goodsNumber: 1,
        }, // 货物信息
        pullDownInputShowStatus: [false, false], // 下拉菜单显示状态
        recommendLogistics: [], // 推荐物流商
        radioIndex: 0, // 选中物流商下标
        lineCollect: {}, // 物流商线路汇总数据
        recommendGetFlag: true, // 禁止重复请求标志位
        paymentArray: ['发货人支付(现付)'], // 支付方式数组
        paymentType: 0, // 保存支付方式
        chooseServer: null, // 选择的增值服务
        discountCoupon: [], // 优惠券信息
        costBreakdown: null, // 费用明细
        sendBranchArray: [], // 发货网点
        sendBranchType: 0, // 当前选择发货网点
        recieveBranchArray: [], // 收货网点
        recieveBranchType: 0, // 当前选择收货网点
        cleanFreightArr: [], // 推荐物流为你节省纯运费
        lId: '', // 附近物流进入时所带的线路Id
        region: [
            ['北京市', '北京市', '海淀区'],
            ['省', '市', '区']
        ], // 选择省市区
        requestTimeout: '', // 保存联想地址延时请求的timer
        serverDictionary: { // 增值服务key翻译字典
            "1": "包接",
            "2": "包送",
            "3": "包燃油费",
            "4": "开箱验货免费",
            "5": "上楼免费",
            "6": "自提免费",
            "7": "等通知发货免费",
            "8": "等通知派送免费",
            "9": "货物保价免费",
            "10": "包装服务免费",
            "11": "货物保险免费",
            "12": "运费到付免费",
            "13": "短信免费",
            "14": "签收回单免费",
            "15": "时效承诺免费",
            "16": "一票多件免费",
            "17": "免工本费",
        },
        hiddenmodalput: true, // 确认订单信息弹框状态
        formId: '', // 订单提交formId
        showSidebarFlag: true, // 控制优惠券弹框显示隐藏
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.wditem) {
            let wditem = JSON.parse(options.wditem)
            this.setData({
                lId: wditem.logisticId || '', // 附近物流进入时所带的线路Id
                sendBranchArray: [
                    wditem
                ]
            })
        }
        // 判断是否有从搜索结果页带入的地址,有则用
        if (options.addressList) {
            let addressListOpts = JSON.parse(options.addressList)
            this.setData({
                addressListOpts,
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 当前页面,onshow主要用于
        let that = this;
        this.data.storageList.forEach((item) => {
            wx.getStorage({
                key: item,
                success(res) {
                    let data = res.data

                    // 解决初次进入,选择收货人地址后,会丢失和定位的发货人地址
                    if (item === 'addressList') {
                        if (JSON.stringify(data[0]) === '{}') {
                            data = {
                                ...data,
                                0: that.data.addressList[0]
                            }
                        }
                        // 解决初次进入,选择发货人地址后,会丢失输入的收货人地址
                        if (JSON.stringify(data[1]) === '{}') {
                            data = {
                                ...data,
                                1: that.data.addressList[1],
                            }
                        }
                    }

                    if (item === 'logistics') {
                        data.checked = 'true' // 物流推荐选中状态
                        that.setData({
                            recommendLogistics: [
                                data
                            ]
                        })
                        // 避免重复请求
                        let id = that.data.logistics ? that.data.logistics.id : ' '
                        if (id !== data.id) {
                            // 获取增值服务
                            that.getServerData(data.id)
                            // 获取网点信息
                            that.getBranchData(data.id)
                        }
                    }
                    // if (item === 'chooseServer') {
                    //   console.log(that.data.chooseServer)
                    //   if (that.data.chooseServer && that.data.chooseServer.id !== data.id) {
                    //     that.getServerData(data.id)
                    //   }
                    // }

                    that.setData({
                        [`${item}`]: data,
                    })

                    // 计算费用
                    that.getPrice()
                    // // 获取信息完善情况,决定是否打开信息输入下拉框
                    // that.setData({ // 打开信息输入下拉框
                    //   pullDownInputShowStatus: that.judgeInfoComplete('获取下啦状态')
                    // })
                    // 当收/发货地址与物流商信息都存在才请求推荐物流商
                    if (that.data.addressList[0].area && that.data.addressList[1].area) {
                        that.recommendLogistics();
                    }

                    // 当存在收/发货人地址时对应修改
                    if (that.data.addressList['0'].area) {
                        that.setData({
                            'region[0]': [that.data.addressList['0'].provinceName, that.data.addressList['0'].cityName, that.data.addressList['0'].countyName,]
                        })
                    }
                    if (that.data.addressList['1'].area) {
                        that.setData({
                            'region[1]': [that.data.addressList['1'].provinceName, that.data.addressList['1'].cityName, that.data.addressList['1'].countyName,]
                        })
                    }
                },
                fail(err) {
                    // 重制为null
                    if (item !== 'addressList' && item !== 'goodsInfo' && item !== 'addressThinkHistoryRenderData') {
                        that.setData({
                            [item]: null
                        })
                    }
                    if (item === 'chooseServer' && that.data.logistics) {
                        that.getServerData(that.data.logistics.id)
                    }
                    // 解决当缓存中不存在选择的物流商信息时,解决物流数据叠加问题
                    if (item === 'logistics') that.setData({
                        recommendLogistics: [],
                        // sendBranchArray: [], // 发货网点
                        // sendBranchType: 0, // 当前选择发货网点
                        // recieveBranchArray: [], // 收货网点
                        // recieveBranchType: 0, // 当前选择收货网点
                    });

                    if (item === 'addressList') {
                        if (that.data.addressListOpts) {
                            // 当缓存中没有选择的收发货人地址信息时
                            that.setData({
                                addressList: that.data.addressListOpts
                            })
                        } else {
                            // 获取定位地址
                            getAddress.then(res => {
                                let addressList = { // 初始化收发货地址信息
                                    0: {
                                        ...that.data.addressList['0'],
                                        area: `${res.address_component.province}-${res.address_component.city}-${res.address_component.district}`,
                                        provinceName: res.address_component.province,
                                        cityName: res.address_component.city,
                                        countyName: res.address_component.district,
                                        address: res.address,
                                    },
                                    1: {}
                                }
                                that.setData({
                                    addressList,
                                })
                                // 由于获取地址promis为异步,当从搜索结果页进入时,代码执行到onshow里的根据是否有地址请求推荐物流商时,地址还未赋值,一直显示地址为空,导致不请求推荐线路
                                if (that.data.addressList[0].area && that.data.addressList[1].area) {
                                    that.recommendLogistics();
                                }
                            })
                        }

                        // 当存在收/发货人地址时对应修改
                        if (that.data.addressList[0].area) {
                            that.setData({
                                'region[0]': [that.data.addressList['0'].provinceName, that.data.addressList[0].cityName, that.data.addressList['0'].countyName,]
                            })
                        }
                        if (that.data.addressList['1'].area) {
                            that.setData({
                                'region[1]': [that.data.addressList['1'].provinceName, that.data.addressList['1'].cityName, that.data.addressList['1'].countyName,]
                            })
                        }

                        if (that.data.addressList[0].area && that.data.addressList[1].area) {
                            that.recommendLogistics();
                        }
                    }
                }
            })
        })
    },

    /**
     * 生命周期--页面卸载前
     */
    onUnload() {
        this.data.urlList.forEach(item => {
            if (app.http.requestAbort[item.url]) app.http.requestAbort[item.url].abort()
        })
        this.data.storageList.forEach((item, index) => {
            if (item !== 'addressThinkHistoryRenderData') { // 不清空详细地址缓存
                wx.removeStorage({
                    key: item,
                })
            }
        })
    },

    /**
     * 选择地址
     */
    chooseAddress(e) {
        app.router({
            path: `../dzb_shr/dzb_shr`,
            methods: `type=${e.currentTarget.dataset.type}&title=地址簿`
        })
    },
    /**
     * 选择物流公司
     */
    chooseLogistics(e) {
        if (this.data.addressList[0].area && this.data.addressList[1].area) {
            wx.navigateTo({
                url: `../sslx/sslx?address=${this.data.addressList[0].area}到${this.data.addressList[1].area}&chooseFlag=true&lId=${this.data.lId}&title=${this.data.addressList[0].provinceName}-${this.data.addressList[1].provinceName}`,
            })
        } else {
            wx.showToast({
                title: '请选择发/收货人地址',
                icon: 'none'
            })
        }
    },

    /**
     * 获取推荐物流公司
     */
    recommendLogistics() {
        app.http.request({
            ...this.data.urlList[1],
            data: {
                addr: `${this.data.addressList[0].area}/${this.data.addressList[1].area}`,
                lineId: this.data.logistics ? this.data.logistics.id : ''
            }
        }).then(res => {
            if (res && (res.docsOther || res.docsPrior)) {
                let renderData = new Array(2)
                // 这样会导致物流商数据数组 0 1 下标为空,优选推荐上移
                // renderData = [
                //   ...this.data.recommendLogistics,
                //   ...res.docsOther || '', // 其他推荐
                // ]
                renderData[0] = this.data.recommendLogistics[0] || (res.docsOther && res.docsOther[0] || '')
                renderData[1] = this.data.recommendLogistics[0] ? (res.docsOther && res.docsOther[0] || '') : (res.docsOther && res.docsOther[1] || '')

                this.setData({
                    lineCollect: { // 线路信息
                        logisticNum: res.logisticNum,
                        lineNum: res.lineNum,
                    },
                    recommendLogistics: [
                        ...renderData,
                        ...res.docsPrior // 优选推荐
                    ],
                })
                // 调用计算
                this.getPrice()
            }
        })
    },
    /**
     * 选择推荐物流公司
     */
    radioChange(e) {
        let that = this;
        // 更改推荐物流商选中状态
        let recommendLogistics = that.data.recommendLogistics.map((item, index) => {
            if (index == e.detail.value) {
                item.checked = true
                return item
            } else {
                item.checked = false
                return item
            }
        })
        this.setData({ // 更改选中物流信息
            logistics: that.data.recommendLogistics[e.detail.value],
            radioIndex: parseInt(e.detail.value),
            recommendLogistics
        })

        wx.setStorage({ // 同步修改缓存
            key: 'logistics',
            data: that.data.recommendLogistics[e.detail.value],
            success(res) {
                // that.getPrice() // 计算费用
                that.getBranchData(that.data.recommendLogistics[e.detail.value].id) // 获取网点      
                // 重新请求增值服务
                that.getServerData(that.data.logistics.id, e.detail.value)
            }
        })
    },

    /**
     * 选择增值服务
     */
    toChooseServer() {
        if (this.data.logistics) {
            wx.navigateTo({
                url: `../fwyq/fwyq?title=增值服务`,
            })
        } else {
            wx.showToast({
                title: '请选择物流公司',
                icon: 'none'
            })
        }
    },
    /**
     * 请求增值服务信息
     * @params id 线路id
     */
    getServerData(id, index = 0) {
        let that = this;
        app.http.request({
            ...this.data.urlList[3],
            data: {
                lineId: id
            }
        }).then(res => {
            if (res && res.flag) {
                // 是否支持到付
                that.setData({
                    paymentArray: ['发货人支付(现付)'],
                    paymentType: 0,
                })
                if (res.value.serverInfo['12']) {
                    that.setData({
                        paymentArray: ['发货人支付(现付)', '收货人支付(到付)'],
                    })
                }
                // 单独判断是否选择到付
                if (res.value.serverInfo['12'] && res.value.serverInfo['12'].flag) that.setData({
                    paymentType: 1
                })
                // 将必选项默认选中
                let chooseServer = res.value.serverInfo
                Object.keys(chooseServer).forEach(item => {
                    if (chooseServer[item].isRequired === '1') {
                        chooseServer[item].flag = true
                    }
                })
                this.setData({
                    chooseServer: {
                        ...res.value,
                        id: that.data.logistics.id,
                        serverInfo: chooseServer,
                    }
                })
                wx.setStorage({
                    key: 'chooseServer',
                    data: {
                        ...res.value,
                        id: that.data.logistics.id,
                        serverInfo: chooseServer
                    },
                    success(res) {
                        that.getPrice(index)
                    }
                })
            }
        })
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

        // 货物信息输入验证
        if (goodsInfoRules(this.data.goodsInfo, e.currentTarget.dataset.type)) return wx.showToast({
            title: goodsInfoRules(this.data.goodsInfo, e.currentTarget.dataset.type),
            icon: 'none'
        })

        wx.setStorage({
            key: 'goodsInfo',
            data: that.data.goodsInfo,
            success() {
                that.getPrice()
            }
        })
    },
    /**
     * 获取计算后价格,并保存
     * @params indexChoose 选择的推荐物流商下标
     */
    getPrice(indexChoose = 0) {
        // 调用计算
        let costBreakdown = imputedPrice(this.data.logistics ? this.data.logistics : {}),
            arr, // 保存推荐物流纯运费
            cleanFreightArr; // 保存节省费用
        this.setData({
            costBreakdown,
        })
        if (this.data.logistics) {

            // 筛选出纯运费
            arr = this.data.recommendLogistics.reduce((pre, item, index) => {
                let price = imputedPrice(item).startTotalPrices
                pre.push(price)
                return pre
            }, [])

            // 将所有纯运费与点击选择的对比,算出节省费用,按照原数组下标放入数组中
            cleanFreightArr = arr.reduce((pre, item, index) => {
                let price = (arr[indexChoose] - item || 0).toFixed(2)
                pre.push(price)
                return pre
            }, [])

            this.setData({
                cleanFreightArr,
            })
        }
    },
    /**
     * 获取网点信息
     */
    getBranchData(id) {
        app.http.request({
            ...this.data.urlList[2],
            data: {
                lineId: id,
                sendAddress: `${this.data.addressList[0].area}-${this.data.addressList[0].address || ''}`,
                recieveAddress: `${this.data.addressList[1].area}-${this.data.addressList[1].address || ''}`,
            }
        }).then(res => {
            if (res && res.flag) {
                this.setData({
                    sendBranchArray: res.value.sendOutletsInfo || '',
                    recieveBranchArray: res.value.recieveOutletsInfo || '',
                    sendBranchType: 0, // 当前选择发货网点
                    recieveBranchType: 0, // 当前选择收货网点
                })
            } else {
                this.setData({
                    sendBranchArray: [], // 获取失败直接清空网点
                    recieveBranchArray: [],
                    sendBranchType: 0,
                    recieveBranchType: 0,
                })
            }
        })
    },
    /**
     * 选择网点
     */
    chooseSendBranch(e) {
        // console.log(e)
        this.setData({
            [`${e.currentTarget.dataset.type}BranchType`]: e.detail.value
        })
    },
    /**
     * 开关短信通知
     */
    // switchChagne(e) {
    //   let that = this;
    //   this.setData({
    //     ['chooseServer.serverInfo.13.flag']: e.detail.value
    //   })
    //   wx.setStorage({
    //     key: 'chooseServer',
    //     data: that.data.chooseServer,
    //     success(res) {
    //       that.getPrice() // 计算价格
    //     }
    //   })
    // },
    /**
     * 选择支付方式
     */
    bindPickerChange(e) {
        let that = this;
        this.setData({
            paymentType: e.detail.value
        })
        if (e.detail.value === '1') {
            this.setData({
                ['chooseServer.serverInfo.12.flag']: true
            })
        } else {
            this.setData({
                ['chooseServer.serverInfo.12.flag']: false
            })
        }

        wx.setStorage({
            key: 'chooseServer',
            data: that.data.chooseServer,
            success(res) {
                that.getPrice() // 计算价格
            }
        })
    },
    /**
     * 提交订单
     */
    confirmOrder(e) {
        // 是否完善发/收货人信息pullDownInputShowStatus
        if (JSON.stringify(this.data.addressList[0]) === "{}" || !this.data.addressList[0].area || !this.data.addressList[0].address || !this.data.addressList[0].contacter || !this.data.addressList[0].mobile) {
            wx.showToast({
                title: '请选择完善发货人信息',
                icon: 'none'
            })
            return this.setData({ // 打开信息输入下拉框
                'pullDownInputShowStatus[0]': true
            })
        }
        if (JSON.stringify(this.data.addressList[1]) === "{}" || !this.data.addressList[1].area || !this.data.addressList[1].address || !this.data.addressList[1].contacter || !this.data.addressList[1].mobile) {
            wx.showToast({
                title: '请选择完善收货人信息',
                icon: 'none'
            })
            return this.setData({ // 打开信息输入下拉框
                'pullDownInputShowStatus[1]': true
            })
        }

        // 货物信息输入验证
        if (goodsInfoRules(this.data.goodsInfo)) return wx.showToast({
            title: goodsInfoRules(this.data.goodsInfo),
            icon: 'none'
        })


        // 是否选择物流商
        if (!this.data.logistics) return wx.showToast({
            title: '请选择物流商',
            icon: 'none'
        })
        // 是否查看确认增值服务
        if (!this.data.chooseServer) return wx.showToast({
            title: '请查看并确认增值服务信息',
            icon: 'none'
        })
        if (this.data.chooseServer.serverInfo['9'] && this.data.chooseServer.serverInfo['9'].flag && !this.data.chooseServer.serverInfo['9'].inputPrice) return wx.showToast({
            title: '请在增值服务项，输入货物保价金额',
            icon: 'none'
        })
        if (this.data.chooseServer.serverInfo['11'] && this.data.chooseServer.serverInfo['11'].flag && !this.data.chooseServer.serverInfo['11'].inputPrice) return wx.showToast({
            title: '请在增值服务项，输入货物保险金额',
            icon: 'none'
        })
        // 是否有网点信息
        // if (this.data.sendBranchArray.length === 0 || this.data.sendBranchArray.length === 0) return wx.showToast({
        //   title: '该物流商暂无收/发货网点信息,请更换物流商',
        //   icon: 'none'
        // })

        // 发起请求提交订单
        this.setData({
            hiddenmodalput: false, // 唤起弹框
            formId: e.detail.formId, // 
        })
    },

    /**
     * 提交订单
     */
    submitOrder() {
        /**
         * 附加费用
         */
        let aServer = this.data.costBreakdown.additionTotalPrices
        // 过滤出所有已选的增值服务
        /**
         * 存放附加增值服务的obj
         */
        let aServerObj = Object.keys(aServer.detail).reduce((pre, item) => {
            if (aServer.detail[item].title) {
                pre[item] = aServer.detail[item].price === 0 ? aServer.detail[item].text : aServer.detail[item].price
            }
            return pre
        }, {})

        /**
         * 基础费用
         */
        let bServer = this.data.costBreakdown.basicTotalPrices
        // 过滤出所有已选的增值服务
        /**
         * 存放所有增值服务的obj
         */
        let ServerObj = Object.keys(bServer.detail).reduce((pre, item) => {
            if (bServer.detail[item].title) {
                pre[item] = bServer.detail[item].price === 0 ? bServer.detail[item].text : bServer.detail[item].price
            }
            return pre
        }, aServerObj)

        app.http.request({
            ...this.data.urlList[0],
            data: {
                formId: this.data.formId, // 模版id
                path: 'pages/ddxq/ddxq?orderId=', //模版进入订单页面
                logisticId: this.data.logistics.vn, // 物流商id
                lineId: this.data.logistics.id, // 线路id
                productAttr: 0, // 产品属性
                consignerName: this.data.addressList['0'].contacter, // 发货人姓名
                consignerMobile: this.data.addressList['0'].mobile, // 发货人电话
                consignerAdd: this.data.addressList['0'].area, // 发货人地址
                consignerAddDetail: this.data.addressList['0'].address, // 发货人详细地址
                receiveName: this.data.addressList['1'].contacter, // 收货人姓名
                receiveMobile: this.data.addressList['1'].mobile, // 收货人电话
                receiveAdd: this.data.addressList['1'].area, // 收货人地址
                receiveAddDetail: this.data.addressList['1'].address, // 收货人详细地址
                goodsName: this.data.goodsInfo.goodsName || '', // 货物名称
                goodsNumber: parseInt(this.data.goodsInfo.goodsNumber) || '', // 货物数量
                goodsWeight: this.data.goodsInfo.goodsWeight || '', // 货物重量
                goodsVolume: this.data.goodsInfo.goodsVolume || '', // 货物体积
                goodsAmount: this.data.goodsInfo.goodsAmount || '', // 货物实际价格
                estimateAmount: this.data.costBreakdown.totalPrice, //预估总价格 
                discountId: this.data.costBreakdown.discount.discountId, // 优惠券id
                saveAmount: (this.data.costBreakdown.oldStartTotalPrices - this.data.costBreakdown.startTotalPrices).toFixed(2), // 节省金额
                pureCost: this.data.costBreakdown.startTotalPrices, // 纯运费   
                baseCost: this.data.costBreakdown.startTotalPrices + this.data.costBreakdown.basicTotalPrices.price, // 基础运费:  纯运费+基础费用
                additionalCost: this.data.costBreakdown.additionTotalPrices.price, // 附加费用
                payType: this.data.chooseServer.serverInfo['12'] && this.data.chooseServer.serverInfo['12'].flag ? 1 : 0, // 付款方式
                serviceString: JSON.stringify(ServerObj), // 增值服务json串
                sendOutletsId: this.data.sendBranchArray[this.data.sendBranchType] ? this.data.sendBranchArray[this.data.sendBranchType].id : '', // 发货网点id
                receiveOutletsId: this.data.recieveBranchArray[this.data.recieveBranchType] ? this.data.recieveBranchArray[this.data.recieveBranchType].id : '', // 收货网点id
                notice: this.data.goodsInfo.remark || '', // 备注信息
            }
        }).then(res => {
            let that = this;
            if (res && res.flag) {
                this.data.storageList.forEach((item, index) => {
                    this.setData({
                        logistics: null,
                        addressList: [{}, {}],
                        goodsInfo: {
                            goodsWeight: 1,
                        },
                        hiddenmodalput: true, // 隐藏弹框
                    })
                    wx.removeStorage({
                        key: item,
                        success() {
                            if (index === (that.data.storageList.length - 1)) wx.redirectTo({
                                url: `../xdcg/xdcg?orderInfo=${JSON.stringify(res.value)}&title=下单成功`,
                            })
                        },
                    })
                })
            }
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
                that.getPrice()
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
    },

    /**
     * 选择省市区
     */
    bindRegionChange(e) {
        let that = this;
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
            },
        })
        // 填写
        if (this.data.addressList[0].area && this.data.addressList[1].area) {
            this.setData({
                recommendLogistics: [],
                logistics: null,
                chooseServer: null,
                sendBranchArray: [], // 发货网点
                sendBranchType: 0, // 当前选择发货网点
                recieveBranchArray: [], // 收货网点
                recieveBranchType: 0, // 当前选择收货网点
                radioIndex: '', // 重制选择的物流商线路
            })
            this.recommendLogistics()
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
        // 每次激活时请求数据
        if (e.detail.value) {
            this.getaddressThinkRenderData(e.detail.value, this.data.addressList[e.currentTarget.dataset.index].cityName || '', this.data.addressList[e.currentTarget.dataset.index].area || '')
            this.setData({ // 激活时有详细地址则显示匹配
                addressThinkHistoryStatus: false
            })
        } else {
            this.setData({ // 激活时没有详细地址则显示历史记录
                addressThinkHistoryStatus: true
            })
        }
        this.setData({ // 激活时打开联想弹框
            addressThinkShowStatus: true,
        })
    },

    /**
     * 收/发货人信息输入
     */
    inputLinkman(e) {
        let that = this;
        if (e.currentTarget.dataset.type === 'address') {
            this.setData({
                addressThinkShowStatus: true, // 
                addressThinkHistoryStatus: false, // 隐藏历史记录
            })
            // 清除已有延时器
            this.data.requestTimeout && clearTimeout(this.data.requestTimeout)
            // 延时.8s请求
            let requestTimeout = setTimeout(() => {
                // 获取联想地址数据
                that.getaddressThinkRenderData(e.detail.value, that.data.addressList[e.currentTarget.dataset.index].cityName || '', that.data.addressList[e.currentTarget.dataset.index].area || '')
            }, 800)
            this.setData({
                requestTimeout,
            })
        }
    },

    /**
     * 收/发货人信息保存
     */
    blurLinkman(e) {
        // 手机座机
        if (e.currentTarget.dataset.type === 'mobile') {
            if (!telephoneReg.test(e.detail.value) && !phoneReg.test(e.detail.value) && !phoneReg400.test(e.detail.value) && !phoneReg800.test(e.detail.value)) return wx.showToast({
                title: '请输入正确的电话号',
                icon: 'none'
            })
        }

        this.setData({
            [`addressList.${parseInt(e.currentTarget.dataset.index)}.${e.currentTarget.dataset.type}`]: e.detail.value,
            // 清空联想地址
            // addressThinkRenderData: []
            addressThinkShowStatus: false,
        })

        if (this.data.addressList[0].adress && this.data.addressList[1].adress && this.data.logistics) {
            console.log('详细地址已经完善')
        }
        // 获取信息完善情况,决定是否打开信息输入下拉框
        // this.setData({ // 打开信息输入下拉框
        //   pullDownInputShowStatus: this.judgeInfoComplete('获取下拉状态')
        // })
    },

    /**
     * 请求联想地址render数据
     */
    getaddressThinkRenderData(query = '', region = '', area = '') {
        app.http.request({
            ...this.data.urlList[4],
            data: {
                region,
                query,
                area,
            }
        }).then(res => {
            if (res && res.flag && res.value) {
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
        // 同步数据
        this.setData({
            [`addressList.${this.data.addressThinkShowIndex}.address`]: e.currentTarget.dataset.item.address || e.currentTarget.dataset.item.name,
            addressThinkHistoryRenderData: [ // 历史记录
                e.currentTarget.dataset.item,
                ...addressDistinct
            ],
            addressThinkShowStatus: false, // 选择联想地址后收起联想地址框
        })
        this.setData({ // 打开信息输入下拉框
            pullDownInputShowStatus: this.judgeInfoComplete('获取下啦状态')
        })
        // 存入缓存
        wx.setStorage({
            // 保证每次页面onshow时将历史记录导入鞋标渲染数据中 
            key: 'addressThinkHistoryRenderData',
            // 去重后存入缓存
            data: addressDistinct,
        })
    },

    /**
     * 弹框提示用户是否拨打电话
     */
    callPhone(e) {
        app.callPhone(e.currentTarget.dataset.phone)
    },
    modalConfirm(e) {
        this.submitOrder()
    },
    modalCancel() {
        // 重制状态
        this.setData({
            hiddenmodalput: true,
        })
    },

    /**
     * 判断信息是否完善
     * @retrun 返回的状态与实际是否完善相反,意为是否打开信息输入下拉框
     * @param{String}returnType 判断获取什么状态; completeStaus : 获取信息完善状态,else : 获取下拉框是否展开状态
     */
    judgeInfoComplete(returnType = 'completeStaus') {
        let statusList = [false, false];

        statusList[0] = Boolean(JSON.stringify(this.data.addressList[0]) !== "{}" && this.data.addressList[0].area && this.data.addressList[0].address && this.data.addressList[0].contacter && this.data.addressList[0].mobile)

        statusList[1] = Boolean(JSON.stringify(this.data.addressList[1]) !== "{}" && this.data.addressList[1].area && this.data.addressList[1].address && this.data.addressList[1].contacter && this.data.addressList[1].mobile)

        if (returnType === 'completeStaus') {
            return statusList
        } else {
            if (statusList[0]) return [!statusList[0], !statusList[1]]
            else return [!statusList[0], false]
        }
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
     * Sidebar组建回调函数
     */
    sidebarCallback() {
        let that = this;
        this.setData({
            showSidebarFlag: !this.data.showSidebarFlag
        })
        // 当每次关闭优惠券选择弹框时,更新缓存里的优惠券状态,并调取计算
        if (this.data.showSidebarFlag) {
            wx.setStorage({
                key: 'chooseServer',
                data: this.data.chooseServer,
                success(res) {
                    // 调取价格计算
                    that.getPrice()
                }
            })
        }
    },

    /**
     * 优惠券选择触发
     */
    radioChangeD(e) {
        // 每次点击重置其他状态checked不仅是选中状态,更是计算筛选的依据
        let wlDiscountList = this.data.chooseServer.wlDiscountList.map((item, index) => {
            if (e.detail.value && index == e.detail.value) {
                item.checked = true
            } else {
                item.checked = false
            }
            return item
        });
        this.setData({
            [`chooseServer.wlDiscountList`]: wlDiscountList
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return shareAppMessage
    },
})