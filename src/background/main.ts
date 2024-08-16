import { ContextMenu } from './contextMenu'
import { Rules } from './rules'
import { fillCookies } from '../utils/cookies'
import { Domain } from '../utils/domain'
import { forEach, isEmpty } from 'lodash-es'

const rules = new Rules()
const menu = new ContextMenu(rules)

// 填充cookies
chrome.storage.local.get((data: Settings) => {
  console.log('填充cookies')
  if (data) {
    forEach(data.domains, (domain: Domain) => {
      if (domain.cookies.selected) {
        const cookies = domain.cookies.cookies[domain.cookies.selected]
        if (!isEmpty(cookies)) fillCookies(cookies)
      }
    })
  }
})

// 监听消息事件功能需要在background.js每次被唤醒后都执行，所以不能放去onInstalled
chrome.runtime.onMessage.addListener(
  async (msg: any, sender, sendResponse) => {
    console.log('background.js', 'chrome.runtime.onMessage', msg)
    if (msg === 'update') {
      await rules.update()
      await menu.loadData()
    } else if (msg === 'contextmenu') {
      await menu.updateMenu(sender.tab!)
    }
    sendResponse('ok')
  },
)

// 扩展图标的点击行为
chrome.action.onClicked.addListener(async (tab) => {
  let domain = tab.url ? `#${new URL(tab.url).host}` : ''
  const url = chrome.runtime.getURL('src/options/options.html')
  // console.log('打开', url + domain)
  await chrome.tabs.create({ url: url + domain })
})

// 切换Tab时清空右键菜单
// 针对 浏览器设置页面、收藏夹页面之类
// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//   await menu.clear()
// })