// index.js
// 获取应用实例
import {showModal} from "../../utils/util";

const app = getApp()

Page({
    data: {
        topMargin: app.globalData.navigationHeight,
        curRole: {name: "还没角色呢", jobString: "", account: "", icon: "ic_empty.jpg", color: "#FFFFFF"},
        addTitle: "创建角色",
        roleArray: [],
        mapArray: [{name: "", checked: false, remark: "", roles: [{name: "", checked: false, remark: ""}]}],
        addRoleName: "",
        jobString: "法师",
        weekString: "周四",
        gapString: "七天",
        actArrays: ["创建角色", "创建副本", "更换背景", "删除角色", "删除副本",],
        jobArrays: ["法师", "德鲁伊", "术士", "牧师", "战士", "圣骑士", "猎人", "潜行者", "萨满祭司",],
        iconArrays: ["ic_fs.png", "ic_xd.png", "ic_ss.png", "ic_ms.png", "ic_zs.png", "ic_sq.png", "ic_lr.png", "ic_dz.png", "ic_smjs.png"],
        colorArrays: ["#69CCF0", "#FF7D0A", "#9482C9", "#FFFFFF", "#C79C6E", "#F58CBA", "#ABD473", "#FFF569", "#0070DE"],
        weekArrays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        gapArrays: ["三天", "五天", "七天",],
        refresh_time: 1643238000,
        gap: 7 * 24 * 60 * 60,
        refreshArray: [1642978800, 1643065200, 1643151600, 1643238000, 1643324400, 1643410800, 1643497200,],
        MondayTime: 1642978800,//2022-01-24 07:00:00 周一
        gapArray: [3 * 24 * 60 * 60, 5 * 24 * 60 * 60, 7 * 24 * 60 * 60,],
        gap3Time: 3 * 24 * 60 * 60,

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.checkUpdate()
        this.getOpenid()
        this.onQuery("roles")
        this.setData({
            bac: wx.getStorageSync("bac"),
        })
        let curR = wx.getStorageSync("cur_role", null)

        if (curR instanceof Object) {
            this.setData({
                curRole: curR,
            })
        }

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
        this.onQuery("maps")
    },
    doAct(e) {
        if (e.detail.value == 0) {
            this.addRole()
        } else if (e.detail.value == 1) {
            this.addMap()
        } else if (e.detail.value == 2) {
            this.chooseAvatar()
        } else if (e.detail.value == 3) {
            this.setData({
                show: true,
                addTitle: "删除角色",
            })
        } else if (e.detail.value == 4) {
            this.setData({
                show: true,
                addTitle: "删除副本",
            })
        }

    },
    doCheck(e) {
        let p = e.currentTarget.dataset.position
        wx.showModal({
            title: "你很强！",
            content: "",
            success: (res) => {
                let old = this.data.mapArray[p].checked
                if (old == res.confirm) {
                    return
                }
                let has = false
                let data = this.data.mapArray[p].roles

                let next_refresh = this.data.mapArray[p].refresh_time
                let cur = parseInt(new Date().getTime() / 1000)
                while (next_refresh < cur) {
                    next_refresh += this.data.mapArray[p].gap
                }

                data.forEach(it => {
                    if ((it.name + it.job + it.account) == (this.data.curRole.name + this.data.curRole.job + this.data.curRole.account)) {
                        if (res.confirm) {
                            it.checked = true
                            it.next_refresh = next_refresh
                        } else if (res.cancel) {
                            it.checked = false
                        }
                        has = true
                    }
                })
                if (!has && res.confirm) {
                    data.push({
                        name: this.data.curRole.name,
                        job: this.data.curRole.job,
                        account: this.data.curRole.account,
                        checked: true,
                        next_refresh: next_refresh
                    })
                }
                if (res.confirm) {
                    this.data.mapArray[p].checked = true


                } else if (res.cancel) {
                    this.data.mapArray[p].checked = false

                }

                app.onUp(this.data.mapArray[p]._id, data)
                this.setData({
                    mapArray: this.data.mapArray
                })
            },
            confirmColor: "#1677FF",
            confirmText: "打完了",
            cancelText: "没打完"
        })

    },
    setRole(e) {
        let p = e.currentTarget.dataset.position
        wx.setStorageSync("cur_role", this.data.roleArray[p])
        this.setData({
            curRole: this.data.roleArray[p],
            show: false,
        }, () => {
            this.setMaps()
        })
    },
    chooseRole: function () {
        this.setData({
            show: true,
            addTitle: "选择角色",
        })

    },
    doJob(e) {

        this.setData({
            jobString: this.data.jobArrays[e.detail.value]
        })

    },
    doWeek(e) {
        this.setData({
            weekString: this.data.weekArrays[e.detail.value],
            refresh_time: this.data.refreshArray[e.detail.value],
        })

    },
    doGap(e) {
        this.setData({
            gapString: this.data.gapArrays[e.detail.value],
            gap: this.data.gapArray[e.detail.value],
        })

    },

    getRoleIcon(e) {
        for (let i = 0; i < this.data.jobArrays.length; i++) {
            if (e.job == this.data.jobArrays[i]) {
                e.icon = this.data.iconArrays[i]
                e.color = this.data.colorArrays[i]
            }
        }
    },

    chooseAvatar: function () {

        wx.chooseImage({
            success: res => {
                wx.setStorageSync("bac", res.tempFilePaths)
                this.setData({
                    bac: res.tempFilePaths
                })
            }
        })
    },
    addRole: function () {
        this.setData({
            show: true,
            addTitle: "创建角色",
        })

    },
    addMap: function () {
        this.setData({
            show: true,
            addTitle: "创建副本",
        })
    },
    doBtn2() {

        if (this.data.addTitle == "创建角色") {
            if (!this.data.addRoleName.length > 0) {
                wx.showToast({
                    icon: "none",
                    title: '请输入角色名',
                })
                return
            }
            this.setData({
                show: false,
            })
            this.onAdd("roles")
        } else if (this.data.addTitle == "创建副本") {
            if (!this.data.addMapName.length > 0) {
                wx.showToast({
                    icon: "none",
                    title: '请输入副本名',
                })
                return
            }
            this.setData({
                show: false,
            })
            this.onAdd("maps")
        } else if (this.data.addTitle == "删除角色") {
            let bean = null
            this.data.roleArray.forEach(it => {
                if (it.delChecked) {
                    bean = it
                }
            })
            if (bean == null) {
                wx.showToast({
                    icon: "none",
                    title: '请先选择',
                })
                return
            }
            this.setData({
                show: false,
            })
            this.onDelete("roles", bean._id)
        } else if (this.data.addTitle == "删除副本") {
            let bean = null
            this.data.mapArray.forEach(it => {
                if (it.delChecked) {
                    bean = it
                }
            })
            if (bean == null) {
                wx.showToast({
                    icon: "none",
                    title: '请先选择',
                })
                return
            }
            this.setData({
                show: false,
            })
            this.onDelete("maps", bean._id)
        }
    },
    doInput: function (e) {

        let type = e.currentTarget.dataset.type;

        this.setData({
            [type]: e.detail.value
        });
    },
    doClickMap: function (e) {
        let p = e.currentTarget.dataset.position;

        wx.navigateTo({
            url: '/pages/mapDetail/mapDetail?bean='
                + JSON.stringify(this.data.mapArray[p]) +
                '&roles=' + JSON.stringify(this.data.roleArray),
        })
    },
    checkDel: function (e) {
        let p = e.currentTarget.dataset.position;
        if (this.data.addTitle == "删除角色") {
            let checked = this.data.roleArray[p].delChecked
            if (checked != true) {
                this.data.roleArray.forEach(it => {
                    it.delChecked = false
                })
                this.data.roleArray[p].delChecked = true
            }
            this.setData({
                roleArray: this.data.roleArray
            });

        } else if (this.data.addTitle == "删除副本") {
            let checked = this.data.mapArray[p].delChecked
            if (checked != true) {
                this.data.mapArray.forEach(it => {
                    it.delChecked = false
                })
                this.data.mapArray[p].delChecked = true
            }
            this.setData({
                mapArray: this.data.mapArray
            });
        }

    },

    // 定义调用云函数获取openid
    getOpenid() {
        wx.cloud.callFunction({
            name: 'get',
            complete: res => {
                var openid = res.result.openid
                this.setData({
                    openid: openid
                })
            }
        })
    },

    onAdd: function (collectionName) {
        const db = wx.cloud.database()
        let data
        if (collectionName == "roles") {
            data = {
                name: this.data.addRoleName,
                job: this.data.jobString,
                account: this.data.addAccountName,
            }
        } else if (collectionName == "maps") {
            data = {
                name: this.data.addMapName,
                refresh_time: this.data.refresh_time,
                gap: this.data.gap,
                roles: [],
            }
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
                    title: '新增记录成功',
                })
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '新增记录失败'
                })
            }
        })
    },
    setMaps() {
        this.data.mapArray.forEach(bean => {
            bean.checked = false
            this.setMap(bean)
        })
        this.setData({
            mapArray: this.data.mapArray
        })
    },
    setMap: function (it) {
        it.roles.forEach(bean => {
            if ((bean.name + bean.job + bean.account) == (this.data.curRole.name + this.data.curRole.job + this.data.curRole.account)) {
                it.checked = bean.checked
                if (it.checked) {//如果已标记，判断是否可以重置
                    let cur = parseInt(new Date().getTime() / 1000)
                    console.log("next_refresh", it.next_refresh)
                    if (cur > it.next_refresh) {
                        it.checked = false
                    }
                }
            }
        })
    }, onQuery: function (collectionName) {
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
            _openid: this.data.openid
        }).get({
            success: res => {
                wx.hideLoading()
                if (collectionName == "roles") {
                    if (res.data.length > 0) {
                        res.data.forEach(it => {
                            this.getRoleIcon(it)
                        })
                    }
                } else {//处理副本属性
                    if (res.data.length > 0) {
                        res.data.forEach(it => {
                            this.setMap(it);
                            let next_refresh = it.refresh_time
                            let cur = parseInt(new Date().getTime() / 1000)
                            while (next_refresh < cur) {
                                next_refresh += this.data.mapArray[p].gap
                            }
                            let remark = next_refresh - cur
                            let timeDay = parseInt(remark / (24 * 60 * 60))
                            let timeH = parseInt(remark % (24 * 60 * 60) / (60 * 60))
                            let timeM = parseInt(remark % (60 * 60) / (60))
                            remark = "剩余: " + timeDay + "天" + timeH + "小时" + timeM + "分"
                            it.remark = remark
                        })
                    }
                }
                this.setData({
                    [index2]: res.data
                })
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
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
