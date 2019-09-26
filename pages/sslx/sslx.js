// pages/sslx/sslx.js
import {
    pageFillter
} from '../../utils/pageFillter.js';

const app = getApp();

pageFillter({
    /**
     * 页面的初始数据
     */
    data: {
        searchContent: '',
        urlList: [ // 请求url
            {
                name: '查询线路',
                url: '/wxlogistics/smallpro/line/search.html'
            }
        ],
        page: 0,
        pageSum: 1,
        renderData: [],
        lineNum: 0, // 线路数量
        logisticNum: 0, // 物流商数量
        chooseFlag: true, // 是否处在下单选择物流状态中
        gsyf: true, // 是否从估算运费过来
        cargoWeight: '', // 估算运费所需 重量
        cargoMeasurement: '', // 估算运费所需 体积
        showFlag: true,
        lId: '', // 物流商id
        fillateList: [{
            title: '综合',
            chooseFlag: true,
            sortFlag: false,
            sort: {
                false: 601,
                true: 601
            },
        }, {
            title: '价格',
            changeType: 'radio',
            chooseFlag: false,
            sortFlag: false,
            sort: {
                false: 602,
                true: 603
            },
        }, {
            title: '时效',
            changeType: 'radio',
            chooseFlag: false,
            sortFlag: false,
            sort: {
                false: 606,
                true: '',
            },
        }, {
            title: '物流商',
            changeType: 'checkBox',
            chooseFlag: false,
            list: [],
        }, {
            title: '筛选',
            changeType: 'filtrate',
            chooseFlag: false,
        }],
        fillateLogistics: [], // 筛选的物流商名称 用于暂存
        logisticNames: [], // 筛选的物流商名称 用于请求
        fillateServer: { // 筛选
            severSale: [{ // 促销活动
                title: '超时退费承诺',
                value: 1,
                status: false
            }, {
                title: '促销活动',
                value: 2,
                status: false
            }],
            serverDemand: [{ // 服务要求
                title: '上门接货',
                value: 1,
                status: false
            }, {
                title: '送货上门',
                value: 2,
                status: false
            }, {
                title: '送货上楼',
                value: 3,
                status: false
            }, {
                title: '开箱验货',
                value: 4,
                status: false
            }, {
                title: '短信服务',
                value: 5,
                status: false
            }, {
                title: '签收回单',
                value: 6,
                status: false
            },]
        },
        fillateChooseServer: { // 选择筛选的条件
            severSale: [],
            serverDemand: [],
        },
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
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            searchContent: options.address,
            chooseFlag: options.chooseFlag || false,
            gsyf: options.gsyf || false,
            cargoWeight: options.cargoWeight || '',
            cargoMeasurement: options.cargoWeight || '',
            lId: options.lId || '',
        })
        this.getRenderData()
    },

    /**
     * 请求render数据
     * @param getType 刷新/分页加载
     */
    getRenderData(getType = 'refresh') {
        // 是否是刷新/初次加载
        if (getType === 'refresh') {
            this.setData({
                page: 0,
                lineNum: 0, // 线路数量
                logisticNum: 0, // 物流商数量
            })
        }
        if (this.data.page >= this.data.pageSum) {
            return wx.showToast({
                title: '~已加载该线路相关的全部物流~',
                icon: 'none'
            })
        };

        let sort = '',
            obj = this.data.fillateList.find((item, index, arr) => {
                if (item.chooseFlag) return item.sort[item.sortFlag]
            })

        if (obj) sort = obj.sort[obj.sortFlag]
        // 请求数据
        app.http.request({
            ...this.data.urlList[0],
            data: {
                pageNo: this.data.page + 1,
                pageSize: 10,
                addr: this.data.searchContent, // 搜索地址
                cargoWeight: this.data.cargoWeight, // 估算运费的货物重量
                cargoMeasurement: this.data.cargoMeasurement, // 估算运费的货物体积
                checkedLogisticId: this.data.lId, // 物流商Id
                sort, // 排序筛选条件
                logisticNames: this.data.logisticNames, // 物流商
                ...this.data.fillateChooseServer, // 筛选条件
            }
        }).then(res => {
            if (res && res.docs) {
                res.docs = res.docs.map((replaceItem, replaceIndex) => {
                    replaceItem.city = replaceItem.city.replace(/中国\:/ig, '').replace(/\:/ig, '-');
                    replaceItem.cm = replaceItem.cm.replace(/中国\:/ig, '').replace(/\:/ig, '-');
                    replaceItem.eCity = replaceItem.eCity.replace(/中国\:/ig, '').replace(/\:/ig, '-');
                    replaceItem.tp = replaceItem.tp.replace(/中国\:/ig, '').replace(/\:/ig, '-');
                    return replaceItem;
                });

                if (getType === 'refresh') {
                    // 格式化物流商
                    let logisticsList = Object.keys(res.logisticsLineNumMap).reduce((pro, item, index) => {
                        let obj = {}
                        obj.name = item
                        obj.value = res.logisticsLineNumMap[item]
                        // 由于每次都是请求物流商,所以通过匹配保留上次筛选条件
                        this.data.fillateLogistics.forEach((itemI, indexI) => {
                            if (itemI === item) {
                                obj.checked = true
                            }
                        })
                        pro.push(obj)
                        return pro
                    }, [])
                    this.setData({
                        [`fillateList[3].list`]: logisticsList,
                        renderData: res.docs,
                        lineNum: res.lineNum || 0,
                        logisticNum: res.logisticNum || 0,
                        pageSum: res.page.pages,
                        page: this.data.page + 1,
                        showFlag: true
                    })
                } else {
                    this.setData({
                        renderData: [...this.data.renderData, ...res.docs],
                        pageSum: res.page.pages,
                        page: this.data.page + 1,
                        showFlag: true,
                        lineNum: res.lineNum,
                        logisticNum: res.logisticNum,
                    })
                }
            } else {
                if (getType === 'refresh') {
                    this.setData({
                        showFlag: false,
                        renderData: []
                    })
                }
            }
            wx.stopPullDownRefresh() // 关闭下拉刷新动画
        })
    },
    /**
     * 立即下单
     */
    toPurchase(e) {
        let logistics = e.currentTarget.dataset.logistics
        wx.setStorage({ // 本地存储
            key: 'logistics',
            data: logistics,
        });
        // // 每次选择新物流后,清除原增值服务
        // wx.removeStorage({
        //   key: 'chooseServer',
        //   success: function(res) {},
        // })
        let routeType = 'navigateTo';
        // 构建好点击发货去往下单页时,所需的收发货地址
        // 目的是为了点击进入下单页时可以直接请求推荐线路
        let logisticsAddress = {
            0: {
                area: `${logistics.pro ? logistics.pro + '-' : ''}${logistics.city || ''}${logistics.county ? '-' + logistics.county : ''}`,
                // area: `${logistics.pro || ''}-${logistics.city || ''}-${logistics.county || ''}`,
                provinceName: logistics.pro || '',
                cityName: logistics.city || '',
                countyName: logistics.county || '',
            },
            1: {
                area: `${logistics.ePro ? logistics.ePro + '-':''}${logistics.eCity|| ''}${logistics.eCounty?'-'+logistics.eCounty:''}`,
                // area: `${logistics.ePro || ''}-${logistics.eCity || ''}-${logistics.eCounty || ''}`,
                provinceName: logistics.ePro || '',
                cityName: logistics.eCity || '',
                countyName: logistics.eCounty || '',
            }
        }

        let methods = `title=发货&addressList=${JSON.stringify(logisticsAddress)}`;

        // 如果处在下单选择物流商状态下
        if (this.data.chooseFlag) {
            routeType = 'navigateBack';
            methods = ' ';
        }
        app.router({
            routeType,
            path: '../ksxd/ksxd',
            methods,
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getRenderData()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.getRenderData('onLoad')
    },
    /**
     * 筛选选择
     */
    fillateChange(e) {
        let {
            item,
            index
        } = e.currentTarget.dataset
        if (index < 3) {
            // 每次点击重制当前状态,并修改点击的状态
            let fillateList = this.data.fillateList.reduce((pre, item, idx, arr) => {
                // 深拷贝
                let i = JSON.parse(JSON.stringify(item))
                if (idx == index) { // 只修改点击的状态
                    i.chooseFlag = true
                    i.sortFlag = !i.sortFlag // 每次点击切换排序方式
                } else {
                    i.chooseFlag = false
                }
                pre.push(i)
                return pre
            }, [])
            // 赋值回去
            this.setData({
                fillateList
            })
            // 重新请求
            this.getRenderData()
        } else if (index === 3) {
            this.setData({
                [`fillateList[3].chooseFlag`]: !this.data.fillateList[3].chooseFlag,
            })
        } else if (index === 4) {
            this.hidderFillatePopup()
        }
    },
    /**
     * 筛选物流商确定
     */
    modalConfirm() {
        this.setData({
            [`fillateList[3].chooseFlag`]: !this.data.fillateList[3].chooseFlag,
            logisticNames: this.data.fillateLogistics // 同步选择到请求参数中
        })
        this.getRenderData()
    },
    /**
     * 筛选物流商取消
     */
    modalCancel() {
        this.setData({
            [`fillateList[3].chooseFlag`]: !this.data.fillateList[3].chooseFlag,
        })
    },
    /**
     * 选择筛选物流商
     */
    checkboxChange(e) {
        this.setData({
            fillateLogistics: e.detail.value, // 将选择放入暂存区
        })
    },
    /**
     * 选择筛选条件
     */
    chooseFillate(e) {
        let {
            type,
            index
        } = e.currentTarget.dataset
        this.setData({
            [`fillateServer.${type}[${index}].status`]: !this.data.fillateServer[type][index].status,
        })
    },
    /**
     * 控制筛选的弹框显示隐藏
     */
    hidderFillatePopup() {
        this.setData({
            [`fillateList[4].chooseFlag`]: !this.data.fillateList[4].chooseFlag,
        })
    },
    /**
     * 筛选条件确认
     */
    fillateConfirm() {
        let that = this,
            obj = Object.keys(this.data.fillateServer).reduce((preO, itemO, indexO, arrO) => {
                let objItem = that.data.fillateServer[itemO].reduce((preI, itemI, indexI, arrI) => {
                    if (itemI.status) preI.push(itemI.value)
                    return preI
                }, [])
                preO[itemO] = objItem
                return preO
            }, {});
        // 同步修改请求参数
        this.setData({
            fillateChooseServer: {
                ...obj
            },
            [`fillateList[4].chooseFlag`]: !this.data.fillateList[4].chooseFlag,
        })
        this.getRenderData()
    },
    /**
     * 重置筛选条件
     */
    remakeFillate() {
        // 初始化每个选项的状态
        let that = this,
            fillateServer = Object.keys(this.data.fillateServer).reduce((preO, itemO, indexO, arrO) => {
                let objItem = that.data.fillateServer[itemO].map((itemI, indexI, arrI) => {
                    itemI.status = false
                    return itemI
                })
                preO[itemO] = objItem
                return preO
            }, {});
        // 同步修改数据
        this.setData({
            fillateChooseServer: {
                severSale: [],
                serverDemand: [],
            },
            fillateServer,
        })

    },
    /**
     * 此处a只为了解决事件冒泡无其他意义
     */
    a() { },

})