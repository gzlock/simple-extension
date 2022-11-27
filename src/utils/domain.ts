import pick from 'lodash-es/pick'
import { isArray, reduce } from 'lodash-es'

export class Cookies {
  name: string
  value: chrome.cookies.Cookie[]

  constructor (name: string, value: any) {
    this.name = name
    this.value = value
  }

  toJSON = (): any => ({ name: this.name, value: this.value })

  static fromJSON (map: any) {
    return new Cookies(map['name'], map['value'])
  }
}

export class Domain {
  selected?: string
  ua?: DomainUA
  cookies: DomainCookies

  constructor ({
    selected,
    ua,
    cookies,
  }: { selected?: string, ua?: DomainUA, cookies?: DomainCookies } = {}) {
    this.selected = selected
    this.ua = ua
    this.cookies = cookies || {}
  }

  async useCookie (cookie: Cookies) {
    this.selected = cookie.name
    for (const _cookie of cookie.value) {
      let domain = _cookie.domain
      if (domain.indexOf('.') === 0)
        domain = domain.slice(1)
      const url = `https://${domain}${_cookie.path}`
      console.log('填充cookies', _cookie.name, url)
      await chrome.cookies.remove(
        { name: _cookie.name, url })
      await chrome.cookies.set(
        {
          domain: _cookie.domain,
          name: _cookie.name,
          value: _cookie.value,
          expirationDate: _cookie.expirationDate,
          path: _cookie.path,
          httpOnly: _cookie.httpOnly,
          url,
        })
    }
  }

  useUA (selected: string | null, value: string | null) {
    if (selected == null || value == null) {
      this.ua = undefined
    } else {
      this.ua = { selected, value }
    }
  }

  toJSON (): any {
    const cookies: any = {}
    Object.keys(this.cookies).forEach(name => {
      cookies[name] = this.cookies[name].toJSON()
    })
    const data: any = {
      selected: this.selected,
      cookies,
    }
    if (this.ua) data['ua'] = this.ua
    return data
  }

  static fromJSON (data: any) {
    return new Domain({
      selected: data['selected'],
      ua: data['ua'],
      cookies: reduce(data['cookies'],
        (result: { [name: string]: Cookies }, value, name) => {
          if (isArray(value)) {
            // v0.9.0之前的旧版
            result[name] = new Cookies(name, value)
          } else {
            //新版
            result[name] = Cookies.fromJSON(value)
          }
          return result
        }, {}),
    })
  }
}

export async function getCookies (url: string): Promise<chrome.cookies.Cookie[]> {
  const cookies = await chrome.cookies.getAll({ url })
  const results: any[] = []
  for (let i = 0; i < cookies.length; i++) {
    results.push(pick(cookies[i],
      ['domain', 'name', 'value', 'path', 'httpOnly', 'expirationDate']))
  }
  return results
}