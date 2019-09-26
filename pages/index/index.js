import {
    timestampSwitch,
    getAddress,
    getAllLogistics,
    shareAppMessage,
} from '../../utils/util.js';
import {
    pageFillter
} from '../../utils/pageFillter.js';

let app = getApp();

pageFillter({

    /**
     * 页面的初始数据
     */
    data: {
        page: 0,
        pageSum: 1,
        urlList: [{
            urlType: 'bannerRender',
            url: '/wxlogistics/smallpro/index/get/banners.html'
        }, {
            urlType: 'flashSalesRender',
            url: '/wxlogistics/smallpro/index/get/timelimit.html'
        }],
        /**
         * banner swiper数据
         */
        bannerRender: null,
        /**
         * banner切换时间
         */
        interval: 2500,
        /**
         * 菜单nav列表
         */
        meauNavList: [{
            title: '快速下单',
            path: '/pages/ksxd/ksxd'
        },
        {
            title: '物流跟踪',
            path: '/pages/wlgz/wlgz'
        },
        {
            title: '估算运费',
            path: '/pages/gsyf/gsyf'
        },
        {
            title: '网点查询',
            path: '/pages/wdcx/wdcx'
        }
        ],
        // 限时优惠
        /**
         * 限时特惠render数据
         */
        flashSalesRender: null,
        /**
         * 倒计时
         */
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',

        // 附近物流
        /**
         * 附近物流tabNav
         */
        logisticsNavList: [{
            title: '综合排序',
            sort: ''
        }, {
            title: '离我最近',
            sort: '0'
        }, {
            title: '折扣最低',
            sort: '1'
        }, {
            title: '筛选',
            sort: ''
        }],
        /**
         * 控制当前附近物流swiper index值
         */
        curindex: 0,
        /**
         * 附近物流数据二维数组
         */
        logisticsListData: [],
        address: '', // 当前地址
        coord: {}, // 当前经纬度
        filtrate: {}, // 筛选条件
        goodsChooseRender: [], // 为你优选
        newUser: null, // 新用户特惠
    },
    // 生命周期
    onLoad(options) {
        // 获取地址信息
        getAddress.then(res => {
            this.setData({
                address: res.address, // 当前地址
                coord: { // 当前经纬度
                    localLat: res.location.lat,
                    localLng: res.location.lng,
                },
            })
            this.getLogisticsData()
        })
        this.getBannerFlashSaleRender() // 获取轮播限时特惠图数据
        this.getGoodsChoose() // 为你优选
        // this.getNewData() // 请求新用户优惠
    },
    /**
     * 生命周期--页面显示
     */
    onShow() {
        let that = this;
        wx.getStorage({
            key: 'filtrate',
            success(res) {
                if (res.data.status) {
                    that.setData({
                        filtrate: res.data.chooseServer,
                        logisticsListData: []
                    })
                    that.getLogisticsData()
                    wx.setStorage({
                        key: 'filtrate',
                        data: {
                            chooseServer: {
                                ...that.data.filtrate,
                            },
                            status: false
                        }
                    })
                }
            },
        })
    },

    // 函数
    /**
     * @function
     * 跳转路由
     * @param e 事件对象
     */
    routerTo(e) {
        if (e.currentTarget.dataset.item.path === '/pages/ksxd/ksxd') {
            app.router({
                path: e.currentTarget.dataset.item.path,
                methods: `title=${e.currentTarget.dataset.item.title}`
            })
        } else {
            wx.navigateTo({
                url: `${e.currentTarget.dataset.item.path}?title=${e.currentTarget.dataset.item.title}`,
            })
        }
    },
    /**
     * 获取banner 限时特惠 render  数据
     */
    getBannerFlashSaleRender() {
        app.http.request({
            url: '/wxlogistics/smallpro/index/get/bannersAndTimelimit.html'
        }).then(res => {
            if (res) {
                this.setData({
                    bannerRender: res.banners,
                    flashSalesRender: res.timelimit,
                    ...timestampSwitch(res.timelimit[0] && res.timelimit[0].endTime)
                })
                res.timelimit[0] && this.setCountDown() // 开启倒计时
            }
        })
    },

    /**
     * @function
     * 开启倒计时修改剩余时间
     */
    setCountDown() {
        setInterval(() => {
            this.setData({
                ...timestampSwitch(this.data.flashSalesRender[0].endTime)
            })
        }, 900)
    },

    /**
     * 请求附近物流数据
     */
    getLogisticsData(getType = 'refresh') {
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
                [`logisticsListData[${this.data.curindex}]`]: [],
            })
            page = 1
        }
        app.http.request({
            url: '/wxlogistics/smallpro/outlet/nearby.html',
            data: {
                'pageBean.page': page,
                'pageBean.pageSize': 10,
                ...this.data.coord,
                localAddr: this.data.address,
                sort: this.data.logisticsNavList[this.data.curindex].sort,
                ...this.data.filtrate
            }
        }).then(res => {
            if (res) {
                this.setData({
                    [`logisticsListData[${this.data.curindex}]`]: [
                        ...this.data.logisticsListData[this.data.curindex],
                        ...res.smallproOutletList,
                    ],
                    page,
                    pageSum: res.pageBean.pages
                })
            }
            wx.stopPullDownRefresh() // 关闭下拉刷新动画
        })
    },
    /**
     * tabsort --附近物流nav切换更改curindex
     * @function
     * @param{Object} 事件对象
     */
    tabsort(e) {
        let {
            index
        } = e.currentTarget.dataset;
        app.sendFunctionCount({ functionName: this.data.logisticsNavList[index].title })
        this.setData({
            curindex: index
        })
    },
    /**
     * crrentChange --附近物流swiper切换更改curindex
     * @function
     * @param event 事件对象
     */
    crrentChange(event) {
        let that = this
        event.detail.source === 'touch' && this.setData({
            // 判断curindex变化是否是由用户滑动触发，属于优化项
            curindex: event.detail.current
        })
        if (!this.data.logisticsListData[this.data.curindex]) {
            this.getLogisticsData()
        }
    },
    /**
     * 跳转下单
     * @param event 事件对象
     */
    toLogisticDetail(e) {
        if (e.currentTarget.dataset.item) {
            wx.removeStorage({
                key: 'addressList',
                success: function (res) { },
            })
            // 构建好点击发货去往下单页时,所需的收发货地址
            // 目的是为了点击进入下单页时可以直接请求推荐线路
            let logistics = e.currentTarget.dataset.item;
            let logisticsAddress = {
                0: {
                    area: `${logistics.pro || ''}-${logistics.city || ''}-${logistics.county || ''}`,
                    provinceName: logistics.pro || '',
                    cityName: logistics.city || '',
                    countyName: logistics.county || '',
                },
                1: {
                    area: `${logistics.ePro || ''}-${logistics.eCity || ''}-${logistics.eCounty || ''}`,
                    provinceName: logistics.ePro || '',
                    cityName: logistics.eCity || '',
                    countyName: logistics.eCounty || '',
                }
            }
            // 存入缓存后跳转
            wx.setStorage({
                key: 'logistics',
                data: e.currentTarget.dataset.item,
                success(res) {
                    app.router({
                        path: '../ksxd/ksxd',
                        methods: `title=下单&addressList=${JSON.stringify(logisticsAddress)}&functionName=${e.currentTarget.dataset.type || ''}&functionContent=${e.currentTarget.dataset.item.id}`
                    })
                }
            })
        } else {
            app.router({
                path: '../ksxd/ksxd',
                methods: `title=下单&wId=${e.currentTarget.dataset.opts.id}&lId=${e.currentTarget.dataset.opts.logisticId}&wditem=${JSON.stringify(e.currentTarget.dataset.opts)}`
            })
        }
    },

    /**
     * 限时特惠跳转
     */
    navigateTo(e) {
        if (e.currentTarget.dataset.item.link === '../view_show/view_show') return wx.navigateTo({
            url: `../view_show/view_show?title=平台介绍&functionName=轮播图&functionContent=${e.currentTarget.dataset.item.path}`
        })
        wx.navigateTo({
            url: `${e.currentTarget.dataset.item.link}?title=限时特惠&functionName=${e.currentTarget.dataset.type}&functionContent=${e.currentTarget.dataset.item.path}`
        })
    },
    /**
     * 物流跟踪  调取微信扫
     */
    scavenging() {
        wx.scanCode({
            success: (res) => {
                if ('scanCode:ok' === res.errMsg) {
                    wx.navigateTo({
                        url: `../wlgz/wlgz?scanCode=${res.result}`
                    })
                }
            }
        })
    },
    /**
     * 请求为你优选
     */
    getGoodsChoose() {
        app.http.request({
            url: '/wxlogistics/smallpro/line/get/priority.html'
        }).then(res => {
            let goodsChooseRender = res && res.docs && res.docs.slice(0, 2) || []
            this.setData({
                goodsChooseRender,
            })
        })
    },
    /**
     * 请求新用户优惠
     */
    getNewData() {
        app.http.request({
            url: '/wxlogistics/smallpro/index/get/firstbuyDisc.html',
        }).then(res => {
            if (res && res.length !== 0) {
                this.setData({
                    newUser: res[0]
                })
            }
        })
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            [`logisticsListData[${this.data.curindex}]`]: []
        })
        this.getLogisticsData()
        this.getBannerFlashSaleRender()
        // this.getNewData()
        this.getGoodsChoose()
    },
    /**
     * 上拉加载
     */
    onReachBottom() {
        this.getLogisticsData('onLoad')
    },

    /**
    * 用户点击右上角分享
    */
    onShareAppMessage: function () {
        return shareAppMessage
    },
})