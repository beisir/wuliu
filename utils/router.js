
/**
 * @author cao xu
 * @function 在微信路由跳转前拦截增加权限判断
 * @param {String} routeType 选择路由跳转的方式
 * @param {String} path 跳转路径
 * @param {String} methods 路由传参
 * @param {Function} success 成功回调
 * @param {Function} fail 失败回调
 * @param {Function} complete 统一回调
 */
const router = ({ routeType = 'navigateTo', path, methods = ' ', success = function () { }, fail = function () { }, complete = function () { } }) => {
  wx.getStorage({
    key: 'userInfo',
    success(res) {
      res.data.status ? wx[routeType]({
        url: `${path}?${methods}`,
        success,
        fail,
        complete
      }) : wx.navigateTo({
        url: '../sqy/sqy?title=授权登录'
      })
      // wx.showModal({
      //   title: '该功能需要授权登陆',
      //   content: '是否去登陆?',
      //   cancelText: '否',
      //   confirmText: '是',
      //   success(res) {
      //     if (!res.cancel && res.confirm) {
      //       console.log('确定')
      //       wx.navigateTo({
      //         url: '../sqy/sqy?title=授权登录'
      //       })
      //     }
      //   }
      // })
    },
    fail(err) {
      wx.navigateTo({
        url: '../sqy/sqy?title=授权登录'
      })
      // wx.showModal({
      //   title: '该功能需要授权登陆',
      //   content: '是否去登陆?',
      //   cancelText: '否',
      //   confirmText: '是',
      //   success(res) {
      //     if (!res.cancel && res.confirm) {
      //       wx.navigateTo({
      //         url: '../sqy/sqy?title=授权登录'
      //       })
      //     }
      //   }
      // })
    }
  })
}
module.exports = {
  router
}