import { Domain } from "../utils/domain";

export async function fillCookies(
    domain: Domain
) {
    if (!domain) return;
    const selected = domain.cookies.selected;
    if (!selected) return;
    const cookies = domain.cookies.cookies[selected];
    if (!cookies) return;

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const protocol = cookie.secure ? 'https:' : 'http:';
        const domain = cookie.domain.replace(/^\./, '');
        const url = `${protocol}//${domain}${cookie.path}`;
        try {
            await chrome.cookies.set({ ...cookie, url, secure: true });
            // console.log('设置cookie 成功', url, cookie.name, cookie.value);
        } catch (e) {
            // console.error('设置cookie 失败', url, cookie.name, cookie.value, e);
        }

    }
}