import type { ManifestV3Export } from "@crxjs/vite-plugin"
import packageJson from "./package.json" with { type: "json" }

const { version } = packageJson
// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/)

export default {
  author: {
    email: "gzlock88@gmail.com",
  },
  // name: env.mode === "staging" ? `[INTERNAL] ${name}` : displayName || name,
  name: "__MSG_extensionName__",
  description: "__MSG_extensionDesc__",
  incognito: "split",
  default_locale: "en",
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}`,
  // semver is OK in "version_name"
  version_name: version,
  manifest_version: 3,
  content_security_policy: {
    "extension_pages": "script-src 'self'; object-src 'self'",
  },
  // key: '',
  action: {
    // default_popup: "src/ui/action-popup/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      all_frames: true,
      js: ["src/content-script/index.ts"],
      matches: [
        "http://*/*",
        "https://*/*",
      ],
    },
  ],
  // side_panel: {
  //   default_path: "src/ui/side-panel/index.html",
  // },
  // devtools_page: "src/devtools/index.html",
  options_page: "src/ui/options-page/index.html",
  offline_enabled: true,
  host_permissions: [
    "http://*/*",
    "https://*/*",
  ],
  permissions: [
    "contextMenus",
    "tabs",
    "activeTab",
    "cookies",
    "storage",
    "scripting",
    // "declarativeNetRequest",
  ],
  web_accessible_resources: [
    {
      resources: [
        // "src/ui/devtools-panel/index.html",
      ],
      matches: ["<all_urls>"],
    },
  ],
  icons: {
    16: "src/assets/logo.png",
    24: "src/assets/logo.png",
    32: "src/assets/logo.png",
    128: "src/assets/logo.png",
  },
} as ManifestV3Export
