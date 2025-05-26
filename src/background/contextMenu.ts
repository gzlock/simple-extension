import { forEach, isEmpty } from "lodash-es"
import randomString from "src/utils/randomString"
import { UA } from "src/utils/ua"
import { ui } from "src/utils/ui"
import sleep from "src/utils/sleep"
import { clearTabCookies } from "src/utils/cookies"

const urlPattern: string[] = ["http://*/*", "https://*/*"]

export class ContextMenu {
  public settings?: Settings
  public tab?: chrome.tabs.Tab
  private rootMenuId?: string
  private menus: { [key: string]: Menu } = {}
  public onChanged?: () => void

  /**
   * 添加Listener
   */
  addListeners() {
    chrome.contextMenus.onClicked.addListener(this.onClickListener.bind(this))
    chrome.tabs.onUpdated.addListener(this.clear.bind(this))
    chrome.tabs.onRemoved.addListener(this.clear.bind(this))
    chrome.tabs.onActivated.addListener(this.clear.bind(this))
    chrome.windows.onFocusChanged.addListener(this.clear.bind(this))
  }

  /**
   * 清理上面添加的Listener
   */
  removeListeners() {
    chrome.contextMenus.onClicked.removeListener(this.onClickListener.bind(this))
    chrome.tabs.onUpdated.removeListener(this.clear.bind(this))
    chrome.tabs.onRemoved.removeListener(this.clear.bind(this))
    chrome.tabs.onActivated.removeListener(this.clear.bind(this))
    chrome.windows.onFocusChanged.removeListener(this.clear.bind(this))
  }


  /**
   * 点击菜单
   * @param info
   * @param tab
   */
  private onClickListener(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ) {
    // console.log("点击菜单", this.menus[info.menuItemId])
    this.menus[info.menuItemId]?.click?.call(this, info, tab)
  }

  async updateMenu(options: BgMsgOptions) {
    // console.log("updateMenu", options)
    await this.clear()
    if (!options.url || !options.url.startsWith("http")) {
      return
    }
    await this.createRootMenu(options)
  }

  /**
   * clear all menu items
   */
  async clear() {
    // console.log('清空菜单')
    this.menus = {}
    return new Promise<void>((resolve) => {
      chrome.contextMenus.removeAll(() => resolve())
    })
  }

  private async createRootMenu(options: BgMsgOptions) {
    const url = new URL(options.url)
    if (!url.host) return
    const menuChildren: Menu[] = []

    // 图片
    if (options.imgUrl) {
      this.rootMenuId = this.createMenu({
        contexts: ["all"],
        title: ui.open_image_in_new_tab,
        click: (info, tab) => {
          if (tab) {
            chrome.tabs.create({
              index: tab.index + 1,
              url: options.imgUrl!,
              windowId: tab.windowId,
            })
          }
        },
      })
    }
    // 页面
    else {
      const res: Array<Menu[]> = await Promise.all([
        await this.createCookieMenus(url),
        await this.createUAMenus(url, options.tab),
      ])
      if (res[0]) {
        if (menuChildren.length > 0) {
          menuChildren.push({ type: "separator" })
        }
        menuChildren.push(...res[0])
      }
      if (res[1]) {
        menuChildren.push({ type: "separator" })
        menuChildren.push(...res[1])
      }

      // console.log("创建菜单", menuChildren)
      this.rootMenuId = this.createMenu({
        title: url.host,
        urlPattern,
        contexts: ["page", "frame", "image"],
        children: menuChildren,
      })
    }
  }

  private createMenu(option: Menu): string {
    option.id = option.id ?? randomString()
    const menuId = chrome.contextMenus
      .create({
        id: option.id,
        parentId: option.parentId,
        title: option.title,
        contexts: option.contexts ?? ["all"],
        enabled: option.enabled,
        type: option.type ?? "normal",
        checked: option.checked,
      } as chrome.contextMenus.CreateProperties)
      .toString()
    option.children?.forEach((menu) => {
      menu.parentId = menuId
      this.createMenu(menu)
    })
    this.menus[menuId] = option
    return menuId
  }

  private async createCookieMenus(url: URL): Promise<Menu[]> {
    const menus: Menu[] = [
      /**
       * 保存Cookies
       */
      {
        title: ui.save_cookie,
        click: async (info, tab) => {
          // const cookies = await getCookies(url.toString())
          const cookies = await getCookies2(tab!.id!)
          // console.log("获取到cookies", tab!.id, cookies.length)
          if (cookies.length === 0) {
            chrome.scripting.executeScript({
              target: { tabId: tab!.id! },
              func: function (str: string) {
                alert(str.replace("%s", window.location.host))
              },
              args: [ui.alert_cookies_empty],
            })
          } else {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab!.id! },
              func: function (str: string) {
                return prompt(str)
              },
              args: [ui.prompt_save_cookies],
            })
            const name = results[0]?.result
            if (!name || isEmpty(name)) return

            const host = url.hostname
            const domain = this.settings!.domains[host] || new Domain()
            this.settings!.domains[host] = domain
            domain.cookies.selected = name
            domain.cookies.cookies[name] = cookies
            this.save()
          }
        },
      },
      /**
       * 清空Cookies
       */
      {
        title: ui.menu_clear_domain_cookies,
        click: async (info, tab) => {
          const results: any[] = await chrome.scripting.executeScript({
            target: { tabId: tab!.id! },
            func: function (str: string) {
              return confirm(str.replace("%s", window.location.host))
            },
            args: [ui.confirm_clear_domain_cookies],
          })
          const isSure = results[0].result as boolean
          if (isSure) {
            await clearTabCookies(tab!)
            chrome.tabs.reload(tab!.id)
          }
        },
      },
    ]
    /**
     * 选择cookies
     */
    const domain = this.settings!.domains[url.host]
    if (domain) {
      forEach(domain.cookies.cookies, (cookie: Cookies, name: string) => {
        const isSelected = domain.cookies.selected == name
        menus.push({
          title: name,
          type: "checkbox",
          checked: isSelected,
          click: async (info, tab) => {
            await domain.useCookie(name, cookie)
            await clearTabCookies(tab!)
            this.save(tab)
          },
        })
      })
    }
    return menus
  }

  private async createUAMenus(
    url: URL,
    tab?: chrome.tabs.Tab,
  ): Promise<Menu[]> {
    const domain = this.settings!.domains[url.host] || new Domain()
    this.settings!.domains[url.host] = domain
    const customUA = Object.keys(this.settings!.customUA)
    return [
      {
        title: ui.default_ua,
        type: "checkbox",
        checked: !domain.ua?.selected,
        click: (_, tab) => {
          this.selectUA({ tab, domain })
        },
      },
      ...(Object.keys(UA).map((platform) => {
        const list = UA[platform]
        return {
          title: platform,
          children: Object.keys(list).map((browser) => {
            const uaName = `${platform}_${browser}`
            return {
              title: browser,
              type: "checkbox",
              checked: uaName == domain.ua?.selected,
              click: (_, tab) => {
                this.selectUA({
                  tab,
                  domain,
                  name: uaName,
                  value: list[browser],
                })
              },
            }
          }),
        }
      }) as Menu[]),
      {
        title: chrome.i18n.getMessage("custom_ua"),
        enabled: customUA.length > 0,
        children: customUA.map((name) => {
          return {
            title: name,
            type: "checkbox",
            checked: domain.ua?.selected == name,
            click: (_, tab) => {
              this.selectUA({
                tab,
                domain,
                name,
                value: this.settings!.customUA[name],
              })
            },
          }
        }),
      },
    ]
  }

  private async selectUA(options: {
    tab?: chrome.tabs.Tab
    domain: Domain
    name?: string
    value?: string
  }) {
    const { tab, domain, name, value } = options
    domain.useUA(name, value)
    this.save(tab)
  }

  private async save(tab?: chrome.tabs.Tab) {
    this.onChanged?.()
    if (tab) {
      await sleep(100)
      chrome.tabs.reload(tab.id!)
    }
  }
}
