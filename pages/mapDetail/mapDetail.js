// pages/mapDetail/mapDetail.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bac2:"",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let beans = JSON.parse(options.bean)
        let roles = JSON.parse(options.roles)
        let p = options.p
        let bean = beans[p]
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
            mData: bean,
            mapArray: beans,
            mP: p,
            title: bean.name,
            bac2:wx.getStorageSync("bac2"),
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

    doFinish() {
        wx.navigateBack({
            delta: 1,
        })
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
        this.data.mData.roles = data
        let mm = this.data.mapArray
        mm[p] = this.data.mData
        wx.setStorageSync("maps", JSON.stringify(mm))
    },

    chooseAvatar: function () {

        wx.chooseImage({
            success: res => {
                wx.setStorageSync("bac2", res.tempFilePaths)
                this.setData({
                    bac2: res.tempFilePaths
                })
            }
        })
    },
    ss: function () {

        console.log("haha","222")
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