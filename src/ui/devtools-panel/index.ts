
import { notivue } from "src/utils/notifications"
import { appRouter } from "src/utils/router"
import { createApp } from "vue"
import App from "./app.vue"
import "./index.scss"

appRouter.addRoute({
  path: "/",
  redirect: "/devtools-panel",
})

const app = createApp(App).use(notivue).use(appRouter)

app.mount("#app")

export default app

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}
