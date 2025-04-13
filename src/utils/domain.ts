import { fillCookies } from "./cookies"

export class Domain {
  ua?: DomainUA
  cookies: DomainCookies

  constructor({
    ua,
    cookies,
  }: { ua?: DomainUA, cookies?: DomainCookies } = {}) {
    this.ua = ua
    this.cookies = cookies || { selected: undefined, cookies: {} }
  }

  async useCookie(name: string, cookies: Cookies) {
    this.cookies.selected = name
    await fillCookies(cookies)
  }

  useUA(selected?: string, value?: string) {
    console.log('设置ua', selected, value);

    if (!selected || !value) {
      this.ua = undefined
    } else {
      this.ua = { selected, value }
    }
  }

  toJSON(): any {
    const data: any = {
      cookies: this.cookies,
    }
    if (this.ua) data["ua"] = this.ua
    return data
  }

  static fromJSON(data: any) {
    return new Domain({
      ua: data["ua"],
      cookies: data["cookies"],
    })
  }
}