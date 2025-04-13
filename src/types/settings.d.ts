export { }

declare global {

  type Domains = { [domain: string]: Domain }

  interface Settings {
    config: { version: string }
    domains: Domains
    customUA: { [name: string]: string }
  }

  interface Menu {
    title?: string
    checked?: boolean
    id?: string
    parentId?: string
    contexts?: chrome.contextMenus.ContextType[]
    children?: Menu[]
    urlPattern?: string[]
    enabled?: boolean
    type?: chrome.contextMenus.ItemType,
    click?: (info: ContextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
  }

  interface DomainUA {
    selected: string,
    value: string
  }

  type Cookies = chrome.cookies.Cookie[]

  interface DomainCookies {
    cookies: { [name: string]: Cookies }
    selected?: string
  }

  interface BgMsgOptions {
    action: "update" | "updateContextMenu" | "loadSettings" | "setSettings" | "settingsChanged",
    url: string,
    imgUrl?: string,
    tab?: chrome.tabs.Tab,
    settings?: Settings
  }
}


