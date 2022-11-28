<template>
  <div class="container">
    <el-tabs type="border-card" v-model="tab">
      <el-tab-pane :label="ui.domain" name="cookie" :lazy="true">
        <domains/>
      </el-tab-pane>
      <el-tab-pane :label="ui.ua" name="ua" :lazy="true">
        <ua/>
      </el-tab-pane>
      <el-tab-pane :label="ui.data" name="data" :lazy="true">
        <data-editor/>
      </el-tab-pane>
      <el-tab-pane :label="ui.about" name="about" :lazy="true">
        <about/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import Ua from './ua.vue'
import { mapActions, mapState } from 'vuex'
import Domains from './domainTab.vue'
import About from './about.vue'
import DataEditor from './dataEditor.vue'

export default {
  components: { DataEditor, About, Domains, Ua },
  data () {
    return {
      tab: 'cookie',
    }
  },
  async beforeMount () {
    document.title = `${chrome.i18n.getMessage('options_title')} v${chrome.runtime.getManifest().version}`
    this.hash()
    await this.load()
    // window.addEventListener('hashchange', () => {
    //   this.hash()
    // })
  },
  watch: {
    tab (val: any) {
      window.location.hash = val
    },
  },
  computed: { ...mapState((['ui'])) },
  methods: {
    ...mapActions([
      'load',
      'save',
      'clear',
    ]),
    hash () {
      const hash = window.location.hash.replace('#', '')
      let tab = ['cookie', 'ua', 'data', 'about'].includes(hash) ? hash : 'cookie'
      console.log('tab', tab)
      this.tab = tab
    },
  },
}
</script>
<style scoped>
.container {
  margin: 0 20px;
  min-width: 800px;
}
</style>