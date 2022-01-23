function showModal(content, title = '温馨提示', suc = () => {
}) {
  wx.showModal({
    title: title,
    content: content,
    success(res) {
      suc(res)
    },
    confirmColor: "#F95B49",
  })
}

module.exports = {
  showModal
}
