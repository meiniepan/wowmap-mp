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

    updateManager.onCheckForUpdate(res=> {
      // 请求完新版本信息的回调
      console.log("hasUpdate",res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      showModal(
          '新版本已经准备好，是否重启应用？',
          '更新提示',
          (res)=> {
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

  globalData: {
    statusBarHeight: 0,
    navigationHeight: 0,
  }
})
