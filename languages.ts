import * as path from "node:path"
import { mkdir, writeFile } from "node:fs/promises"

// use deno
// create the chrome i18n format text file

const languages: { [key: string]: string[] } = {
  "extensionName": ["Simple Extension", "简易扩展"],
  "extensionDesc": [
    "Let each website can save/switch cookies, switch User-Agent",
    "让每个网站都可以保存/切换Cookies、切换User-Agent。",
  ],
  "add": ["Add", "添加"],
  "default": ["Default", "默认"],
  "prompt_save_cookies": [
    "Save current cookies as：\n(The same name will be overwrite)",
    "将当前Cookies保存为：\n（同名将会覆盖）",
  ],
  "remove_domain": ["Remove [%s] domain data?", "删除[%s]域名数据?"],
  "remove_cookies": ["Remove %s ?", "删除 %s ?"],
  "delete": ["Delete", "删除"],
  "name": ["Name", "名称"],
  "value": ["Value", "值"],
  "action": ["Action", "操作"],
  "data": ["Data", "数据"],
  "domain": ["Domain", "域名"],
  "ua": ["User-Agent"],
  "current_ua": ["Current User-Agent", "当前的User-Agent"],
  "default_ua": ["Browser Default User-Agent", "浏览器默认User-Agent"],
  "about": ["About", "关于"],
  "options_title": ["Simple Extension Manager", "简易扩展的管理器"],
  "add_ua": ["Add a new custom User-Agent", "添加自定义User-Agent"],
  "custom_ua": ["Custom", "自定义"],
  "cookies_action": ["Action", "操作"],
  "switch_ua": ["Switch User-Agent", "切换User-Agent"],
  "hint_name": ["Input name", "输入名称"],
  "hint_value": ["Input value", "输入值"],
  "empty": ["Empty", "没有数据"],
  "import": ["Import", "导入"],
  "use": ["Use", "使用"],
  "used": ["Used", "已在使用中"],
  "cookies": ["Cookies", "Cookies"],
  "reset": ["Reset", "重置"],
  "import_success": ["Import Success", "成功导入"],
  "import_fail": ["Fail: not a json data format", "不是JSON格式，导入失败"],
  "github_link": [
    "Simple Extension's Github repository",
    "简易扩展的Github代码仓库链接",
  ],
  "save_cookie": ["Save Cookies", "保存Cookies"],
  "save_but_empty": ["Save(but %s no cookies)", "保存(%s没有Cookies)"],
  "switch": ["Switch", "切换"],
  "search_domain": ["Search domain", "搜索域名"],
  "search_domain_hint": ["Input keyword", "输入搜索内容"],
  "cookies_content": [
    "%s contains the following content (it is normal to have a third-party domain):",
    "%s 有以下内容（有第三方域名的内容是正常的）："
  ],
  "privacy_policy": [
    "Simple Extension's Privacy Policy(Chinese)",
    "简易扩展的隐私政策说明"
  ],
  "open_image_in_new_tab": [
    "Open image in new tab",
    "在新标签页中打开图片"
  ],
  "alert_cookies_empty": [
    "%s has no cookies",
    "%s 没有Cookies"
  ],
  "confirm_reset_ua": [
    "Are you sure you want to reset User-Agent?",
    "确定重置User-Agent？"
  ],
  "confirm_delete_custom_ua": [
    "Are you sure you want to delete User-Agent %s?",
    "确定删除User-Agent %s？"
  ],
  "tab_title_custom_ua": [
    'Custom User-Agent',
    '自定义User-Agent'
  ],
  "alert_title_not_empty": [
    "The name cannot be empty",
    "名称不能为空"
  ],
  "alert_value_not_empty": [
    "The value cannot be empty",
    "值不能为空"
  ],
  "menu_clear_domain_cookies": [
    "Clear Cookies",
    "清除Cookies",
  ],
  "modify": [
    "Modify",
    "修改",
  ],
  "dialog_modify_ua_title": [
    "Modify User-Agent",
    "修改User-Agent",
  ],
  "confirm_clear_domain_cookies": [
    "Are you sure you want to clear all cookies of current domain?\nIt will not affect the saved Cookies.",
    "确定清除当前域名的所有Cookies？\n不会影响已经保存的Cookies。",
  ],
  "confirm_duplicate_and_cover": [
    "User-Agent name already exists, overwrite it?",
    "User-Agent名称已经存在，点击确定将会覆盖",
  ]
}

const dir: string[] = [
  "_locales",
  "dist/chrome/_locales",
  "dist/firefox/_locales",
]

//@ts-expect-error: for bun js code
const currentDir: string = import.meta.dirname

async function create(language: "en" | "zh_CN") {
  const data: { [key: string]: { message: string } } = {}
  const index = language == "en" ? 0 : 1
  const importText: string[] = []
  Object.keys(languages).forEach(key => {
    data[key] = { message: languages[key][index] || languages[key][0] }
    importText.push(`${key}: chrome.i18n.getMessage('${key}')`)
  })
  // console.log("dir", dir)
  for (let i = 0; i < dir.length; i++) {
    const folder = path.join(currentDir, dir[i], language)
    // console.log("创建文件夹", folder)
    await mkdir(folder, { recursive: true })
    const file = path.join(currentDir, dir[i], language, "messages.json")
    // console.log("file", file)

    await writeFile(file, JSON.stringify(data, null, 2))
  }

  await writeFile(path.join(currentDir, "src", "utils", "ui.ts"),
    `export const ui = {\n  ${importText.join(",\n  ")}\n}`)
}

Promise.all([
  create("en"),
  create("zh_CN"),
])
