// pages/search/search.js
import { ajax } from "../../utils/util.js";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        historylist:[
            {
                title:"北京到广州"
            },
            {
                title: "北京到石家庄"
            },
            {
                title: "北京到上海"
            },
            {
                title: "北京到杭州"
            },
        ]
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const _this = this;
        // ajax({
        //     url:'',
        //     data:{

        //     }
        // }).then(res => {
        //     _this.setData({
        //         historylist:''
        //     })
        // })
    },

  
})