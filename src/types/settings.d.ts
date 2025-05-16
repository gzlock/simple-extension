import * as types from '../types';

export { }

declare global {

  type Domains = types.Domains

  type Settings = types.Settings

  type DomainUA = types.DomainUA


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

  type Cookies = types.Cookies
  type DomainCookies = types.DomainCookies

  interface BgMsgOptions {
    action: "update" | "updateContextMenu" | "loadSettings" | "setSettings" | "settingsChanged",
    url: string,
    imgUrl?: string,
    tab?: chrome.tabs.Tab,
    settings?: Settings
  }
}


