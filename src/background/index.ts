// Sample code if using extensionpay.com
// import { extPay } from 'src/utils/payment/extPay'
// extPay.startBackground()

import { forEach, isArray } from "lodash-es"
import { loadData, saveData } from "src/utils/data"
import { Domain } from "../utils/domain"
import { ContextMenu } from "./contextMenu"
import { Rules } from "./rules"
import { fillCookies } from "../utils/cookies"

let settings: Settings
const rules: Rules = new Rules()
const menu: ContextMenu = new ContextMenu()
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
  (
    msg: BgMsgOptions,
    sender: chrome.runtime.MessageSender,
    sendResponse: any,
  ) => {
    // console.log("background script", "chrome.runtime.onMessage", msg)
    if (msg.action === "updateContextMenu") {
      msg.tab = sender.tab
      menu.updateMenu(msg)
    } else if (msg.action == "loadSettings") {
      return sendResponse(settings)
    } else if (msg.action == "setSettings") {
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
  let hash = ""
  if (tab.url?.startsWith("http")) {
    hash = `#${new URL(tab.url).hostname}`
  }
  const url = chrome.runtime.getURL("src/ui/options-page/index.html")
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

async function onSettingsChanged(notifyOptionsPage = true) {
  // console.log("background.ts", "settings changed", settings)
  await Promise.all([
    saveData(settings),
    rules.update(settings),
    updateCookies(),
  ])
  if (notifyOptionsPage)
    chrome.runtime.sendMessage({ action: "settingsChanged", settings })
}

async function updateCookies() {
  const promises = Object.keys(settings.domains).map(async (host) => {
    const domain = settings.domains[host]
    if (domain && domain.cookies.selected) {
      const cookies = domain.cookies.cookies[domain.cookies.selected!]
      if (isArray(cookies)) {
        await fillCookies(cookies)
      }
    }
  })
  await Promise.all(promises)
}

async function init(): Promise<void> {
  settings = await loadData()
  menu.settings = settings
  await rules.update(settings)
  await updateCookies()
}

init()

export {}
