import {
    app
} from './config.js';

/**
 * @function --获取用户openId
 */
let openId = '';
const userOpenId = new Promise((resolve, reject) => {
    wx.getStorage({
        key: 'openId',
        success(res) {
            openId = res.data
            resolve(res.data)
        },
        fail() {
            wx.login({
                success(res) {
                    http.request({
                        url: '/wxlogistics/smallpro/user/get/openId.html',
                        data: {
                            ...res
                        }
                    }).then((opts) => {
                        if (opts.openid)
                            openId = opts.openid
                        wx.setStorage({
                            key: 'openId',
                            data: opts.openid,
                        })
                        resolve(opts)
                    })
                },
                fail(err) {
                    wx.showToast({
                        title: '登陆失败',
                        icon: 'none',
                        mask: true
                    })
                    reject({
                        status: false,
                        ...err
                    })
                },
            })
        }
    })
}).catch(err => err)

/**
 * http --内部保存一个请求方法，及一个暂存微信请求对象的Object
 * requestAbort 暂存每次请求的微信请求对象，每一个key为发起请求的url
 * request --网络请求
 *
 */

const http = {
    // baseUrl: 'http://192.168.44.141',
    //baseUrl: 'https://225e7a43.ngrok.io',
    baseUrl: 'https://wxlogistics.hc360.com',
    requestAbort: {},
    request(params) {
        return new Promise(function(resolve, reject) {
            if (!http.requestAbort.hasOwnProperty(params.url)) { // 禁止重复请求
                // 取消输入详细地址时,联想地址的请求
                if (params.url !== '/wxlogistics/smallpro/addressBook/getAddress.html' && params.url !== '/wxlogistics/smallpro/stataistics/saveStatistics.html') {
                    wx.showLoading({
                        title: '正在为您搜索...',
                        mask: true
                    });
                    wx.showNavigationBarLoading();
                }
                // 用url为key将请求对象暂存于http.requestAbort里，以便于取消网络请求
                http.requestAbort[params.url] = wx.request({
                    method: 'POST',
                    url: http.baseUrl + params.url || ' ',
                    data: {
                        ...params.data,
                        openId
                    },
                    header: {
                        // "Accept": "application/json, text/javascript, */*;"
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    },
                    success(options) {
                        let result = options.data;
                        if (options.statusCode === 200 && result) {
                            resolve(result)
                        } else {
                            // 联想地址和功能点击次数统计请求不弹框
                            if (params.url !== '/wxlogistics/smallpro/addressBook/getAddress.html' && params.url !== '/wxlogistics/smallpro/stataistics/saveStatistics.html') {
                                wx.showToast({
                                    title: '数据获取失败',
                                    icon: 'none'
                                });
                            }
                            reject(result)
                        }
                    },
                    fail(err) {
                        // 联想地址和功能点击次数统计请求不弹框
                        if (params.url !== '/wxlogistics/smallpro/addressBook/getAddress.html' && params.url !== '/wxlogistics/smallpro/stataistics/saveStatistics.html') {
                            wx.showToast({
                                title: '请求失败',
                                icon: 'none'
                            });
                        }
                        reject(err)
                    },
                    complete() {
                        // 无论请求是否成功 只要已经发出就删除保存的网络请求对象
                        delete http.requestAbort[params.url];
                        // 只有当所有请求全部完成才关闭请求动画
                        if (JSON.stringify(http.requestAbort) === '{}') {
                            wx.hideNavigationBarLoading();
                            wx.hideLoading();
                            wx.stopPullDownRefresh() // 关闭下拉刷新动画
                        }
                    }
                })
            }
        }).catch(err => {
            console.log('http catch', err)
        })
    }
}

function formatTimeStamp(date, time = '0:0:0') {
    return Date.parse(new Date(`${data} ${time}`)) || Date.parse(new Date(`${data.replace(/-/g, '/')} ${time}`))
};

/**
 * @function
 * 根据对比传入的两个时间戳,计算出相差的时分秒
 * @param{String}startTimestamp 计算起始时间戳,默认是当前时间
 * @param{Number}endTimestamp 计算结束时间戳
 * @return{Object}
 */
const timestampSwitch = (endTimestamp, startTimestamp = (new Date()).valueOf()) => {
    // 兼容ios
    if (!endTimestamp) {
        console.error('endTimestamp不存在')
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    }
    let et = Date.parse(endTimestamp) || Date.parse(endTimestamp.replace(/-/g, '/'))
    if (!et) return {}
    let difference = (et - startTimestamp),
        timeDifference = (difference > 0 ? difference : 0) / 1000,
        days = parseInt(timeDifference / 86400),
        hours = parseInt((timeDifference % 86400) / 3600),
        minutes = parseInt((timeDifference % 3600) / 60),
        seconds = parseInt(timeDifference % 60);
    days = days < 10 ? `0${days}` : days;
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return {
        days,
        hours,
        minutes,
        seconds
    }
};

/**
 * @function --请求获取身份类型列表
 * @return Promis
 */
const getIdentityList = new Promise((resolve, reject) => {
    // http.request({
    //   url: '/wxlogistics/smallpro/user/get/all/identity.html'
    // }).then(res => {
    //   if (res) {
    //     resolve(res)
    //     wx.setStorage({
    //       key: 'identityList',
    //       data: res,
    //     })
    //   }
    // })
}).catch(err => err)

/**
 * 语音识别
 */
const ASRUpload = function(filePath) {
    return new Promise((resolve, reject) => {
        wx.showLoading({
            title: '正在识别...',
            mask: true
        })
        wx.uploadFile({
            url: http.baseUrl + '/wxlogistics/smallpro/baiduapi/speech.html',
            filePath,
            name: 'file',
            success(res) {
                wx.hideLoading()
                let data = JSON.parse(res.data);
                if (data.flag) resolve(data.speechStr)
                else wx.showToast({
                    icon: 'none',
                    title: '请大声说出想要识别的内容'
                })
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
    })
};

/**
 * 定位
 */
const getAddress = new Promise(resovle => {
    wx.getLocation({
        type: 'wgs84',
        success: function(res) {
            wx.request({
                url: 'https://apis.map.qq.com/ws/geocoder/v1/',
                data: {
                    location: `${res.latitude},${res.longitude}`,
                    key: 'LAABZ-ILVK6-JCCSW-MRHZR-SBEDO-S3FBB'
                },
                success(res) {
                    if (res.data && res.data.result) {
                        resovle({
                            ...res.data.result,
                            status: true
                        })
                    } else {
                        resovle({
                            status: false
                        })
                    }
                }
            })
        }
    })
})

/**
 * 获取所有物流商
 */
const getAllLogistics = new Promise(resolve => {
    wx.getStorage({
        key: 'getAllLogistics',
        success(res) {
            resolve(res.data)
        },
        fail(err) {
            http.request({
                url: '/wxlogistics/smallpro/outlet/getAllLogistics.html'
            }).then(res => {
                if (res && res.flag) {
                    resolve(res.value)
                    wx.setStorage({
                        key: 'getAllLogistics',
                        data: res.value,
                    })
                }
            })
        }
    })
})

/**
 * 记录功能点击次数
 */
const sendFunctionCount = (opts) => {
    let functionName = opts.functionName || opts.title || '';
    let functionContent = opts.functionContent || '';
    http.request({
        url: '/wxlogistics/smallpro/stataistics/saveStatistics.html',
        data: {
            functionName,
            functionContent
        }
    }).then(res => {})
};
/**
 * 弹框提示用户是否拨打电话
 */
const callPhone = (phone) => {
    if (!phone) return console.error('缺少拨打电话号码');
    wx.showModal({ // 调用弹框
        title: phone,
        content: '是否拨打电话',
        confirmText: '好',
        success: function(res) {
            if (res.confirm) {
                wx.makePhoneCall({ // 调用电话
                    phoneNumber: phone,
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
};

/**
 * 对象元素的数组去重
 * @param{arrObj}arrObj 待去重数组对象
 * @param{String}key 去重判断依据
 */
const ObjectDistinct = (arrObj, key) => {
    if (!(arrObj instanceof Array)) return console.error('ObjectDistinct传入第一个参数必须为数组类型');
    if (typeof key !== 'string') return console.error('ObjectDistinct传入第二个参数必须为字符串类型');
    let distinctArr = arrObj.reduce((pre, itemD, index, arr) => {
        // 是否存在
        let exists = (pre.find(itemF => {
            return itemF[key] === itemD[key]
        }))
        if (!exists) pre.push(itemD)
        return pre
    }, [])
    return distinctArr
}

/**
 * 增值服务key翻译字典
 */
const serverDictionary = {
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
};

/**
 * 小程序转发
 */
const shareAppMessage = {
    title: "发大件，寄小件，就用惠物流。价格最优，服务一流，您最智慧的发货选择!", // 转发的标题 ，不填就是小程序名称
    // imageUrl: '../../image/logo.png', // 转发后显示的图片， 不填就截取当前转发也的页面
    path: "pages/index/index",
}


module.exports = {
    http,
    userOpenId,
    getIdentityList,
    timestampSwitch,
    ASRUpload,
    getAddress,
    getAllLogistics,
    sendFunctionCount,
    callPhone,
    serverDictionary,
    ObjectDistinct,
    errImg: 'https://style.org.hc360.com/images/microMall/program/proGimg.png',
    shareAppMessage,
}