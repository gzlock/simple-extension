import { ContextMenu } from './contextMenu'
import { Rules } from './rules'

const rules = new Rules()
const menu = new ContextMenu(rules)
chrome.runtime.onMessage.addListener(async (msg: any, sender, res) => {
  if (msg == 'update') {
    await rules.update()
    await menu.updateMenu()
  }
})