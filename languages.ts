import * as path from 'path'
import { writeFileSync } from 'fs'

// 用于生成多国语言文件

const languages: { [key: string]: string[] } = {
  'extensionName': ['Simple Extension', '简易扩展'],
  'extensionDesc': [
    'Let each website can save/switch cookies, switch User-Agent ',
    '让每个网站都可以保存/切换Cookies、切换User-Agent。'],
  'add': ['Add', '添加'],
  'default': ['Default', '默认'],
  'prompt_save_cookies': [
    'Please enter a name for cookies\nThe same name will be overwrite\nSupport Emoji',
    '请输入要保存的名称\n同名将会覆盖，支持Emoji字符',
  ],
  'remove_domain': ['Remove [%s] domain data?', '删除[%s]域名数据?'],
  'remove_cookies': ['Remove %s ?', '删除 %s ?'],
  'name': ['Name', '名称'],
  'value': ['Value', '值'],
  'action': ['Action', '操作'],
  'data': ['Data', '数据'],
  'domain': ['Domain', '域名'],
  'ua': ['User-Agent'],
  'current_ua': ['Current User-Agent', '当前的User-Agent'],
  'default_ua': ['Browser Default User-Agent', '浏览器默认User-Agent'],
  'about': ['About', '关于'],
  'options_title': ['Simple Extension Manager', '简易扩展的管理器'],
  'add_ua': ['Add a new custom User-Agent', '添加自定义User-Agent'],
  'custom_ua': ['Custom', '自定义'],
  'switch_cookie': ['Switch cookie', '切换Cookie'],
  'switch_ua': ['Switch User-Agent', '切换User-Agent'],
  'hint_name': ['Input name', '输入名称'],
  'hint_value': ['Input value', '输入值'],
  'empty': ['Empty', '没有数据'],
  'import': ['Import', '导入'],
  'use': ['Use', '使用'],
  'used': ['Used', '已在使用中'],
  'cookies': ['Cookies', 'Cookies'],
  'reset': ['Reset', '重置'],
  'import_success': ['Import Success', '成功导入'],
  'import_fail': ['Fail: not a json data format', '不是JSON格式，导入失败'],
  'github_link': ['Github Link', 'Github 链接'],
  'save_cookie': ['Save Cookies', '保存Cookies'],
  'save_but_empty': ['Save(but %s no cookies)', '保存(%s没有Cookies)'],
  'switch': ['Switch', '切换'],
}

const dir: string[] = ['public/_locales', 'dist/_locales']

async function create (language: 'en' | 'zh_CN') {
  const data: { [key: string]: { message: string } } = {}
  const index = language == 'en' ? 0 : 1
  const importText: string[] = []
  Object.keys(languages).forEach(key => {
    data[key] = { message: languages[key][index] || languages[key][0] }
    importText.push(`${key}: chrome.i18n.getMessage('${key}')`)
  })
  for (let i = 0; i < dir.length; i++) {
    const file = path.join(__dirname, dir[i], language, 'messages.json')
    writeFileSync(file, JSON.stringify(data, null, 2))
  }

  writeFileSync(path.join(__dirname, 'copy_to_store.ts.txt'),
    importText.join(',\n'))
}

Promise.all([create('en'), create('zh_CN')])

export default {}