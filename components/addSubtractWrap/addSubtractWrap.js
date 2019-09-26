// components/addSubtractWrap/addSubtractWrap.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 保存初始值
    propInitial: {
      type: [String, Number, Object],
      value: 0,
      observer(newV, oldV) {
      }
    },
    // 原父组件传入的数据的路径,方便回调时直接付值
    propKey: {
      type: String,
      value: '',
      observer(newV, oldV) {
      }
    },
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
     * 根据data-type的值,来加减初始数据
     */
    _changeNum(e) {
      let num = e.currentTarget.dataset.type === 'add' ? 1 : -1,
        value = (Number(this.data.propInitial) + num) > 0 ? parseInt(Number(this.data.propInitial) + num) : 0
      this.triggerEvent('comChangeData', {
        key: this.data.propKey,
        value
      }, {})
    }
  }
})
