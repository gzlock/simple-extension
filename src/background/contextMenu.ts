import randomString from '../utils/randomString'
import sleep from '../utils/sleep'
import { getCurrentTab } from '../utils/getTab'
import { loadData, saveData } from '../utils/data'
import { Domain } from '../utils/domain'
import { forEach, isEmpty } from 'lodash-es'
import { Rules } from './rules'
import { UA } from '../utils/ua'
import { getCookies } from '../utils/cookies'

export class ContextMenu {
  private readonly rules: Rules
  private settings!: Settings
  private rootMenuId?: string
  private menus: { [key: string]: Menu } = {}

  constructor (rules: Rules) {
    this.rules = rules
    this.updateMenu()
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      console.log('点击了菜单', this.menus[info.menuItemId])
      this.menus[info.menuItemId]?.click?.call(this, info, tab)
    })
    sleep(100).then(() => {
      chrome.tabs.onUpdated.addListener(this.__onUpdatedTab.bind(this))
      chrome.tabs.onRemoved.addListener(this.__onRemovedTab.bind(this))
      chrome.tabs.onActivated.addListener(this.__onActivatedTab.bind(this))
      chrome.windows.onFocusChanged.addListener(
        this.__onWindowsFocusChanged.bind(this))
    })
  }

  async updateMenu (tab?: chrome.tabs.Tab) {
    await this.clear()
    this.settings = await loadData()
    tab ||= await getCurrentTab()
    console.log('updateMenu', tab?.url)
    if (!tab || !tab.url || !tab.url.startsWith('http')) {
      return
    }
    await this.__updateMenu(tab)
  }

  private async __updateMenu (tab: chrome.tabs.Tab) {
    const url = new URL(tab.url!)
    await this.__createRootMenu(url)
  }

  /**
   *
   */
  private async __createRootMenu (url: URL) {
    console.log('__createRootMenu')
    this.rootMenuId = this.__createMenu({
      title: url.host,
      children: [
        await this.__createCookieMenus(url),
        await this.__createUAMenus(url),
      ],
    })
  }

  private async __saveCookies (name: string | null, url: URL) {
    if (!name || isEmpty(name)) return
    const cookies = await getCookies(url.toString())
    const domain = this.settings.domains[url.hostname] ||
      new Domain()
    this.settings.domains[url.hostname] = domain
    domain.cookies.selected = name
    domain.cookies.cookies[name] = cookies
    await saveData(this.settings)
    await this.updateMenu()
  }

  /**
   * 创建选择文本后的菜单
   */
  private async __createCookieMenus (url: URL): Promise<Menu> {
    const domainCookies = await getCookies(url.toString())
    const hasCookies = domainCookies.length > 0
    const children: Menu[] = [
      {
        title: `保存${hasCookies ? '' : '(没有Cookies)'}`,
        enabled: domainCookies.length > 0,
        click: (info, tab) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab!.id! },
              func: function () {
                return prompt('请输入名称（同名覆盖）')
              },
            }, results => {
              this.__saveCookies(results[0]?.result, url)
            })
        },
      }]
    const domain = this.settings.domains[url.host]
    if (domain) {
      const switcher: Menu = { title: '切换', children: [] }
      children.push(switcher)
      forEach(domain.cookies.cookies, (cookie: Cookies, name: string) => {
        const isSelected = domain.cookies.selected == name
        switcher.children!.push({
          title: name,
          type: 'checkbox',
          checked: isSelected,
          click: async (info, tab) => {
            await domain.useCookie(name, cookie)
            await saveData(this.settings)
            await chrome.tabs.reload(tab?.id!)
          },
        })
      })
    }
    return { title: 'Cookie', children }
  }

  async __createUAMenus (url: URL): Promise<Menu> {
    const domain = this.settings.domains[url.host] || new Domain()
    this.settings.domains[url.host] = domain
    const customUA = Object.keys(this.settings.customUA)
    const children: Menu[] = [
      {
        title: '默认',
        type: 'checkbox',
        checked: !domain.ua || !domain.ua?.selected,
        click: (_, tab) => {
          this.__selectUA(domain, null, null)
        },
      },
      ...Object.keys(UA).map(platform => {
        const list = UA[platform]
        return {
          title: platform,
          children: Object.keys(list).map(browser => {
            const uaName = `${platform}_${browser}`
            return {
              title: browser,
              type: 'checkbox',
              checked: uaName == domain.ua?.selected,
              click: (_, tab) => {
                this.__selectUA(domain, uaName, list[browser])
              },
            }
          }),
        }
      }) as Menu[],
      {
        title: '自定义',
        enabled: customUA.length > 0,
        children: customUA.map(name => {
          return {
            title: name,
            type: 'checkbox',
            checked: domain.ua?.selected == name,
            click: (_, tab) => {
              this.__selectUA(domain, name, this.settings.customUA[name])
            },
          }
        }),
      },
    ]
    return { title: '切换User-Agent', children }
  }

  private async __selectUA (
    domain: Domain, name: string | null, value: string | null) {
    domain.useUA(name, value)
    await saveData(this.settings)
    await this.rules.update()
    await chrome.tabs.reload((await getCurrentTab())!.id!)
  }

  async __onWindowsFocusChanged (windowId: number) {
    console.log('__onWindowsFocusChanged', windowId)
    this.updateMenu()
  }

  async __onActivatedTab (activeInfo: chrome.tabs.TabActiveInfo) {
    console.log('__onActivatedTab')
    this.updateMenu()
  }

  async __onUpdatedTab (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
  ) {
    console.log('__onUpdatedTab', changeInfo)
    if (!tab.active) return
    if (changeInfo.status == 'loading') {
      await this.clear()
      await this.updateMenu()
    } else if (changeInfo.status == 'complete') {
      await this.updateMenu()
    }
  }

  __onRemovedTab (
    tabId: number,
    removedInfo: chrome.tabs.TabRemoveInfo,
  ) {
    console.log('__onRemovedTab')
    // this.updateMenu()
  }

  __createMenu (option: Menu): string {
    option.id = option.id || randomString()
    // console.log('menu', option)
    const menuId = chrome.contextMenus.create(
      {
        id: option.id,
        parentId: option.parentId,
        title: option.title,
        documentUrlPatterns: option.urlPattern,
        contexts: option.contexts,
        enabled: option.enabled,
        type: option.type || 'normal',
        checked: option.checked,
      }).toString()
    option.children?.forEach(menu => {
      menu.parentId = menuId
      this.__createMenu(menu)
    })
    this.menus[menuId] = option
    return menuId
  }

  async clear () {
    console.log('清空菜单')
    this.menus = {}
    await new Promise<void>(resolve => {
      chrome.contextMenus.removeAll(() => resolve())
    })
  }

  switch (): any[] {
    return []
  }
}