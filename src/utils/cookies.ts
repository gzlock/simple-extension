import pick from 'lodash-es/pick'

export async function fillCookies (cookies: Cookies) {
  for (const cookie of cookies) {
    let domain = cookie.domain
    if (domain.indexOf('.') === 0)
      domain = domain.slice(1)
    const url = `https://${domain}${cookie.path}`
    // console.log('填充cookies', cookie.name, url)
    await chrome.cookies.remove({ name: cookie.name, url })
    await chrome.cookies.set({ ...cookie, url })
  }
}

export async function getCookies (url: string): Promise<Cookies> {
  const cookies = await chrome.cookies.getAll({ url })
  const results: any[] = []
  for (let i = 0; i < cookies.length; i++) {
    results.push(pick(cookies[i],
      ['domain', 'name', 'value', 'path', 'httpOnly', 'expirationDate']))
  }
  return results
}