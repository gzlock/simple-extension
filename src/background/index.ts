// Sample code if using extensionpay.com
// import { extPay } from 'src/utils/payment/extPay'
// extPay.startBackground()

import { forEach } from "lodash-es"
import { loadData, saveData } from "src/utils/data"
import { Domain } from "../utils/domain"
import { ContextMenu } from "./contextMenu"
import { Rules } from "./rules"

let settings: Settings
let rules: Rules = new Rules()
let menu: ContextMenu = new ContextMenu(rules)
menu.onChanged = onSettingsChanged

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === "install") {
    // chrome.tabs.create({
    //   active: true,
    //   // Open the setup page and append `?type=install` to the URL so frontend
    //   // can know if we need to show the install page or update page.
    //   url: chrome.runtime.getURL("src/ui/setup/index.html#/setup/install"),
    // })
    //
    // return
  }

  if (opt.reason === "update") {
    // chrome.tabs.create({
    //   active: true,
    //   url: chrome.runtime.getURL("src/ui/setup/index.html#/setup/update"),
    // })
    //
    // return
  }
})

// message listener
chrome.runtime.onMessage.addListener(
  (msg: BgMsgOptions, sender: chrome.runtime.MessageSender, sendResponse: any) => {
    // console.log("background script", "chrome.runtime.onMessage", msg)
    if (msg.action === "update") {
      rules.update(settings)
    } else if (msg.action === "updateContextMenu") {
      msg.tab = sender.tab
      menu.updateMenu(msg)
    } else if (msg.action == 'loadSettings') {
      return sendResponse(settings)
    } else if (msg.action == 'setSettings') {
      /// from options page
      /// all json
      /// need to convert to the Domain class
      const newSettings = msg.settings!
      const { config, customUA } = newSettings
      const domains: Domains = {}

      forEach(newSettings.domains, (data: any, domain: string) => {
        domains[domain] = Domain.fromJSON(data)
      })
      Object.assign(settings, { domains, config, customUA })
      menu.settings = settings
      onSettingsChanged(false)
    }
    sendResponse("ok")
    return true
  },
)

// 扩展图标的点击行为
chrome.action.onClicked.addListener(async (tab) => {
  let hash = ''
  if (tab.url?.startsWith('http')) {
    hash = `#${new URL(tab.url).hostname}`
  }
  const url = chrome.runtime.getURL('src/ui/options-page/index.html')
  // console.log('打开', url + domain)
  await chrome.tabs.create({ url: `${url}${hash}` })
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

// console.info("hello world from background")


async function update(): Promise<void> {
  settings = await loadData()
  menu.settings = settings
  await rules.update(settings)
}

async function onSettingsChanged(notifyOptionsPage = true) {
  // console.log("background.ts", "settings changed", settings)
  saveData(settings)
  await rules.update(settings)
  if (notifyOptionsPage)
    chrome.runtime.sendMessage({ action: "settingsChanged", settings })
}

update()

export { }

