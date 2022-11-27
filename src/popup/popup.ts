import { createApp } from 'vue'
import App from './components/main.vue'
import { popupKey, popupStore } from '../store'

const app = createApp(App)

app.use(popupStore, popupKey)

app.mount('#app')
