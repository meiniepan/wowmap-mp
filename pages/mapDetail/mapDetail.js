// pages/mapDetail/mapDetail.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let bean = JSON.parse(options.bean)
        let roles = JSON.parse(options.roles)
        console.log("roles", bean)
        roles.forEach(it => {
            it.checked = false
            bean.roles.forEach(it2 => {
                if ((it2.name + it2.job + it2.account) == (it.name + it.job + it.account) && it2.checked) {
                    it.checked = true
                    it.next_refresh = it2.next_refresh
                }
            })
        })
        bean.roles = roles
        this.setData({
            mData: bean
        })
        wx.setNavigationBarTitle({
            title: bean.name
        })
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
    switchChange(e) {
        let p = e.currentTarget.dataset.position
        let data = this.data.mData.roles

        data[p].checked = e.detail.value
        if (e.detail.value) {
            let next_refresh = this.data.mData.refresh_time
            let cur = parseInt(new Date().getTime() / 1000)
            while (next_refresh < cur) {
                next_refresh += this.data.mData.gap
            }
            data[p].next_refresh = next_refresh
        }

        app.onUp(this.data.mData._id, data)
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