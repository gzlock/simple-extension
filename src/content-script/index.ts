// This import scss file is used to style the iframe that is injected into the page
// import "./index.scss"
// import { name } from "~/package.json"

// const src = chrome.runtime.getURL("src/ui/content-script-iframe/index.html")
//
// const iframe = new DOMParser().parseFromString(
//   `<iframe class="crx-iframe ${name}" src="${src}" title="${name}"></iframe>`,
//   "text/html",
// ).body.firstElementChild
//
// if (iframe) {
//   document.body?.append(iframe)
// }

self.onerror = function(message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

// console.info("hello world from content-script")


document.addEventListener("mousedown", (e: MouseEvent) => {
  if (e.button == 2) {
    const msg: BgMsgOptions = { action: "updateContextMenu", url: window.location.href }
    if (e.target instanceof Element && e.target.tagName.toLowerCase() === "img") {
      const img = e.target as HTMLImageElement
      if (img.complete
        && img.naturalWidth === 0
      ) {
        msg.imgUrl = img.src
      }
    }
    chrome.runtime.sendMessage(msg)
  }
})