import { createApp } from 'vue'
import App from './components/main.vue'
import { popupKey, popupStore } from '../store'
import 'element-plus/es/components/message/style/css'
import '../style.css'

const app = createApp(App)

app.use(popupStore, popupKey)

app.mount('#app')
