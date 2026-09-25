import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useGameStore, STORAGE_KEY } from './stores/game'
import './style.css'

const app = createApp(App)
app.use(createPinia())

const gameStore = useGameStore()
gameStore.$subscribe((_mutation, state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The game remains usable if storage is unavailable or full.
  }
}, { detached: true })

app.mount('#app')
