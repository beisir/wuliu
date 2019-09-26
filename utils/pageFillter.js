import { sendFunctionCount } from './util.js'
/**
 * pageFillter --全局注册页面拦截器,目前只是实现统一修改title
 * @function
 * @param{Object} pageObj 当前页面的page对象
 */
exports.pageFillter = function (pageObj) {
  let _onLoad = pageObj.onLoad || function () { };
  pageObj.onLoad = function (option) {
    _onLoad.call(this, option)
    sendFunctionCount(option)
    wx.setNavigationBarTitle({
      title: option.title || '惠物流'
    })
  }
  return Page(pageObj)
}