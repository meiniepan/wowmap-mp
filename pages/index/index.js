// index.js
// 获取应用实例
const app = getApp()

Page({
    data: {
        topMargin: app.globalData.navigationHeight,
        curRole: {addRoleName: "还没角色呢", jobString: "", addAccountName: "",icon:"ic_empty.jpg",color:"#FFFFFF"},
        addTitle: "创建角色",
        roleArray: [],
        mapArray: [{name: "sdf", checked: true, remark: "剩余：时发生地方"}],
        addRoleName: "",
        jobString: "法师",
        weekString: "周四",
        gapString: "七天",
        actArrays: ["创建角色", "创建副本", "更换背景",],
        jobArrays: ["法师", "德鲁伊", "术士", "牧师", "战士", "圣骑士", "猎人", "潜行者",],
        iconArrays: ["ic_fs.png", "ic_xd.png", "ic_ss.png", "ic_ms.png", "ic_zs.png", "ic_sq.png", "ic_lr.png", "ic_dz.png",],
        colorArrays: ["#69CCF0", "#FF7D0A", "#9482C9", "#FFFFFF", "#C79C6E", "#F58CBA", "#ABD473", "#FFF569",],
        weekArrays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        gapArrays: ["三天", "五天", "七天",],
        MondayTime: 1642978800,//2022-01-24 07:00:00 周一
        TuesdayTime: 1643065200,
        Wednesday: 1643151600,
        ThursdayTime: 1643238000,
        FridayTime: 1643324400,
        SaturdayTime: 1643410800,
        SundayTime: 1643497200,
        gap3Time: 3 * 24 * 60 * 60,
        gap5Time: 5 * 24 * 60 * 60,
        gap7Time: 7 * 24 * 60 * 60,

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.checkUpdate()
        this.getOpenid()
        this.onQuery("roles")
        this.onQuery("maps")
        this.setData({
            bac: wx.getStorageSync("bac"),
        })
        let curR = wx.getStorageSync("cur_role")
        console.log("cur",curR)
        if (curR.length>0){
            this.setData({
                curRole: curR,
            })
        }
        let ss = parseInt(new Date().getTime() / 1000)
        console.log("time", ss)
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
    doAct(e) {
        if (e.detail.value == 0) {
            this.addRole()
        } else if (e.detail.value == 1) {
            this.addMap()
        } else if (e.detail.value == 2) {
            this.chooseAvatar()
        }

    },
    doJob(e) {

        this.setData({
            jobString: this.data.jobArrays[e.detail.value]
        })

    },
    doWeek(e) {
        this.setData({
            weekString: this.data.weekArrays[e.detail.value]
        })

    },
    doGap(e) {
        this.setData({
            gapString: this.data.gapArrays[e.detail.value]
        })

    },

    getRoleIcon(e) {
        for (let i = 0; i < this.data.jobArrays.length; i++) {
            if (e.jobString == this.data.jobArrays[i]) {
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
        } else {
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
        }
    },
    doInput: function (e) {

        let type = e.currentTarget.dataset.type;

        this.setData({
            [type]: e.detail.value
        });
    },

    // 定义调用云函数获取openid
    getOpenid() {
        wx.cloud.callFunction({
            name: 'get',
            complete: res => {
                console.log('openid--', res.result)
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
                role: this.data.jobString,
                account: this.data.addAccountName,
            }
        } else if (collectionName == "maps") {
            data = {
                name: this.data.addMapName,
                refresh_time: this.data.weekString,
                gap: this.data.gapString,
            }
        }
        db.collection(collectionName).add({
            data: data,
            success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                this.onQuery(collectionName)
                wx.showToast({
                    title: '新增记录成功',
                })
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '新增记录失败'
                })
            }
        })
    },
    onQuery: function (collectionName) {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        let index2
        if (collectionName == "roles") {
            index2 = "roleArray"
        } else if (collectionName == "maps") {
            index2 = "mapArray"
        }
        db.collection(collectionName).where({
            _openid: this.data.openid
        }).get({
            success: res => {
                if (collectionName == "roles") {
                    if (res.data.length>0){
                        res.data.forEach(it=>{
                            this.getRoleIcon(it)
                        })
                    }
                }
                this.setData({
                    [index2]: res.data
                })
                console.log('[数据库] [查询记录] 成功: ', res)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '查询记录失败'
                })
                console.error('[数据库] [查询记录] 失败：', err)
            }
        })
    },
    onUpdate: function () {
        const db = wx.cloud.database()
        const newCount = this.data.count + 1
        db.collection('users').doc(this.data.counterId).update({
            data: {
                count: newCount
            },
            success: res => {
                console.log(res);
                this.setData({
                    count: newCount
                })
            },
            fail: err => {
                icon: 'none',
                    console.error('[数据库] [更新记录] 失败：', err)
            }
        })
    },

    onDelete: function () {
        if (this.data.counterId) {
            const db = wx.cloud.database()
            db.collection('users').doc(this.data.counterId).remove({
                success: res => {
                    wx.showToast({
                        title: '删除成功',
                    })
                    this.setData({
                        counterId: '',
                        count: null,
                    })
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '删除失败',
                    })
                    console.error('[数据库] [删除记录] 失败：', err)
                }
            })
        } else {
            wx.showToast({
                title: '无记录可删，请见创建一个记录',
            })
        }
    },

})
