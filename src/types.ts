export interface DomainUA {
  selected: string;
  value: string;
}

export type Domains = { [domain: string]: Domain }

export interface DomainCookies {
  selected?: string;
  cookies: {
    [key: string]: Cookies;
  };
}

export type Cookies = chrome.cookies.Cookie[];

export interface Settings {
  config: {
    version: string;
  };
  domains: {
    [key: string]: Domain;
  };
  customUA: {
    [key: string]: string;
  };
}