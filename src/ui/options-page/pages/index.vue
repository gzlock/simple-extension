<template>
  <div class="container">
    <el-container>
      <el-main>
        <el-tabs type="border-card" v-model="tab">
          <el-tab-pane :label="ui.domain" name="domain" :lazy="true">
            <domain-list />
          </el-tab-pane>
          <el-tab-pane :label="ui.tab_title_custom_ua" name="ua" :lazy="true">
            <ua-editor />
          </el-tab-pane>
          <el-tab-pane :label="ui.data" name="data" :lazy="true">
            <data-editor />
          </el-tab-pane>
          <el-tab-pane :label="ui.about" name="about" :lazy="true">
            <about />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.container {
  margin: 0 20px;
  min-width: 800px;
}
</style>

<script setup lang="ts">
import domainList from './domainList.vue'
import dataEditor from './dataEditor.vue'
import uaEditor from './uaEditor.vue'
import about from './about.vue'

const tab = "domain"
onBeforeMount(() => {
  document.title = `${ui.options_title} v${chrome.runtime.getManifest().version}`
})
</script>
