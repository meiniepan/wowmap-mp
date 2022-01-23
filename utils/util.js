function showModal(content, title = '温馨提示', suc = () => {
}) {
  wx.showModal({
    title: title,
    content: content,
    success(res) {
      suc(res)
    },
    confirmColor: "#1677FF",
  })
}

module.exports = {
  showModal
}
