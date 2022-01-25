// app.js
import {showModal} from "./utils/util";

App({
    onLaunch() {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                traceUser: true,
            })
        }

        // 展示本地存储能力
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.systemInfo = res;
                if (res.model.search('iphone X') !== -1) {
                    this.globalData.isIpohoneX = true;
                }
                // if (res.screenHeight - res.windowHeight - res.statusBarHeight - 34 > 72) {
                //     this.globalData.isFullScreen = true;
                // }

                this.globalData.statusBarHeight = res.statusBarHeight;
                let capsuleBound = wx.getMenuButtonBoundingClientRect();
                this.globalData.navigationHeight = capsuleBound.top - res.statusBarHeight + capsuleBound.bottom;
            }
        });
    },

    checkUpdate() {
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(res => {
            // 请求完新版本信息的回调
        })

        updateManager.onUpdateReady(function () {
            showModal(
                '新版本已经准备好，是否重启应用？',
                '更新提示',
                (res) => {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            )
        })

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
        })
    },

    onUpload: function (collectionName, dataArray) {
        this.onQuery(collectionName, dataArray, "up")
    },
    onDownload: function (collectionName,func) {
        this.onQuery(collectionName, null, "down",func)
    },

    onAdd: function (collectionName, dataArray) {
        const db = wx.cloud.database()
        let data
        data = {
            dataArray: dataArray,
        }
        wx.showLoading({
            title: '加载中',
        })
        db.collection(collectionName).add({
            data: data,
            success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                this.onQuery(collectionName)
                wx.hideLoading()
                wx.showToast({
                    title: '新增数据成功',
                })
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '新增数据失败'
                })
            }
        })
    },

    onQuery: function (collectionName, dataArray, type,func) {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        let index2
        if (collectionName == "roles") {
            index2 = "roleArray"
        } else if (collectionName == "maps") {
            index2 = "mapArray"
        }
        wx.showLoading({
            title: '加载中',
        })
        db.collection(collectionName).where({
            _openid: wx.getStorageSync("openid")
        }).get({
            success: res => {
                wx.hideLoading()

                if (res.data.length > 0) {
                    if (type == "up") {
                    this.onUp(res.data[0]._id, dataArray)
                    } else if (type == "down"){
                        wx.setStorageSync(collectionName, JSON.stringify(res.data[0].dataArray))
                        func()
                    }
                } else {
                    if (type == "up") {
                    this.onAdd(collectionName, dataArray)
                    } else if (type == "down"){
                        wx.showToast({
                            icon: 'none',
                            title: '你在云端没数据'
                        })
                    }
                }

                console.log('[数据库] [查询记录] 成功: ', res)
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
                console.error('[数据库] [查询记录] 失败：', err)
            }
        })
    },

    onUp: function (id, dataArray) {

        const db = wx.cloud.database()
        wx.showLoading({
            title: '更新中',
        })
        db.collection('maps').doc(id).update({
            data: {
                dataArray:dataArray
            },

            success: res => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '更新数据成功'
                })
                console.error('[数据库] [更新记录] 成功：', res)
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '更新数据失败'
                })
                console.error('[数据库] [更新记录] 失败：', err)
            }
        })
    },

    onDelete: function (collection, id) {
        const db = wx.cloud.database()
        db.collection(collection).doc(id).remove({
            success: res => {
                wx.showToast({
                    title: '删除成功',
                })
                this.onQuery(collection)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '删除失败',
                })
                console.error('[数据库] [删除记录] 失败：', err)
            }
        })
    },

    // 定义调用云函数获取openid
    getOpenid() {
        wx.cloud.callFunction({
            name: 'get',
            complete: res => {
                var openid = res.result.openid
                console.log("openid", openid)
                wx.setStorageSync("openid", openid)
                return openid
            }
        })
    },

    globalData: {
        statusBarHeight: 0,
        navigationHeight: 0,
    }
})
