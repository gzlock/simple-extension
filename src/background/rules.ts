import { forEach } from "lodash-es"
import { Domain } from "../utils/domain"

// 网络规则
export class Rules {

  async update(settings: Settings) {
    const addRules: chrome.declarativeNetRequest.Rule[] = []
    let id = 1
    forEach(settings.domains, (domainData: Domain, domain: string) => {
      if (!domainData.ua?.value) return
      addRules.push({
        id,
        priority: 1,
        condition: {
          urlFilter: `*://${domain}*`,
          resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
        },
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "user-agent",
              operation: "set",
              value: domainData.ua!.value!,
            },
          ],
        },
      })
      id++
    })
    // console.log('最终网络规则', addRules)
    const previousRules = await chrome.declarativeNetRequest.getDynamicRules()
    // 收集旧规则的id
    const removeRuleIds = previousRules.map(rule => rule.id)
    // 删除旧规则
    // await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds })
    // 添加新的规则
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds,addRules })
  }
}