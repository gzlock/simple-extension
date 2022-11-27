import QueryInfo = chrome.tabs.QueryInfo

export async function getCurrentTab (): Promise<chrome.tabs.Tab | undefined> {
  let queryOptions: QueryInfo = { active: true, currentWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let tabs = await chrome.tabs.query(queryOptions)
  return tabs[0]
}