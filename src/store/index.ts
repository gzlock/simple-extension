import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import { clearData, loadData, saveData } from '../utils/data'
import { forEach } from 'lodash-es'

type SimpleExtensionStore = Settings & { ui: { [name: string]: string } }
// 为 store state 声明类型

// 定义 popup
export const popupKey: InjectionKey<Store<SimpleExtensionStore>> = Symbol()

export const popupStore = createStore<SimpleExtensionStore>({
  state: {
    config: { version: chrome.runtime.getManifest().version },
    domains: {},
    customUA: {},
    ui: {
      extensionName: chrome.i18n.getMessage('extensionName'),
      extensionDesc: chrome.i18n.getMessage('extensionDesc'),
      add: chrome.i18n.getMessage('add'),
      default: chrome.i18n.getMessage('default'),
      prompt_save_cookies: chrome.i18n.getMessage('prompt_save_cookies'),
      remove_domain: chrome.i18n.getMessage('remove_domain'),
      remove_cookies: chrome.i18n.getMessage('remove_cookies'),
      name: chrome.i18n.getMessage('name'),
      value: chrome.i18n.getMessage('value'),
      action: chrome.i18n.getMessage('action'),
      data: chrome.i18n.getMessage('data'),
      domain: chrome.i18n.getMessage('domain'),
      ua: chrome.i18n.getMessage('ua'),
      current_ua: chrome.i18n.getMessage('current_ua'),
      default_ua: chrome.i18n.getMessage('default_ua'),
      about: chrome.i18n.getMessage('about'),
      options_title: chrome.i18n.getMessage('options_title'),
      add_ua: chrome.i18n.getMessage('add_ua'),
      custom_ua: chrome.i18n.getMessage('custom_ua'),
      cookies_action: chrome.i18n.getMessage('cookies_action'),
      switch_ua: chrome.i18n.getMessage('switch_ua'),
      hint_name: chrome.i18n.getMessage('hint_name'),
      hint_value: chrome.i18n.getMessage('hint_value'),
      empty: chrome.i18n.getMessage('empty'),
      import: chrome.i18n.getMessage('import'),
      use: chrome.i18n.getMessage('use'),
      used: chrome.i18n.getMessage('used'),
      cookies: chrome.i18n.getMessage('cookies'),
      reset: chrome.i18n.getMessage('reset'),
      import_success: chrome.i18n.getMessage('import_success'),
      import_fail: chrome.i18n.getMessage('import_fail'),
      github_link: chrome.i18n.getMessage('github_link'),
      save_cookie: chrome.i18n.getMessage('save_cookie'),
      save_but_empty: chrome.i18n.getMessage('save_but_empty'),
      switch: chrome.i18n.getMessage('switch'),
      search_domain: chrome.i18n.getMessage('search_domain'),
      search_domain_hint: chrome.i18n.getMessage('search_domain_hint'),
      cookies_content: chrome.i18n.getMessage('cookies_content'),
      privacy_policy: chrome.i18n.getMessage('privacy_policy')
    },
  },
  mutations: {
    isContainDomain (state, url: string): boolean {
      const _url = new URL(url)
      return Object.keys(state.domains).indexOf(_url.host) != -1
    },
  },
  actions: {
    async load ({ state }) {
      const { domains, customUA } = await loadData()
      Object.keys(state.domains).
        forEach(key => delete state.domains[key])
      forEach(domains, (domain, key) => state.domains[key] = domain)

      Object.keys(state.customUA).forEach(key => delete state.customUA[key])
      state.customUA = customUA
    },
    save () { return saveData(this.state) },
    clear () { return clearData()},
  },
  modules: {},
})