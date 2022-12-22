import ResourceType = chrome.declarativeNetRequest.ResourceType
import Rule = chrome.declarativeNetRequest.Rule
import RuleActionType = chrome.declarativeNetRequest.RuleActionType
import HeaderOperation = chrome.declarativeNetRequest.HeaderOperation
import { loadData } from '../utils/data'
import { forEach } from 'lodash-es'
import { Domain } from '../utils/domain'

// 网络规则
export class Rules {
  constructor () {
    this.update()
  }

  async update () {
    return this.updateFromData(await loadData())
  }

  async updateFromData (data: Settings) {
    const rules: Rule[] = []
    let id = 1
    forEach(data.domains, (domainData: Domain, domain: string) => {
      if (!domainData.ua?.value) return
      rules.push({
        id,
        priority: 1,
        condition: {
          urlFilter: `*://${domain}*`,
          resourceTypes: [ResourceType.MAIN_FRAME],
        },
        action: {
          type: RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: 'user-agent',
              operation: HeaderOperation.SET,
              value: domainData.ua!.value!,
            },
          ],
        },
      })
      id++
    })
    // console.log('最终网络规则', rules)
    chrome.declarativeNetRequest.getDynamicRules(previousRules => {
      // 收集旧规则的id
      const previousRuleIds = previousRules.map(rule => rule.id)

      // 删除旧规则的id
      // 同时
      // 添加新的规则
      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: previousRuleIds,
          addRules: rules,
        })
    })
  }
}