import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import { clearData, loadData, saveData } from '../utils/data'
import { forEach } from 'lodash-es'

// 为 store state 声明类型

// 定义 popup
export const popupKey: InjectionKey<Store<Settings>> = Symbol()

export const popupStore = createStore<Settings>({
  state: {
    config: { version: chrome.runtime.getManifest().version },
    domains: {},
    customUA: {},
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
    clear: () => clearData(),
  },
  modules: {},
})