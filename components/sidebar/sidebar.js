// components/sidebar/sidebar.js

/**
 * author: caoxu
 * 组件功能：从侧边动态显示弹框
 * @param propCssType 决定组件样式,从哪个方向出现
 */

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propCssType: { // 决定组件样式,从哪个方向出现
      type: String,
      value: 'bottom'
    },
    propShowSidebarFlag: { // 决定弹框显示与否
      type: Boolean,
      value: true
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
     * 控制弹框显隐
     */
    _showModel() {
      this.triggerEvent('sidebarCallback', {}, {})
    },
    /**
     * 组织冒泡
     */
    stopPropagation() {

    }
  }
})
