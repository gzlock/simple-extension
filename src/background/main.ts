import { ContextMenu } from './contextMenu'
import { Rules } from './rules'
import { fillCookies } from '../utils/cookies'
import { Domain } from '../utils/domain'
import { forEach, isEmpty } from 'lodash-es'

const rules = new Rules()
const menu = new ContextMenu(rules)
chrome.runtime.onMessage.addListener(async (msg: any, sender, res) => {
  if (msg == 'update') {
    await rules.update()
    await menu.updateMenu()
  }
})

// 填充cookies
chrome.storage.local.get((data: Settings) => {
  forEach(data.domains, (domain: Domain) => {
    if (domain.cookies.selected) {
      const cookies = domain.cookies.cookies[domain.cookies.selected]
      if (!isEmpty(cookies)) fillCookies(cookies)
    }
  })
})

// 扩展图标的点击行为
chrome.action.onClicked.addListener((tab) => {
  const url = chrome.runtime.getURL('src/options/options.html')
  chrome.tabs.create({ url })
})