// components/tabItem/tabItem.js
/**
 * @author cao xu <caoxu@hc360.com>
 * 当前组件为动态tab导航的容器需要与tabItem配合使用
 */
// 当前组件需要配合tabNav使用，
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
    // 切换index
    currentIndex: {
      type: Number,
      value: 0,
      observer(newV, oldV) {
      }
    },
    // 当前点击index
    index: {
      type: Number,
      value: 0,
      observer(newV, oldV) {
      }
    },
    // 导航按钮高度
    itemHeight: {
      type: Number,
      value: 50,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * changeTabNav --触发自定义事件changeIndex，回调传参currentIndex
     * @function
     * @return
     */
    changeTabNav(e) {
      // 防止用户重复点击一个tab按钮
      this.data.index !== this.data.currentIndex && this.triggerEvent('changeIndex', {
        currentIndex: this.data.index
      }, {})
    }
  }
})
