type Domains = { [domain: string]: Domain }

interface Settings {
  config: { version: string }
  domains: Domains
  customUA: { [name: string]: string }
}

interface Menu {
  checked?: boolean
  id?: string
  parentId?: string
  title: string
  contexts?: chrome.contextMenus.ContextType[]
  children?: Menu[]
  urlPattern?: string[]
  enabled?: boolean
  type?: chrome.contextMenus.ContextItemType,
  click?: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
}

interface DomainUA {
  selected: string,
  value: string
}

interface Cookies {
  name: string
  value: chrome.cookies.Cookie[]
  toJSON: () => any
}

interface DomainCookies {
  [name: string]: Cookies
}