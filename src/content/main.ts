// 立即刷新页面菜单
document.addEventListener('mousedown', (e) => {
  if (e.button == 2) {
    chrome.runtime.sendMessage(
      'contextmenu',
      (res) => {
        // console.log('simple-extension update menu', res)
      },
    )
  }
})

// 更新数据
document.addEventListener('load', () => {
  chrome.runtime.sendMessage('update')
})