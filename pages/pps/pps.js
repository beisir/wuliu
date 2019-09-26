import { ajax } from '../../utils/util.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wllist:[
            {
                title: '安能物流',
                
            },
            {
                title: '德邦物流'
            },
            {
                title: '天地华宇'
            },
            {
                title: '佳怡物流'
            },
            {
                title: '中铁物流' 
            },
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // ajax({
        //     url:'',
        // }).then(res => {
        //     console.log(res)
        //     //拼出有状态的数据
        //     for()
        //     this.setData({
        //         wllist:res
        //     })
        // })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})