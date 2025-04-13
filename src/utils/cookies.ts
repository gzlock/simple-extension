import { uniq, pick } from "lodash-es"

export async function fillCookies(cookies: Cookies) {
  for (const c of cookies) {
    let domain = c.domain
    if (domain.indexOf(".") === 0)
      domain = domain.slice(1)
    const url = `https://${domain}${c.path}`
    // console.log('填充cookies', url, c);
    let secure: boolean = c.secure ?? false
    if (c.name.startsWith("__Secure-") || c.name.startsWith("__Host-")) {
      secure = true
    }
    await chrome.cookies.remove({ name: c.name, url })
    await chrome.cookies.set(
      {
        ...c,
        url,
        secure,
      }).catch(() => {
      // avoid
    })
  }
}

export async function getCookies2(tabId: number): Promise<Cookies> {
  /// 获取tab引用的所有资源实体
  const results = await chrome.scripting.executeScript(
    {
      target: { tabId },
      func: getPerformanceEntries,
    },
  )
  const urls: string[] = results[0].result!

  const origins = urls.map((url) => new URL(url).origin).filter((url) => url !== "null")
  const uniqOrigins = uniq(origins)
  // console.log(`相关url，原${origins.length}，过滤后${uniqOrigins.length}`,
  //     uniqOrigins);

  const cookies: any[] = []
  // const test: { [id: string]: any } = {};
  await Promise.all(
    uniqOrigins.map(origin => chrome.cookies.getAll({ url: origin }))).then((results) => {
    for (const _cookies of results) {
      for (let cookie of _cookies) {
        const _pick = pick(
          cookie,
          [
            "domain",
            "name",
            "value",
            "path",
            "httpOnly",
            "secure",
            "sameSite",
            "expirationDate",
          ],
        )
        // test[_pick.domain] = _pick;
        cookies.push(_pick)
      }
    }
  })
  // console.log('结果', test);

  return cookies
}

export async function getCookies(url: string): Promise<Cookies> {
  const cookies = await chrome.cookies.getAll({ url })
  const results: any[] = []
  for (let i = 0; i < cookies.length; i++) {
    results.push(
      pick(
        cookies[i],
        [
          "domain",
          "name",
          "value",
          "path",
          "httpOnly",
          "expirationDate",
        ],
      ),
    )
  }
  return results
}

/**
 * 使用performance获取与网页关联的所有资源实体所属的链接
 * 来自 https://stackoverflow.com/questions/75426272#76801557
 */
function getPerformanceEntries() {
  return performance.getEntriesByType("resource").map(
    (r) => r.name,
  )
}