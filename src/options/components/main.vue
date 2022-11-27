<template>
  <div class="container">
    <el-tabs type="border-card" v-model="tab">
      <el-tab-pane label="管理域名" name="cookie" :lazy="true" class="pane">
        <domains/>
      </el-tab-pane>
      <el-tab-pane label="管理自定义UA" name="ua" :lazy="true" class="pane">
        <ua/>
      </el-tab-pane>
      <el-tab-pane label="数据" name="data" :lazy="true" class="pane">
        <data-editor/>
      </el-tab-pane>
      <el-tab-pane label="关于" name="about" :lazy="true" class="pane">
        <about/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">

import Ua from './ua.vue'
import { mapActions } from 'vuex'
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
    document.title += ` v${chrome.runtime.getManifest().version}`
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
  width: 800px;
}
.pane{
  max-height: 800px;
  overflow: auto;
}
</style>