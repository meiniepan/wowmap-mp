// index.js
// 获取应用实例
import {showModal} from "../../utils/util";

const app = getApp()

Page({
    data: {
        topMargin: app.globalData.navigationHeight,
        curRole: {name: "指引角色", job: "法师", account: "", icon: "ic_empty.jpg", color: "#FFFFFF"},
        addTitle: "创建角色",
        roleArray: [{name: "指引角色", job: "法师", account: "", icon: "ic_empty.jpg", color: "#FFFFFF"}],
        mapArray: [{
            name: "指引副本",
            refresh_time: 1643238000,
            gap: 7 * 24 * 60 * 60,
            checked: false,
            remark: "请创建自己的副本",
            roles: [{name: "", checked: false, remark: ""}]
        }],
        addRoleName: "",
        addMapName: "",
        addAccountName: "",
        jobString: "法师",
        weekString: "周四",
        gapString: "七天",
        actArrays: ["创建角色", "创建副本", "更换背景", "删除角色", "删除副本",
            "上传数据到云端", "从云端拉取数据",],
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
        de: 0,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.checkUpdate()
        let openid = wx.getStorageSync("openid")
        if (openid.length == 0) {
            openid = app.getOpenid()
        }
        this.setData({
            openid: openid
        })
        this.onLocalQuery("roles")
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
        this.onLocalQuery("maps")
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
        }else if (e.detail.value == 5) {
            app.onUpload("roles",this.data.roleArray)
            app.onUpload("maps",this.data.mapArray)
        }else if (e.detail.value == 6) {
            app.onDownload("roles",()=>{
                this.onLocalQuery("roles")
            })
            app.onDownload("maps",()=>{
                this.onLocalQuery("maps")
            })
        }

    },
    doCheck(e) {
        let p = e.currentTarget.dataset.position
        this.setData({
            curMap: p,
            showModal: true
        })

    },
    doMark() {
        let p = this.data.curMap
        let old = this.data.mapArray[p].checked
        if (old) {
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
                it.checked = true
                it.next_refresh = next_refresh
                has = true
            }
        })
        if (!has) {
            data.push({
                name: this.data.curRole.name,
                job: this.data.curRole.job,
                account: this.data.curRole.account,
                checked: true,
                next_refresh: next_refresh
            })
        }
        this.data.mapArray[p].checked = true
        this.data.mapArray[p].roles = data
        this.setData({
            mapArray: this.data.mapArray,
            showModal: false
        }, () => {
            this.imageAnimation(true)
            this.onLocalUpdate("maps", this.data.curRole.name)
        })
    },
    undoMark() {
        let p = this.data.curMap
        let old = this.data.mapArray[p].checked
        if (!old) {
            return
        }
        let data = this.data.mapArray[p].roles

        data.forEach(it => {
            if ((it.name + it.job + it.account) == (this.data.curRole.name + this.data.curRole.job + this.data.curRole.account)) {

                it.checked = false
            }
        })
        this.data.mapArray[p].checked = false
        this.data.mapArray[p].roles = data
        this.setData({
            mapArray: this.data.mapArray,
            showModal: false
        }, () => {
            this.imageAnimation(false)
            this.onLocalUpdate("maps", this.data.curRole.name)
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
            this.onLocalAdd("roles")
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
            this.onLocalAdd("maps")
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
            this.onLocalDelete("roles", bean._id)
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
            this.onLocalDelete("maps", bean._id)
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
                + JSON.stringify(this.data.mapArray)
                + '&roles=' + JSON.stringify(this.data.roleArray)
                + '&p=' + p,
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
                    console.log("next_refresh", bean.next_refresh)
                    if (cur > bean.next_refresh) {
                        it.checked = false
                    }
                }
            }
        })
    },

    onLocalAdd: function (collectionName) {

        let data
        if (collectionName == "roles") {
            if (this.data.roleArray[0].name == "指引角色") {
                this.data.roleArray = []
            }
            data = {
                _id: new Date().getTime(),
                name: this.data.addRoleName,
                job: this.data.jobString,
                account: this.data.addAccountName,
            }
            this.data.roleArray.push(data)
            wx.setStorageSync(collectionName, JSON.stringify(this.data.roleArray))
            wx.showToast({
                title: '新增角色成功',
            })
            this.onLocalQuery("roles")
        } else if (collectionName == "maps") {
            if (this.data.mapArray[0].name == "指引副本") {
                this.data.mapArray = []
            }
            data = {
                _id: new Date().getTime(),
                name: this.data.addMapName,
                refresh_time: this.data.refresh_time,
                gap: this.data.gap,
                roles: [],
            }
            this.data.mapArray.push(data)
            wx.setStorageSync(collectionName, JSON.stringify(this.data.mapArray))
            wx.showToast({
                title: '新增副本成功',
            })
            this.onLocalQuery("maps")
        }

    },

    onLocalQuery(collectionName) {
        let index2
        if (collectionName == "roles") {
            index2 = "roleArray"
        } else if (collectionName == "maps") {
            index2 = "mapArray"
        }
        let json = wx.getStorageSync(collectionName)
        if (json.length == 0) {
            return
        }
        let dataArray = JSON.parse(json)
        if (collectionName == "roles") {
            if (dataArray.length > 0) {
                dataArray.forEach(it => {
                    this.getRoleIcon(it)
                })
            }
        } else {//处理副本属性
            if (dataArray.length > 0) {
                dataArray.forEach(it => {
                    this.setMap(it);
                    let next_refresh = it.refresh_time
                    let cur = parseInt(new Date().getTime() / 1000)
                    while (next_refresh < cur) {
                        next_refresh += it.gap
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
        if (dataArray.length > 0) {
            this.setData({
                [index2]: dataArray
            })
        }
    },

    onLocalUpdate: function (collectionName, roleName) {
        if (roleName == "指引角色") {
            return
        }
        wx.setStorageSync(collectionName, JSON.stringify(this.data.mapArray))
    },

    onLocalDelete: function (collectionName, id) {
        let index2
        let data
        if (collectionName == "roles") {
            index2 = "roleArray"
            data = this.data.roleArray
        } else if (collectionName == "maps") {
            index2 = "mapArray"
            data = this.data.mapArray
        }
        let p = -1
        for (let i = 0; i < data.length; i++) {
            if (data[i]._id == id) {
                p = i
                break
            }
        }
        if (p != -1) {
            data.splice(p, 1)
        }
        wx.setStorageSync(collectionName, JSON.stringify(data))
        this.setData({
            [index2]: data
        })
    },


    imageAnimation(checked) {
        var animation = wx.createAnimation({

            duration: 60,
            timingFunction: "ease",
            delay: 0,

        })
        let de = this.data.de + 180


        // animation.rotate(de).step();     //旋转9

        animation.scale(0.0).step();        //放大
        animation.scale(1.2).step();        //放大
        animation.scale(1.0).step();        //放大

        // animation.translate(0,200).step(); //偏移
        // animation.skew(de, de).step();      //倾斜x,y
        // animation.skew(-0,-50).step();      //倾斜x,y
        // animation.rotate(180).scale(0.8).translate(10,10).step() //同时执多个效果
        this.setData({
            animationData: animation.export(), //赋值
            de,
        }, () => {
            this.setData({
                animationData: null, //赋值
            })
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
