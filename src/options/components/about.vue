<template>
  <div>
    <div>
      <h2>{{ ui.extensionName }} v{{ version }}</h2>
      <div>
        <el-divider content-position="left" border-style="dashed">
          <el-link type="primary" href="https://github.com/gzlock/simple-extension" target="_blank">
            {{ ui.github_link }}
          </el-link>
        </el-divider>
        <el-divider content-position="left" border-style="dashed">
          <el-link type="primary" href="https://gzlock.github.io/simple-extension" target="_blank">
            {{ ui.privacy_policy }}
          </el-link>
        </el-divider>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'about',
  data () {
    return {
      version: chrome.runtime.getManifest().version,
    }
  },
  computed: { ...mapState(['ui']) },
}
</script>

<style scoped>
</style>