import {
  onlineData,
  logisticsData,
  underlineData
} from '../../utils/data.js';
import {
  pageFillter
} from '../../utils/pageFillter.js';
const app = getApp();

pageFillter({
  data: {
    activeIndex: 0,
    online: onlineData,
    underlineData: underlineData,
    logisticsData: logisticsData,
    renderData: [{ // 页面渲染数组
      tabTitle: '在线发货',
      render: onlineData,
      styleIndex: 0
    }, {
      tabTitle: '线下发货',
      render: underlineData,
      styleIndex: 0
    }, {
      tabTitle: '物流常识',
      render: logisticsData,
      styleIndex: 0
    }],
    currentIndex: 0, // 切换标志
  },
  onLoad() {
  },
  /**
   * 点击更改样式
   */
  onlineClick(e) {
    this.setData({
      [`renderData[${this.data.currentIndex}].styleIndex`]: e.currentTarget.dataset.index
    })
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
  },
})