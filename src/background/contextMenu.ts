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
    console.log('创建Menu class')
    this.rules = rules
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      // console.log('点击了菜单', this.menus[info.menuItemId])
      this.menus[info.menuItemId]?.click?.call(this, info, tab)
    })
    sleep(100).then(() => {
      chrome.tabs.onUpdated.addListener(this.__loadData.bind(this))
      chrome.tabs.onRemoved.addListener(this.__loadData.bind(this))
      chrome.tabs.onActivated.addListener(this.__loadData.bind(this))
      chrome.windows.onFocusChanged.addListener(this.__loadData.bind(this))

      // chrome.tabs.onUpdated.addListener(this.__onUpdatedTab.bind(this))
      // chrome.tabs.onRemoved.addListener(this.__onRemovedTab.bind(this))
      // chrome.tabs.onActivated.addListener(this.__onActivatedTab.bind(this))
      // chrome.windows.onFocusChanged.addListener(
      //   this.__onWindowsFocusChanged.bind(this)
      // )

    })
  }

  async __loadData () {
    this.settings = await loadData()
  }

  async updateMenu (tab: chrome.tabs.Tab) {
    console.log('updateMenu', tab.url)
    await this.clear()
    if (!tab.url || !tab.url.startsWith('http')) {
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

    const urlPattern: string[] = []
    if (url.host) {
      urlPattern.push(`http://${url.host}/*`)
      urlPattern.push(`https://${url.host}/*`)
    }

    this.rootMenuId = this.__createMenu({
      title: url.host,
      urlPattern,
      children: [
        ...(await this.__createCookieMenus(url)),
        { type: 'separator' },
        ...(await this.__createUAMenus(url)),
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
  }

  private async __createCookieMenus (url: URL): Promise<Menu[]> {
    const menus: Menu[] = [
      {
        title: chrome.i18n.getMessage('save_cookie'),
        click: async (info, tab) => {
          const cookies = await getCookies(url.toString())
          if (cookies.length == 0) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab!.id! },
                func: function () {
                  const str = chrome.i18n.getMessage('alert_cookies_empty')
                  const host = window.location.host
                  alert(str.replace('%s', host))
                },
              })
          } else {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab!.id! },
                func: function () {
                  return prompt(chrome.i18n.getMessage('prompt_save_cookies'))
                },
              }, results => {
                this.__saveCookies(results[0]?.result, url)
              })
          }
        },
      }]

    const domain = this.settings.domains[url.host]
    if (domain) {
      forEach(domain.cookies.cookies, (cookie: Cookies, name: string) => {
        const isSelected = domain.cookies.selected == name
        menus.push({
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
    return menus
  }

  async __createUAMenus (url: URL): Promise<Menu[]> {
    const domain = this.settings.domains[url.host] || new Domain()
    this.settings.domains[url.host] = domain
    const customUA = Object.keys(this.settings.customUA)
    return [
      {
        title: chrome.i18n.getMessage('default_ua'),
        type: 'checkbox',
        checked: !domain.ua?.selected,
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
        title: chrome.i18n.getMessage('custom_ua'),
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
  }

  private async __selectUA (
    domain: Domain, name: string | null, value: string | null) {
    domain.useUA(name, value)
    await Promise.all([
      saveData(this.settings),
      this.rules.updateFromData(this.settings),
    ])
    await sleep(10)
    await chrome.tabs.reload((await getCurrentTab())!.id!)
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
    // console.log('清空菜单')
    this.menus = {}
    await new Promise<void>(resolve => {
      chrome.contextMenus.removeAll(() => resolve())
    })
  }

  switch (): any[] {
    return []
  }

  loadData () {
    return this.__loadData()
  }
}