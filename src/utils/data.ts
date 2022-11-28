import { Domain } from './domain'
import { forEach } from 'lodash-es'

export async function loadData (): Promise<Settings> {

  // @ts-ignore
  const data: Settings = await chrome.storage.local.get()

  const domains: Domains = {}
  if (data) {
    forEach(data.domains, (data, domain) => {
      domains[domain] = Domain.fromJSON(data)
    })
  }
  console.log('data.ts', 'loadData', data)
  return {
    config: data?.config,
    domains: domains,
    customUA: data.customUA ?? {},
  }
}

export async function saveData ({
  customUA,
  domains,
}: Settings) {
  domains = JSON.parse(JSON.stringify(domains))
  const _domains: any = {}
  Object.keys(domains).forEach(domain => {
    _domains[domain] = domains[domain]
  })
  const data = {
    config: { version: chrome.runtime.getManifest().version },
    customUA,
    domains: _domains,
  }
  console.log('data.ts', 'saveData', data)
  await chrome.storage.local.set(data)
}

export function clearData () {
  return chrome.storage.local.clear()
}