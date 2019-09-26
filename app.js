import { wechatLogin, http, getIdentityList, userOpenId, ASRUpload, sendFunctionCount, callPhone} from './utils/util.js';
import { request } from './utils/symbolKey.js'
import { router } from './utils/router.js';

App({
  onLaunch: function () {
    
  },
  globalData: {
    userInfo: null,
    userOpenId: userOpenId, // 保存用户openId的Promise对象
  },
  http, // 网络请求
  router, // 路由
  getIdentityList, // 获取身份类型列表
  ASRUpload, // 语音识别
  sendFunctionCount, // 发送功能点击统计
  callPhone, // 拨打电话
})