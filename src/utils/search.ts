export class SearchItem {
  readonly name: string
  readonly url: string
  readonly domain: string
  readonly searchKey: string

  constructor (name: string, url: string) {
    this.name = name
    this.url = url
    const _url = new URL(url)
    this.domain = _url.hostname
    let _searchKey: string | undefined
    for (const kv of _url.searchParams) {
      if (kv[1] == '%s') {
        _searchKey = kv[0]
        break
      }
    }
    if (!_searchKey)
      throw new Error('无效的搜索网址(缺少%s)')
    this.searchKey = _searchKey!
  }

  public toJson = () => ({
    url: this.url,
    name: this.name,
  })

  public toString = () => JSON.stringify(this.toJson())

  static fromString (json: string): SearchItem {
    return SearchItem.fromJson(JSON.parse(json))
  }

  static fromJson (map: { name: string, url: string }): SearchItem {
    return new SearchItem(map['name'], map['url'])
  }
}