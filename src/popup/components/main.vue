<template>
  <div>
    {{ url }}
    <textarea class="pre" v-model="json"></textarea>
    <div class="mini ui buttons">
      <button @click="save" class="ui red basic button">保存</button>
      <button @click="load" class="ui blue basic button">读取</button>
      <button @click="sureClear" class="ui green basic button">清空</button>
    </div>
    <div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations } from 'vuex'
import { getCurrentTab } from '../../utils/getTab.js'
import ChangeSearch from './changeSearch.vue'

enum State {
  unknow,
  create,
  switch,
}

export default {
  name: 'main.vue',
  components: { ChangeSearch },
  data () {
    return {
      state: State.unknow,
      tabId: '',
      url: '',
      json: '',
    }
  },
  methods: {
    ...mapActions([
      'load',
      'clear',
    ]),
    async save () {
      const value = JSON.parse(this.json)
      console.log('保存', value)
      await chrome.storage.local.set(value)
      await chrome.runtime.sendMessage('update')
      alert('保存成功')
    },
    sureClear () {
      if (confirm('确认清空数据？')) this.clear()
    },
  },
  computed: {
    urlAvailable (): boolean {
      return this.url.startsWith('http')
    },
    ...mapMutations(['isContainDomain']),
  },
  async beforeMount () {
    const tab = await getCurrentTab()
    this.tabId = tab.id!.toString()
    this.url = tab.url!
    console.log('popup.html', 'tab id', this.tabId, this.url)
    await this.load()
    this.json = JSON.stringify(this.$store.state, null, 2)
  },
}
</script>


<style scoped>
.pre {
  font-size: 12px;
  width: 100%;
  height: 100px;
  overflow: scroll;
  white-space: pre-wrap;
  word-break: break-word;

}
</style>