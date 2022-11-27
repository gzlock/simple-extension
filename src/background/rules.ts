import ResourceType = chrome.declarativeNetRequest.ResourceType
import Rule = chrome.declarativeNetRequest.Rule
import RuleActionType = chrome.declarativeNetRequest.RuleActionType
import HeaderOperation = chrome.declarativeNetRequest.HeaderOperation
import { loadData } from '../utils/data'
import { forEach } from 'lodash-es'
import { Domain } from '../utils/domain'

export class Rules {
  constructor () {
    this.update()
  }

  async update () {
    const data = await loadData()
    const rules: Rule[] = []
    let id = 1
    forEach(data.domains, (domainData: Domain, domain) => {
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
    console.log('最终网络规则', rules)
    chrome.declarativeNetRequest.getDynamicRules(previousRules => {
      const previousRuleIds = previousRules.map(rule => rule.id)
      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: previousRuleIds,
          addRules: rules,
        })
    })
  }
}