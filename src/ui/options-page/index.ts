import ElementPlus from 'element-plus'
import { notivue } from "src/utils/notifications"
import { appRouter } from "src/utils/router"
import { createApp } from "vue"
import App from "./app.vue"
import { ca } from 'element-plus/es/locales.mjs'
import { send } from 'vite'

appRouter.addRoute({
  path: "/",
  redirect: "/options-page",
})

const app = createApp(App).use(notivue).use(appRouter).use(ElementPlus)



self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

const settings = ref<Settings>()


chrome.runtime.sendMessage({ action: "loadSettings" }).then((response) => {
  console.log('options-page', response)
  settings.value = response
  app.provide('settings', { settings, updateSettings })
  app.mount("#app")
})

function updateSettings() {
  console.log('选项页面', '保存settings', settings.value);

  chrome.runtime.sendMessage({ action: "setSettings", settings: settings.value })
}

chrome.runtime.onMessage.addListener((msg: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
  if (msg.action === "settingsChanged") {
    settings.value = msg.settings
  }
  sendResponse('ok')
  return true
})

export default app