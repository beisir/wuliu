// components/tabNav/tabNav.js
/**
 * @author cao xu <caoxu@hc360.com>
 * 当前组件为动态tab导航的容器需要与tabItem配合使用
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 导航文字按钮数量
    childrenLength: {
      type: Number,
      value: 0,
      observer(newV, oldV) {
      }
    },
    // 页面最多显示按钮个数
    maxSum: {
      type: Number,
      value: 5
    },
    // 切换index
    currentIndex: {
      type: Number,
      value: 0,
      observer(newV, oldV) {
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: wx.getSystemInfoSync().windowWidth,
  },
  attached() {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
